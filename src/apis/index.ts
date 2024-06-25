import { get, post, patch } from "../request";
import { CheckEmailApi, CreateCustomerInfoApi, SaveCustomerInfoApi, SyncChatHistoryApi, UserLoginApi } from "./models";

/** 登录 */
export const userLoginApi = (data: UserLoginApi): Promise<any> => post("/auth/dlp", { data, isToken: false });

/** 退出登录 */
export const userLogoutApi = (): Promise<any> => get("/auth/logout");

/** 获取用户信息 */
export const getUserInfoApi = (): Promise<any> => get("/users/current_user");

/** 根据手机号获取客户信息 */
export const getCustomerInfoApi = (phone: string): Promise<any> => get(`/custom/whatsapp/customer/`, { params: { whatsApp_phone: phone } });

/** 获取枚举 */
export const getChoicesEnumApi = (): Promise<any> => get(`/choices/enums`);

/** 获取国家地区 */
export const getChoicesCountriesApi = (): Promise<any> => get(`/choices/countries`);

/** 获取客户来源 */
export const getCustomerSourcesApi = (): Promise<any> => get(`/custom/customer_sources/`);

/** 新增客户信息 */
export const createCustomerInfoApi = (data: CreateCustomerInfoApi): Promise<any> => post(`/custom/`, { data });

/** 更新客户信息 */
export const updateCustomerInfoApi = (data: SaveCustomerInfoApi): Promise<any> => patch(`/custom/${data.id}`, { data });

/** 同步whtsapp聊天记录 */
export const syncChatHistoryApi = (data: SyncChatHistoryApi): Promise<any> => post(`/custom/whatsapp/chat/sync/`, { data });

/** 获取whtsapp最新聊天记录 */
export const getLastChatHistoryApi = (whatsApp_phone: string): Promise<any> => get(`/custom/whatsapp/chat/latest/`, { params: { whatsApp_phone } });

/** 校验邮箱是否存在 */
export const checkEmailApi = (data: CheckEmailApi): Promise<any> => get(`/custom/check_email/`, { params: { ...data } });
