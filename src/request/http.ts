import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from "axios";
import { BaseUrl } from "../global";

axios.defaults.baseURL = BaseUrl; // 接口地址

/** 自定义配置项 */
export interface IRequestOption extends Partial<AxiosRequestConfig> {
  /**
   * 是否需要需要Token
   * @default true
   */
  isToken?: boolean;
}

// 请求拦截器(全局配置)
axios.interceptors.request.use(
  async (config: any) => {
    const { isToken } = config;
    const storage = await chrome.storage.sync.get("token");
    if (isToken && storage.token) config.headers["Authorization"] = storage.token; // 请求头中携带token
    return config;
  },
  (error: AxiosError) => {
    // 发送请求时出了点问题，比如网络错误 https://segmentfault.com/q/1010000020659252
    return Promise.reject(error.message);
  }
);

// 响应拦截器(全局配置)
axios.interceptors.response.use(
  (response: AxiosResponse) => {
    console.log("response", response);

    if (response?.data?.message || response?.data?.detail) return Promise.reject(response?.data?.message || response?.data?.detail);
    else return response?.data;
  },
  (error: AxiosError) => {
    console.log("error", error);
    const { response, message } = error;
    const errMsg = response?.data?.message || response?.data?.detail || message || response?.statusText;
    return Promise.reject(errMsg);
  }
);

// 封装请求类
class Http {
  defaultOptions: IRequestOption = { isToken: true };

  // 请求配置 https://www.axios-http.cn/docs/req_config
  request<T>(url: string, options: IRequestOption): Promise<T> {
    // 请求头中的 Content-Type , axios 默认会自动设置合适的 Content-Type
    const requestOptions = { ...this.defaultOptions, ...options };
    const config = { url, ...requestOptions };
    return axios.request(config);
  }
}

const http = new Http();
export default http;
