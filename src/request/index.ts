import http from "./http";
import type { IRequestOption } from "./http";

export function get<T = any>(url: string, option: IRequestOption = {}) {
  return http.request<T>(url, { method: "GET", ...option });
}

export function post<T = any>(url: string, option: IRequestOption = {}) {
  return http.request<T>(url, { method: "POST", ...option });
}

export function put<T = any>(url: string, option: IRequestOption = {}) {
  return http.request<T>(url, { method: "PUT", ...option });
}

export function patch<T = any>(url: string, option: IRequestOption = {}) {
  return http.request<T>(url, { method: "PATCH", ...option });
}

export function del<T = any>(url: string, option: IRequestOption = {}) {
  return http.request<T>(url, { method: "DELETE", ...option });
}
export default http;
