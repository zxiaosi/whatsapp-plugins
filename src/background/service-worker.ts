import "./init";
import "./menus";
import { handleNotifications } from "./notifications.js";
import {
  checkEmailApi,
  createCustomerInfoApi,
  getChoicesCountriesApi,
  getChoicesEnumApi,
  getCustomerInfoApi,
  getCustomerSourcesApi,
  getLastChatHistoryApi,
  getUserInfoApi,
  syncChatHistoryApi,
  updateCustomerInfoApi,
  userLoginApi,
} from "../apis/index.js";
import { buildHierarchy } from "../utils/index.js";
import { SyncChatHistoryApi } from "../apis/models.js";

// 页面状态 false: 未加载, true: 加载完毕
chrome.storage.sync.set({ pageStatus: false });

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  // 当页面加载完毕时
  if (tab.url === "https://web.whatsapp.com/") {
    if (changeInfo.status === "loading" || changeInfo.status === "complete") {
      if (changeInfo.status === "loading") {
        chrome.storage.sync.set({ pageStatus: true });
        return;
      }

      chrome.storage.sync.get(["pageStatus", "remember"], async (storage) => {
        // 页面正式加载完成
        if (storage.pageStatus && changeInfo.status === "complete") {
          try {
            // 获取用户信息
            const resp = await handleGetUserInfo();
            handlSendMessageToContent({ action: "showNavBar", userInfo: resp });
            handlSendMessageToContent({ action: "showSideBar" });
          } catch (e) {
            handlSendMessageToContent({ action: "showNavBar", userInfo: {} });
            // 未登录 且 未不显示登录弹窗
            if (storage.remember) return;
            else handlSendMessageToContent({ action: "showLoginModal" });
          }
        }
      });
    } else {
      chrome.storage.sync.set({ pageStatus: false });
    }
  } else {
    chrome.storage.sync.set({ pageStatus: false });
  }
});

// 监听消息事件
chrome.runtime.onMessage.addListener((message, sender, sendResponse: any) => {
  console.log("service worker message: ", message);

  switch (message.action) {
    case "drinkWaterNotice" /* 喝水提醒 */:
      handleNotifications();
      break;
    case "loginBtn" /** 登录事件 */:
      handleSubmitLogin(message.values)
        .then((resp) => {
          sendResponse("success");
          handlSendMessageToContent({ action: "showNavBar", userInfo: resp });
          handlSendMessageToContent({ action: "loginSuccess" });
        })
        .catch((err) => sendResponse(err));
      break;
    case "getCustomerInfo" /** 获取客户信息 */:
      handleGetCustomerInfo(message.values)
        .then((resp) => sendResponse(resp))
        .catch((err) => sendResponse(err));
      break;
    case "saveCustomerInfo" /** 保存客户信息 */:
      handleSaveCustomerInfo(message.values)
        .then((resp) => sendResponse(resp))
        .catch((err) => sendResponse(err));
      break;
    case "syncChatHistory" /** 同步聊天记录 */:
      handleSyncChatHistory(message.values)
        .then((resp) => sendResponse(resp))
        .catch((err) => sendResponse(err));
      break;
    case "checkEmail" /** 校验邮箱是否存在 */:
      handleCheckEmail(message.values)
        .then((resp) => sendResponse(resp))
        .catch((err) => sendResponse(err));
      break;
    case message.action /** 显示登录弹窗 */:
      /** 陌生人聊天 */
      /** 显示登录弹窗 */
      handlSendMessageToContent({ action: message.action });
      break;
  }

  // 必须返回true，以确保sendResponse在异步请求完成后仍然有效
  return true;
});

/** 登录事件 */
const handleSubmitLogin = async (values: any) => {
  const { token_type, access_token } = await userLoginApi(values);
  if (!token_type || !access_token) return;
  await chrome.storage.sync.set({ token: `${token_type} ${access_token}` }); // 保存token
  return await handleGetUserInfo();
};

/** 获取用户信息 */
const handleGetUserInfo = async () => {
  const resp = await getUserInfoApi();
  delete resp.permission.menus; // 删除了用户的权限信息, 以减少存储的数据量
  chrome.storage.sync.set({ userInfo: resp });
  return resp;
};

/** 根据手机号获取客户信息 */
const handleGetCustomerInfo = async (phone: string) => {
  const enums = await getChoicesEnumApi();
  const sources = await getCustomerSourcesApi();
  const countries = await getChoicesCountriesApi();
  const customerSources = sources?.items?.map((_: any) => ({ ..._, value: _.id, label: _.alias || _.name }));
  const choicesCountrie = buildHierarchy(countries.items, "name", "id", false);
  const customerInfo = await getCustomerInfoApi(phone);
  return { customerInfo, choicesEnum: enums.items, choicesCountrie, customerSources };
};

/** 保存客户信息 */
const handleSaveCustomerInfo = async (values: any) => {
  values.country = values.country?.[1] || undefined;
  values.target_country = values.target_country?.map((_) => _?.[1]) || undefined;
  values.belong_pool_type = 0; // 公海-0/私海-1
  if (values.id) {
    return await updateCustomerInfoApi(values);
  } else {
    return await createCustomerInfoApi(values);
  }
};

/** 同步聊天记录 */
const handleSyncChatHistory = async (result: SyncChatHistoryApi) => {
  const { whatsApp_phone, chat_record, isForce } = result;

  let chatRecord = [] as any[];

  if (!isForce) {
    // 获取最新的聊天记录
    const lastest = await getLastChatHistoryApi(whatsApp_phone);

    // 过滤出新的聊天记录
    chatRecord = chat_record?.filter((item) => item.sign > (lastest?.sign || "0"));
  } else {
    chatRecord = chat_record;
  }

  if (chatRecord?.length === 0) return "没有新的聊天记录！";
  return await syncChatHistoryApi({ whatsApp_phone, chat_record: chatRecord });
};

/** 校验邮箱是否存在 */
const handleCheckEmail = async (values: any) => {
  return await checkEmailApi(values);
};

/** 向 content 中发消息 */
const handlSendMessageToContent = (message: any) => {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.sendMessage(tabs[0].id!, message);
  });
};
