import axiosInstance from 'src/utils/axios';
import type { ComboResponse as Combo } from 'src/types/gen/shared/shared/combos/combo';
import type {
  CreateComboRequest,
  UpdateComboRequest,
  QueryCombosResponse,
  FilterCombo,
  SortCombo,
} from 'src/types/gen/cms/cms/combos/combo';
import { ComboStatus, DiscountType } from 'src/types/gen/shared/shared/common/enums';
import {
  COMBO_STATUS_API,
  DISCOUNT_TYPE_API,
  API_COMBO_STATUS,
  API_DISCOUNT_TYPE,
} from 'src/utils/enum-converter';

interface GetCombosParams {
  page?: number;
  limit?: number;
  filters?: FilterCombo;
  sort?: SortCombo[];
}

class ComboRepository {
  getCombos = async (params: GetCombosParams): Promise<QueryCombosResponse> => {
    const { page, limit, filters, sort } = params;
    const queryParams: Record<string, string> = {};

    if (page) queryParams.page = page.toString();
    if (limit) queryParams.limit = limit.toString();
    if (filters) queryParams.filters = JSON.stringify(filters);
    if (sort && sort.length > 0) queryParams.sort = JSON.stringify(sort);

    const response = await axiosInstance.get<QueryCombosResponse>('/combos', {
      params: queryParams,
    });
    // Convert API string values to enum numbers for each combo
    return {
      ...response.data,
      data: response.data.data.map((combo) => ({
        ...combo,
        status: API_COMBO_STATUS[combo.status as unknown as string] ?? combo.status,
        discountType:
          API_DISCOUNT_TYPE[combo.discountType as unknown as string] ?? combo.discountType,
      })),
    };
  };

  getComboById = async (id: string): Promise<Combo> => {
    const response = await axiosInstance.get<Combo>(`/combos/${id}`);
    const data = response.data;
    // Convert API string values to enum numbers
    return {
      ...data,
      status: API_COMBO_STATUS[data.status as unknown as string] ?? data.status,
      discountType: API_DISCOUNT_TYPE[data.discountType as unknown as string] ?? data.discountType,
    };
  };

  createCombo = async (data: CreateComboRequest): Promise<Combo> => {
    const apiData = {
      ...data,
      status: COMBO_STATUS_API[data.status as ComboStatus],
      discountType: DISCOUNT_TYPE_API[data.discountType as DiscountType],
    };
    const response = await axiosInstance.post<Combo>('/combos', apiData);
    return response.data;
  };

  updateCombo = async (id: string, data: Omit<UpdateComboRequest, 'comboId'>): Promise<Combo> => {
    const apiData: Record<string, unknown> = { ...data };
    if (data.status !== undefined) {
      apiData.status = COMBO_STATUS_API[data.status as ComboStatus];
    }
    if (data.discountType !== undefined) {
      apiData.discountType = DISCOUNT_TYPE_API[data.discountType as DiscountType];
    }
    const response = await axiosInstance.patch<Combo>(`/combos/${id}`, apiData);
    return response.data;
  };

  deleteCombo = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/combos/${id}`);
  };
}

export const comboRepository = new ComboRepository();
