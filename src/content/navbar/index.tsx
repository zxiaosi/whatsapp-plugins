import ReactDOM from "react-dom/client";
import zhCN from "antd/locale/zh_CN";
import "dayjs/locale/zh-cn";
import React, { useEffect, useRef, useState } from "react";
import { Button, ConfigProvider, Image, InputNumber, message } from "antd";
import styles from "./index.module.less";
import { createPortal } from "react-dom";
import { parentElLoc } from "../../global";

import logo from "../../../public/images/logo.png";
const logoImg = chrome.runtime.getURL(logo);

/** 导航栏 */
export const NavBar: React.FC = () => {
  // 导航栏父元素
  const parentEl = useRef<Element | null>(null);

  const [userInfo, setUserInfo] = useState<any>(null); // 用户信息

  useEffect(() => {
    // 监听来自插件的消息
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action !== "showNavBar") return;

      // 延迟执行，确保元素已经渲染
      setTimeout(() => {
        setUserInfo(message.userInfo);
        parentEl.current = document.querySelector(parentElLoc)!;
      }, 0);

      return true;
    });
  }, []);

  /** 显示/隐藏导航栏样式 */
  const handleShowHideStyle = (show: boolean, parentEl: Element) => {
    const leftEl = parentEl?.children[2] as HTMLElement;
    const rightEl = parentEl?.children[3] as HTMLElement;
    const siderEl = parentEl?.children[4] as HTMLElement;

    if (leftEl && rightEl && siderEl) {
      const styles = {
        height: show ? "calc(100% - 50px)" : "100%",
        top: show ? "50px" : "0",
      };

      leftEl.style.height = rightEl.style.height = siderEl.style.height = styles.height;
      leftEl.style.top = rightEl.style.top = siderEl.style.top = styles.top;
    }
  };

  /** 陌生人聊天事件 */
  const handleStrangerChat = (e: any) => {
    const value = e.target.value;

    if (/^[\d\s().-]+$/.test(value)) {
      const a = document.createElement("a");
      a.href = `https://web.whatsapp.com/send/?phone=${value.replace(/\s+/g, "")}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      chrome.runtime.sendMessage({ action: "strangerChat" });
    } else {
      message.error("请输入正确的手机号码！");
    }
  };

  /** 登录事件 */
  const handleLogin = () => {
    chrome.runtime.sendMessage({ action: "showLoginModal" });
  };

  /** 退出登录 */
  const handleLogout = async () => {
    // 记录下次是否登录
    const remember = await new Promise((resolve) => chrome.storage.sync.get("remember", (storage) => resolve(storage.remember)));

    // 清除所有存储的数据
    chrome.storage.sync.clear();

    // 存储下次是否登录
    chrome.storage.sync.set({ remember });

    // 重新加载页面
    window.location.reload();
  };

  if (!parentEl.current) return <></>;

  handleShowHideStyle(true, parentEl.current!); // 显示/隐藏导航栏样式

  return createPortal(
    <div id="crxNavBar" className={styles.navbar}>
      <div className={styles.left}>
        <Image className={styles.leftLogo} src={logoImg} preview={false} />

        <div className={styles.leftTitle}>zxiaosi</div>

        <div className={styles.strangerChat}>
          <InputNumber variant="filled" addonBefore="+" controls={false} placeholder="请输入带区号的手机号进行聊天" onPressEnter={handleStrangerChat} />
        </div>
      </div>

      {userInfo && Object?.keys(userInfo)?.length > 0 ? (
        <div className={styles.right}>
          <div className={styles.userInfo}>
            <div>{userInfo?.name}</div>
            <div>{userInfo?.email}</div>
          </div>

          <Button type="dashed" danger onClick={handleLogout}>
            登出
          </Button>
        </div>
      ) : (
        <div className={styles.right}>
          <Button type="primary" onClick={handleLogin}>
            登录
          </Button>
        </div>
      )}
    </div>,
    parentEl.current!
  );
};

const root = document.createElement("div");
root.id = "crx-navbar";
document.body.appendChild(root);

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <ConfigProvider locale={zhCN}>
      <NavBar />
    </ConfigProvider>
  </React.StrictMode>
);
