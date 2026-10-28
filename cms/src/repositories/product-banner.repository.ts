import axiosInstance from 'src/utils/axios';
import type { ProductBanner } from 'src/types/gen/shared/shared/product-banners/product-banner';
import type {
  CreateProductBannerRequest,
  UpdateProductBannerRequest,
  QueryProductBannersResponse,
  FilterProductBanner,
  SortProductBanner,
} from 'src/types/gen/cms/cms/product-banners/product-banner';

interface GetProductBannersParams {
  page?: number;
  limit?: number;
  filters?: FilterProductBanner;
  sort?: SortProductBanner[];
}

class ProductBannerRepository {
  getProductBanners = async (
    params: GetProductBannersParams
  ): Promise<QueryProductBannersResponse> => {
    const { page, limit, filters, sort } = params;
    const queryParams: Record<string, string> = {};

    if (page) queryParams.page = page.toString();
    if (limit) queryParams.limit = limit.toString();
    if (filters) queryParams.filters = JSON.stringify(filters);
    if (sort && sort.length > 0) queryParams.sort = JSON.stringify(sort);

    const response = await axiosInstance.get<QueryProductBannersResponse>('/cms/product-banners', {
      params: queryParams,
    });
    return response.data;
  };

  getProductBannerById = async (id: string): Promise<ProductBanner> => {
    const response = await axiosInstance.get<ProductBanner>(`/cms/product-banners/${id}`);
    return response.data;
  };

  createProductBanner = async (data: CreateProductBannerRequest): Promise<ProductBanner> => {
    const response = await axiosInstance.post<ProductBanner>('/cms/product-banners', data);
    return response.data;
  };

  updateProductBanner = async (
    id: string,
    data: Omit<UpdateProductBannerRequest, 'bannerId'>
  ): Promise<ProductBanner> => {
    const response = await axiosInstance.patch<ProductBanner>(`/cms/product-banners/${id}`, data);
    return response.data;
  };

  deleteProductBanner = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/cms/product-banners/${id}`);
  };
}

export const productBannerRepository = new ProductBannerRepository();
