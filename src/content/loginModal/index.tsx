import ReactDOM from "react-dom/client";
import zhCN from "antd/locale/zh_CN";
import "dayjs/locale/zh-cn";
import React, { useEffect, useRef, useState } from "react";
import { Button, ConfigProvider, Form, Input, Modal, Image, FormInstance, message, Checkbox } from "antd";
import styles from "./index.module.less";

import logo from "../../../public/images/logo.png";
const logoImg = chrome.runtime.getURL(logo);

/** 登录弹窗 */
export const LoginModal: React.FC = () => {
  const formRef = useRef<FormInstance>(null);

  const [isOpen, setIsOpen] = useState(false); // 是否打开弹窗

  const [messageApi, contextHolder] = message.useMessage();

  useEffect(() => {
    // 监听来自插件的消息
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action !== "showLoginModal") return false;

      Modal.destroyAll(); // 销毁其他弹窗
      setIsOpen(true);
      return true;
    });
  }, [messageApi]);

  /** modal - 打开之后事件 */
  const handleAfterOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      chrome.storage.sync.get("remember", (storage) => {
        formRef.current?.setFieldsValue({ remember: storage.remember });
      });
    }
  };

  /** modal - 取消事件 */
  const handleCancel = () => {
    setIsOpen(false);
    formRef.current?.resetFields();
  };

  /** modal - 确定事件 */
  const handleOk = async () => {
    await formRef.current?.validateFields();
    const values = formRef.current?.getFieldsValue();

    // 不再弹出modal
    chrome.storage.sync.set({ remember: values.remember });

    // 发送登录请求
    const flag = await chrome.runtime.sendMessage({ action: "loginBtn", values });

    if (flag === "success") handleCancel();
    else messageApi.error(flag);
  };

  return (
    <>
      {contextHolder}

      <Modal
        title={
          <div className={styles.header}>
            <Image className={styles.image} src={logoImg} width={40} preview={false} />
            <div className={styles.title}>Nbt ERP</div>
          </div>
        }
        width={300}
        open={isOpen}
        footer={false}
        onCancel={handleCancel}
        className={styles.modal}
        maskClosable={false}
        afterOpenChange={handleAfterOpenChange}>
        <Form ref={formRef}>
          <Form.Item name="username" rules={[{ required: true, message: "请输入用户帐号!" }]}>
            <Input placeholder="请输入用户帐号" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: "请输入密码!" }]}>
            <Input.Password placeholder="请输入密码" />
          </Form.Item>

          <Button type="primary" onClick={handleOk} className={styles.btn}>
            登录
          </Button>

          <Form.Item name="remember" valuePropName="checked">
            <Checkbox>下次不再弹出</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

const root = document.createElement("div");
root.id = "crx-login-modal";
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <LoginModal />
    </ConfigProvider>
  </React.StrictMode>
);
