(function () {
  const timer = setInterval(() => {
    try {
      window.Store = Object.assign({}, window.require("WAWebCollections"));
      console.log("window.Store", window.Store);

      if (Object?.keys(window.Store)?.length === 0) throw new Error("window.Store 为空！");

      // 获取成功，清除定时器
      clearInterval(timer);

      window.addEventListener(
        "message",
        async (event) => {
          if (event.source !== window) return;

          if (event.data && event.data.type === "Injected_Method_Call") {
            const { methodPath, args, requestId } = event.data;

            const method = methodPath.reduce((prev, cur) => (cur ? prev?.[cur] : prev), window.Store);

            if (typeof method === "function") {
              let result = undefined as any;

              switch (methodPath[methodPath.length - 1]) {
                case "getModelsArray" /** 获取所有聊天记录 */: {
                  result = window.Store?.Chat?.getModelsArray()?.serialize();
                  break;
                }
                case "getActive" /** 获取当前聊天记录 */: {
                  result = window.Store?.Chat?.getActive()?.serialize();
                  break;
                }
                default: {
                  result = await method(...args);
                }
              }

              window.postMessage({ type: "Injected_Mehod_Response", requestId, result }, "https://web.whatsapp.com/");
            } else {
              const result = method; // 如果不是函数，直接返回值
              window.postMessage({ type: "Injected_Mehod_Response", requestId, result }, "https://web.whatsapp.com/");
            }
          }
        },
        false
      );
    } catch (e) {
      console.log("注入代码失败~", e);
    }
  }, 500);
})();
