console.log("notifications.ts loaded!");

/** 消息通知事件 */
export function handleNotifications() {
  chrome.notifications.create("", {
    type: "basic",
    iconUrl: "../images/icon48.png",
    title: "喝水小助手",
    message: "看到此消息的人可以和我一起来喝一杯水",
  });
}
