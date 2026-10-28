import axiosInstance from '../axios';
import type { ColorVariant } from '@/types/colorVariant';

/**
 * Color Variant Repository
 * Simple API caller - caching handled by backend (HTTP Cache-Control)
 */
class ColorVariantRepository {
  /**
   * Get all color variants
   */
  async getAllColorVariants(): Promise<ColorVariant[]> {
    const response = await axiosInstance.get<ColorVariant[]>(
      '/shop/color-variants'
    );
    return response.data;
  }
}

export const colorVariantRepository = new ColorVariantRepository();
