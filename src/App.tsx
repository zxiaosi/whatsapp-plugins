import "./App.css";

/** popup 页面 */
function App() {
  /** 喝水提醒通知 */
  const handleDrinkWaterNotice = () => {
    chrome.runtime.sendMessage({ action: "drinkWaterNotice" });
  };

  /** 用户登录 */
  const handleUserLogin = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      chrome.tabs.sendMessage(tabs[0].id!, { action: "showLoginModal" });
    });
  };

  /** 跳转到github */
  const handlePageToGithub = () => {
    chrome.tabs.create({ url: "https://github.com/zxiaosi" });
  };

  /** 跳转选项页面(设置页面)事件 */
  const handlePageToOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  return (
    <div>
      <div className="title">你好，靓仔！</div>

      <div className="content">
        <div onClick={handleDrinkWaterNotice}>喝水提醒</div>
        <div onClick={handleUserLogin}>用户登录</div>
      </div>

      <div className="footer">
        <div onClick={handlePageToGithub}>Github</div>
        <div onClick={handlePageToOptions}>设置</div>
      </div>
    </div>
  );
}

export default App;
