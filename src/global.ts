/** 是否是开发环境 */
export const IsDev: boolean = false;

/**
 * 开发、线上环境
 */
export const Development: string = "https://dev.erpsh.top/api"; // 开发环境
export const Poduction: string = "https://erpsh.top/api"; // 线上环境
export const BaseUrl: string = IsDev ? Development : Poduction;

/** 父级元素类名 */
export const parentElLoc = "#app > div > div:last-child";
