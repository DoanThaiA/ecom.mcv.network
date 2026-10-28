// Generated types from customer.proto

export enum Source {
  UNKNOWN = 0,
  ZALO = 1,
  LINE = 2,
  CRM = 3,
  MMENU_FOOD = 4,
  MMENU_ADMIN = 5,
  ZALO_MINI_APP = 6,
  WEB_REGISTER = 7,
  CCHAT_WEBSITE = 8,
  FACEBOOK = 9,
  GOOGLE = 10,
}

export enum SortOrder {
  asc = 0,
  desc = 1,
}

export interface Age {
  from: number;
  to: number;
}

export interface CustomerSource {
  source: Source;
  zalo_user_id?: string;
  line_user_id?: string;
  registered_at_text?: string;
  note?: string;
  customer_name?: string;
  customer_image_url?: string;
  description?: string;
  numbers_of_customer?: number;
  created_at_text?: string;
  code?: string;
  brand_id?: string;
  brand_code?: string;
  source_name?: string;
  customer_source_id?: string;
  zalo_app_id?: string;
  cchat_user_id?: string;
}

export interface Company {
  company_id?: string;
  company_name?: string;
  company_code?: string;
}

export interface Brand {
  brand_id?: string;
  brand_name?: string;
  brand_code?: string;
}

export interface Merchant {
  merchant_id?: string;
  merchant_name?: string;
  merchant_code?: string;
}

export interface CustomerGroup {
  group_id?: string;
  group_name?: string;
  group_code?: string;
  description?: string;
  numbers_of_customer?: string;
  created_at?: number;
  created_at_text?: string;
  brand_id?: string;
}

export interface CustomerRank {
  rank_id?: string;
  rank_name?: string;
  rank_code?: string;
  rank_color?: string;
}

export interface CustomerFrequency {
  number_of_new_customers?: number;
  percentage_of_new_customers?: number;
  number_of_visited_once?: number;
  percentage_of_visited_once?: number;
  number_of_visited_more_than_once?: number;
  percentage_of_visited_more_than_once?: number;
  number_of_visited_twice?: number;
  percentage_of_visited_twice?: number;
  number_of_visited_more_than_twice?: number;
  percentage_of_visited_more_than_twice?: number;
}

export interface OrderSource {
  order_source?: string;
  total_payment_amount_per_order_source?: number;
}

export interface ConsumptionOverview {
  total_payment_amount?: number;
  average_payment_amount_per_bill?: number;
  order_frequency?: number;
  number_of_orders?: number;
  most_recent_order_at_text?: string;
  cumulative_payment_amount?: number;
  cumulative_point_amount?: number;
  average_payment_amount_per_customer?: number;
}

export interface InteractiveChannel {
  source?: Source;
  zalo_user_id?: string;
  line_user_id?: string;
  zalo_app_id?: string;
  registered_at_text?: string;
  customer_name?: string;
  customer_image_url?: string;
  facebook_user_id?: string;
  google_user_id?: string;
}

export interface RegistrationChannel {
  registration_id?: string;
  registration_date_at_text?: string;
  registration_name?: string;
}

export interface CustomerTaxInfo {
  tax_code?: string;
  name?: string;
  buyer_name?: string;
  email?: string;
  phone?: string;
  address?: string;
}

export interface Customer {
  code?: string;
  name?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  status?: string;
  customer_sources?: CustomerSource[];
  brand?: Brand;
  rank?: CustomerRank;
  groups?: CustomerGroup[];
  tags?: string[];
  note?: string;
  image_urls?: string[];
  customer_id?: string;
  consumption_overview?: ConsumptionOverview;
  interactive_channels?: InteractiveChannel[];
  registration_channel?: RegistrationChannel;
  date_of_birth_epoch?: number;
  company?: Company;
  brands?: Brand[];
  merchants?: Merchant[];
  city?: string;
  district?: string;
  ward?: string;
  applied_discount_merchant_ids?: string[];
  applied_discount_merchant_codes?: string[];
  invalid_reason?: string;
  customer_tax_info?: CustomerTaxInfo;
}

export interface CreateOrUpdateCustomerRequest {
  customer?: Customer;
  update_by_user_id?: string;
}

export interface CreateOrUpdateCustomerResponse {
  code: number;
  message: string;
  customer?: Customer;
}

export interface GetCustomerGroupsRequest {
  brand_id?: string;
  brand_code?: string;
}

export interface GetCustomerGroupsResponse {
  message?: string;
  code?: number;
  customer_groups?: CustomerGroup[];
}

export interface GetCustomerRequest {
  brand_id?: string;
  phone?: string;
  zalo_user_id?: string;
  brand_code?: string;
  line_user_id?: string;
}

export interface GetCustomerResponse {
  code: number;
  message: string;
  customer?: Customer;
}

export interface CustomerRoutes {
  createOrUpdateCustomer(
    request: CreateOrUpdateCustomerRequest,
  ): Promise<CreateOrUpdateCustomerResponse>;
  getCustomer(request: GetCustomerRequest): Promise<GetCustomerResponse>;
}
