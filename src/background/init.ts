console.log("init.ts loaded!");

// 监听安装事件
// chrome.runtime.onInstalled.addListener(() => {
//   // 默认情况下，页面操作是禁用的，并且在选择的标签上启用
//   chrome.action.disable();

//   // 清空所有规则以确保只设置我们期望的规则
//   chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
//     // 声明一个规则以在example.com页面上启用操作
//     const rule = {
//       conditions: [
//         new chrome.declarativeContent.PageStateMatcher({
//           pageUrl: { hostSuffix: ".whatsapp.com" },
//         }),
//       ],
//       actions: [new chrome.declarativeContent.ShowAction({})],
//     };

//     // 将规则应用于页面
//     chrome.declarativeContent.onPageChanged.addRules([rule]);
//   });
// });

// 点击插件图标时打开whatsapp页面
chrome.action.onClicked.addListener((tab) => {
  chrome.tabs.create({ url: "https://web.whatsapp.com/" });
});
