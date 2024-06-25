import ReactDOM from "react-dom/client";
import zhCN from "antd/locale/zh_CN";
import "dayjs/locale/zh-cn";
import { ConfigProvider, message, Form, Input, Button, Space, Cascader, Select, Spin } from "antd";
import React, { useCallback, useEffect, useState } from "react";
import { handleCallInjectedMethod, handleSelectOption } from "../../utils";
import { createPortal } from "react-dom";
import { parentElLoc } from "../../global";
import styles from "./index.module.less";

/** 定时器 */
let timer: any = null;

/** 侧边栏 */
export const SideBar: React.FC = () => {
  const [form] = Form.useForm();

  const [isShow, setIsShow] = useState(false); // 是否显示侧边栏
  const [customerInfo, setCustomerInfo] = useState<any>({}); // 客户信息
  const [enums, setEnums] = useState<any>(); // 枚举
  const [sources, setSources] = useState<any[]>([]); // 客户来源
  const [countries, setCountries] = useState<any[]>([]); // 国家地区
  const [loading, setLoading] = useState(false); // 加载状态

  /**
   * 显示客户信息侧边栏
   * @param phone 手机号
   */
  const handleShowSideBar = async (phone: string) => {
    setLoading(true);
    const resp = await chrome.runtime.sendMessage({ action: "getCustomerInfo", values: phone });
    setLoading(false);

    if (typeof resp !== "string") {
      setIsShow(true);

      const { customerInfo, choicesEnum, choicesCountrie, customerSources } = resp;
      setEnums(choicesEnum);
      setCountries(choicesCountrie);
      setSources(customerSources);
      setCustomerInfo({ ...customerInfo, whatsApp_phone: phone });
    } else {
      message.error(resp);
    }
  };

  /**
   * 同步聊天记录
   * @param isForce 是否强制同步
   */
  const handleSyncChatHistory = useCallback(async (isForce: boolean = false) => {
    handleCallInjectedMethod(["Chat", "getActive"], [], async (result: any) => {
      const whatsApp_phone = result?.id?.user || "";
      const chat_record = [] as any[];

      result?.msgs?.forEach((msg: any) => {
        const { type, t, to, body, quotedMsg, caption } = msg;

        if (["chat", "document", "image"].indexOf(type) === -1) return;

        const timestamp = t * 1000; // 时间戳

        const record = { sign: `${whatsApp_phone}_${timestamp}`, is_send: to?.user === whatsApp_phone, send_time: timestamp, content: "", quote: quotedMsg?.body || null };

        switch (type) {
          case "chat":
            record.content = body;
            break;
          case "document":
            record.content = `[文档]请在whatsapp上查看`;
            break;
          case "image":
            record.content = `[图片]请在whatsapp上查看${caption ? "\n" + caption : ""}`;
            break;
          case "ptt":
            record.content = `[语音]请在whatsapp上查看`;
            break;
          case "video":
            record.content = `[视频]请在whatsapp上查看${caption ? "\n" + caption : ""}`;
            break;
        }

        chat_record.push(record);
      });

      const resp = await chrome.runtime.sendMessage({ action: "syncChatHistory", values: { whatsApp_phone, chat_record, isForce } });
      console.log("同步聊天记录~", resp);

      if (isForce && resp?.code === 200) {
        message.success(`已同步 ${chat_record?.length || 0} 聊天记录！`);
      }

      if (!isForce) {
        clearTimeout?.(timer); // 清除定时器
        timer = setTimeout(() => handleSyncChatHistory(false), 60 * 1000); // 同步聊天记录
      }
    });
  }, []);

  /** 聊天记录的点击事件 */
  const handleChatRecordClick = useCallback(() => {
    handleCallInjectedMethod(["Chat", "getActive"], [], async (result: any) => {
      if (!result) return;
      await handleShowSideBar(result?.id?.user || ""); // 用户信息侧边栏
      await handleSyncChatHistory(false); // 同步聊天记录
    });
  }, [handleSyncChatHistory]);

  /** 聊天列表添加点击事件 */
  const handleChatListClick = useCallback(() => {
    const chatsEl = document.querySelectorAll("#pane-side div[role='listitem']");

    // 遍历所有聊天列表
    chatsEl.forEach((element) => {
      // 添加点击事件
      element.addEventListener("click", (e) => {
        chrome.storage.sync.get(["userInfo"], (storage) => {
          if (!storage.userInfo || Object?.keys(storage.userInfo)?.length === 0) return;

          if (e?.target?.matches?.('span[data-icon="down"]')) return;

          handleChatRecordClick(); // 聊天记录的点击事件
        });
      });
    });
  }, [handleChatRecordClick]);

  useEffect(() => {
    // 监听来自插件的消息
    chrome.runtime.onMessage.addListener((msg) => {
      switch (msg.action) {
        case "showSideBar" /* 显示侧边栏 */:
          handleChatListClick(); // 聊天列表添加点击事件
          break;
        case "loginSuccess" /* 登录成功 */:
          handleChatListClick(); // 聊天列表添加点击事件
          handleChatRecordClick(); // 聊天记录的点击事件(登录成功后立即获取当前聊天窗口)
          break;
        case "strangerChat" /* 陌生人聊天 */:
          handleChatRecordClick(); // 聊天记录的点击事件(登录成功后立即获取当前聊天窗口)
          break;
      }

      return true;
    });
  }, [handleChatListClick, handleChatRecordClick]);

  /** 设置用户信息 */
  useEffect(() => {
    form?.resetFields?.();
    if (!customerInfo || Object?.keys(customerInfo)?.length === 0) return;

    form.setFieldValue("whatsApp_phone", customerInfo.whatsApp_phone);
    const { country, target_country, source } = customerInfo;
    customerInfo.country = country ? [country?.parent_id, country?.id] : undefined;
    customerInfo.target_country = target_country?.length ? target_country?.map((_) => [_?.parent_id, _?.id]) : undefined;
    customerInfo.source = source ? source?.map((_) => _.id) : undefined;
    form.setFieldsValue({ ...customerInfo });
  }, [customerInfo, form]);

  /** 卸载定时器 */
  useEffect(() => {
    return () => {
      clearTimeout?.(timer);
    };
  }, []);

  /** 侧边栏保存事件 */
  const handleFinish = async () => {
    const values = await form.validateFields();
    setLoading(true);
    const resp = await chrome.runtime.sendMessage({ action: "saveCustomerInfo", values });
    setLoading(false);
    if (typeof resp !== "string") {
      setCustomerInfo(resp);
      message.success("保存成功！");
    } else {
      message.error(resp);
    }
  };

  /** 侧边栏关闭事件 */
  const handleClose = () => {
    setIsShow(false);
  };

  return (
    isShow &&
    createPortal(
      <div className={styles.sidebar}>
        <Spin spinning={loading}>
          <div className={styles.header}>
            <div className={styles.title}>客户信息</div>
            <Space>
              <Button type="dashed" danger onClick={() => handleSyncChatHistory(true)}>
                同步聊天记录
              </Button>
              <Button onClick={handleClose}>取消</Button>
              <Button type="primary" onClick={handleFinish}>
                保存
              </Button>
            </Space>
          </div>

          <div className={styles.content}>
            <Form form={form}>
              <div className={styles.module}>
                <div className={styles.subHeader}>
                  <div className={styles.subTitle}>基本信息</div>
                </div>

                <div className={styles.column}>
                  <Form.Item name="whatsApp_phone" label="手机号" labelAlign="right" labelCol={{ flex: "100px" }}>
                    <Input variant="filled" placeholder="请输入" disabled />
                  </Form.Item>
                  <Form.Item name="id" label="客户编号" labelAlign="right" labelCol={{ flex: "100px" }}>
                    <Input variant="filled" placeholder="请输入" disabled />
                  </Form.Item>
                  <Form.Item name="url" label="公司网址" labelAlign="right" labelCol={{ flex: "100px" }}>
                    <Input variant="filled" placeholder="请输入" />
                  </Form.Item>
                  <Form.Item name="company_name" label="公司名称" labelAlign="right" labelCol={{ flex: "100px" }} required rules={[{ required: true, message: "这是必填项！" }]}>
                    <Input variant="filled" placeholder="请输入" />
                  </Form.Item>
                  <Form.Item name={["contacts", 0, "nickname"]} label="联系人昵称" labelAlign="right" labelCol={{ flex: "100px" }} required rules={[{ required: true, message: "这是必填项！" }]}>
                    <Input variant="filled" placeholder="请输入" />
                  </Form.Item>
                  <Form.Item
                    name={["contacts", 0, "email"]}
                    label="联系人邮箱"
                    labelAlign="right"
                    labelCol={{ flex: "100px" }}
                    validateFirst={true}
                    rules={[
                      { type: "email", message: "请输入正确格式的邮箱" },
                      {
                        validator: async (_: any, value) => {
                          if (!value) return Promise.resolve();

                          // 发送请求判断邮箱是否存在
                          const resp = await chrome.runtime.sendMessage({
                            action: "checkEmail",
                            values: { email: value, contacts_id: customerInfo?.contacts?.[0]?.id },
                          });

                          if (resp?.email) return Promise.resolve();
                          return Promise.reject(resp);
                        },
                        message: "邮箱已存在!",
                      },
                    ]}>
                    <Input variant="filled" placeholder="请输入" allowClear />
                  </Form.Item>
                  <Form.Item name="country" label="国家地区" labelAlign="right" labelCol={{ flex: "100px" }} required rules={[{ required: true, message: "这是必填项！" }]}>
                    <Cascader variant="filled" options={countries} placeholder="请选择" showSearch />
                  </Form.Item>
                  <Form.Item name="target_country" label="目标国家地区" labelAlign="right" labelCol={{ flex: "100px" }}>
                    <Cascader variant="filled" multiple options={countries} maxTagCount={1} showCheckedStrategy="SHOW_CHILD" placeholder="请选择" showSearch />
                  </Form.Item>
                  <Form.Item name="costomer_type" label="客户类型" labelAlign="right" labelCol={{ flex: "100px" }} required rules={[{ required: true, message: "这是必填项！" }]}>
                    <Select variant="filled" options={handleSelectOption(enums?.costumer?.CustomerType, "name", "value")} placeholder="请选择" />
                  </Form.Item>
                  <Form.Item name="source" label="客户来源" labelAlign="right" labelCol={{ flex: "100px" }} required rules={[{ required: true, message: "这是必填项！" }]}>
                    <Select
                      variant="filled"
                      mode="multiple"
                      options={sources}
                      allowClear
                      placeholder="请选择"
                      showSearch
                      filterOption={(input, option) => option?.label?.toLowerCase()?.indexOf(input?.toLowerCase()) >= 0}
                    />
                  </Form.Item>
                  <Form.Item name="group" label="分组" labelAlign="right" labelCol={{ flex: "100px" }} required rules={[{ required: true, message: "这是必填项！" }]} initialValue={1}>
                    <Select variant="filled" options={handleSelectOption(enums?.costumer?.CostumerGroup, "name", "value")} allowClear placeholder="请选择" />
                  </Form.Item>
                  <Form.Item name="stage" label="客户阶段" labelAlign="right" labelCol={{ flex: "100px" }} required rules={[{ required: true, message: "这是必填项！" }]} initialValue={1}>
                    <Select variant="filled" options={handleSelectOption(enums?.costumer?.CostumerStage, "name", "value")} allowClear placeholder="请选择" />
                  </Form.Item>
                </div>
              </div>
            </Form>
          </div>
        </Spin>
      </div>,
      document.querySelector(parentElLoc)!
    )
  );
};

const root = document.createElement("div");
root.id = "crx-sidebar";
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
  <ConfigProvider locale={zhCN}>
    <SideBar />
  </ConfigProvider>
);
