import axiosInstance from 'src/utils/axios';
import type {
  ColorVariant,
  CreateColorVariantRequest,
  UpdateColorVariantRequest,
  QueryColorVariantsRequest,
  QueryColorVariantsResponse,
} from 'src/types/color-variant';

/**
 * Color Variant Repository
 * Handles all color variant-related API calls
 */
class ColorVariantRepository {
  /**
   * Get color variants with filters and pagination
   */
  getColorVariants = async (
    params: QueryColorVariantsRequest
  ): Promise<QueryColorVariantsResponse> => {
    const { page, limit, search, displayType } = params;

    // Build query params
    const queryParams: Record<string, string> = {};

    if (page !== undefined) {
      queryParams.page = page.toString();
    }
    if (limit !== undefined) {
      queryParams.limit = limit.toString();
    }
    if (search) {
      queryParams.name = search;
    }
    if (displayType !== undefined) {
      queryParams.displayType = displayType.toString();
    }

    const response = await axiosInstance.get<QueryColorVariantsResponse>('/cms/color-variants', {
      params: queryParams,
    });

    return response.data;
  };

  /**
   * Get single color variant by ID
   */
  getColorVariantById = async (id: string): Promise<ColorVariant> => {
    const response = await axiosInstance.get<ColorVariant>(`/cms/color-variants/${id}`);
    return response.data;
  };

  /**
   * Create a new color variant
   */
  createColorVariant = async (data: CreateColorVariantRequest): Promise<ColorVariant> => {
    const response = await axiosInstance.post<ColorVariant>('/cms/color-variants', data);
    return response.data;
  };

  /**
   * Update an existing color variant
   */
  updateColorVariant = async (
    id: string,
    data: UpdateColorVariantRequest
  ): Promise<ColorVariant> => {
    const response = await axiosInstance.patch<ColorVariant>(`/cms/color-variants/${id}`, data);
    return response.data;
  };

  /**
   * Delete a color variant
   */
  deleteColorVariant = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/cms/color-variants/${id}`);
  };
}

export const colorVariantRepository = new ColorVariantRepository();
