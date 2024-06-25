export interface UserLoginApi {
  username: string;
  password: string;
}

export interface CreateCustomerInfoApi {
  url?: string;
  company_name?: string;
  company_abbreviation?: string;
  belong_pool_type?: number;
  costomer_type?: number;
  country?: number;
  source?: number[];
  stage?: number;
  group?: number;
  contacts: [
    {
      id?: number;
      nickname?: string;
      email?: string;
      social_platform: [
        {
          social_platform_name?: string;
          social_platform?: string;
        }
      ];
      telephone: [
        {
          area_code?: string;
          phone?: string;
        }
      ];
      position?: string;
      job?: string;
      gender?: number;
      contact_remarks?: string;
    }
  ];
  telephone: {
    area_code?: string;
    phone?: string;
  };
  purchase_intention?: number;
  fax?: string;
  full_address?: string;
  company_remarks?: string;
  time_zone?: number;
  main_products?: number[];
  product_groups?: number[];
  scale?: number;
  annual_purchase?: number;
  target_country?: number[];
  whatsApp_phone?: string;
}

export interface SaveCustomerInfoApi extends CreateCustomerInfoApi {
  id: number;
}

export interface ChatRecord {
  content: string;
  send_time: number;
  sign: string;
  is_send: false;
}

export interface SyncChatHistoryApi {
  whatsApp_phone: string;
  chat_record: ChatRecord[];
  /** 是否强制同步 */
  isForce?: boolean;
}

export interface CheckEmailApi {
  email: string;
  contacts_id?: number;
  skipErrorHandler?: boolean;
}
