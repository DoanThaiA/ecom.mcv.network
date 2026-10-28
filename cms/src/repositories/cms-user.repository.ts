import axiosInstance from 'src/utils/axios';

import type { StatusEnum } from 'src/types/gen/shared/shared/common/enums';

// ─── Types ────────────────────────────────────────────────────────────────

export enum AccountTypeEnum {
  'website_admin' = 1,
  'affiliate' = 2,
}

export enum ModulePermission {
  'product_management' = 1,
  'order_management' = 2,
  'return_management' = 3,
  'flash_sale_management' = 4,
  'promotion_management' = 5,
  'news_management' = 6,
  'homepage_management' = 7,
  'settings' = 8,
  'push_notification_management' = 9,
  'affiliate_management' = 10,
  'account_management' = 11,
  'shipping_management' = 12,
  /** Hidden super permission – bypasses all module checks. Only set via DB. */
  'super_admin' = 99,
}

export const ALL_MODULE_PERMISSIONS = Object.values(ModulePermission).filter(
  (v): v is ModulePermission => typeof v === 'number'
);

/** Permissions visible in CMS UI (excludes super_admin). */
export const VISIBLE_MODULE_PERMISSIONS = ALL_MODULE_PERMISSIONS.filter(
  (v) => v !== ModulePermission.super_admin
);

export interface CmsUserData {
  id: string;
  email: string;
  firstName: string | null;
  lastName?: string | null;
  phone?: string | null;
  accountType: AccountTypeEnum;
  permissions: ModulePermission[];
  affiliateId?: string | null;
  status: number;
  createdAt: string;
  updatedAt: string;
}

export interface QueryCmsUsersParams {
  page?: number;
  limit?: number;
  filters?: FilterCmsUserDto;
  sort?: SortCmsUserDto[];
}

export interface FilterCmsUserDto {
  search?: string;
  statuses?: number[];
  accountTypes?: AccountTypeEnum[];
}

export interface SortCmsUserDto {
  orderBy: string;
  order: 'asc' | 'desc';
}

export interface QueryCmsUsersResponse {
  data: CmsUserData[];
  hasNextPage: boolean;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CreateCmsUserData {
  email: string;
  password?: string;
  firstName: string;
  lastName?: string;
  phone?: string;
  accountType: AccountTypeEnum;
  permissions?: ModulePermission[];
  affiliateId?: string;
  status?: number;
}

export interface UpdateCmsUserData {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  permissions?: ModulePermission[];
  status?: number;
}

// ─── Repository ───────────────────────────────────────────────────────────

class CmsUserRepository {
  queryCmsUsers = async (params: QueryCmsUsersParams): Promise<QueryCmsUsersResponse> => {
    const queryParams: Record<string, string> = {};
    if (params.page !== undefined) {
      queryParams.page = params.page.toString();
    }
    if (params.limit !== undefined) {
      queryParams.limit = params.limit.toString();
    }
    if (params.filters) {
      queryParams.filters = JSON.stringify(params.filters);
    }
    if (params.sort && params.sort.length > 0) {
      queryParams.sort = JSON.stringify(params.sort);
    }
    const response = await axiosInstance.get<QueryCmsUsersResponse>('/cms-users', {
      params: queryParams,
    });
    return response.data;
  };

  getCmsUser = async (id: string): Promise<CmsUserData> => {
    const response = await axiosInstance.get<CmsUserData>(`/cms-users/${id}`);
    return response.data;
  };

  createCmsUser = async (data: CreateCmsUserData): Promise<CmsUserData> => {
    const response = await axiosInstance.post<CmsUserData>('/cms-users', data);
    return response.data;
  };

  updateCmsUser = async (id: string, data: UpdateCmsUserData): Promise<CmsUserData> => {
    const response = await axiosInstance.patch<CmsUserData>(`/cms-users/${id}`, data);
    return response.data;
  };

  deleteCmsUser = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/cms-users/${id}`);
  };
}

export const cmsUserRepository = new CmsUserRepository();
