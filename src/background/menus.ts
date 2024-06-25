console.log("menus.ts loaded!");

// 监听安装事件
chrome.runtime.onInstalled.addListener(() => {
  // 页面右键菜单
  chrome.contextMenus.create({
    id: "1",
    title: "用户登录",
    contexts: ["all"],
    // contexts: ["selection"], // 只在选中文本时显示
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;
  chrome.tabs.sendMessage(tab?.id, { action: "showLoginModal" });
});
