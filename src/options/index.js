console.log("options loaded!");

let btnEl = document.getElementById("btn");

btnEl.onclick = handleBtnClick;

/** 按钮点击事件 */
function handleBtnClick() {
  chrome.storage.sync.get("btnClickNum", function (data) {
    let newNum = (data.btnClickNum ?? 0) + 1;
    chrome.storage.sync.set({ btnClickNum: newNum });
    let divEl = document.createElement("div");
    divEl.innerHTML = `惊喜! 您已经点击了${newNum}次`;
    divEl.style.textAlign = "center";
    document.body.appendChild(divEl);
  });
}