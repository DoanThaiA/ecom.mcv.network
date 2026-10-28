import axiosInstance from 'src/utils/axios';
import type { Menu } from 'src/types/gen/shared/shared/menus/menu';
import type {
  QueryMenusRequest,
  QueryMenusResponse,
  CreateMenuRequest,
  UpdateMenuRequest,
  ReorderMenuItem,
} from 'src/types/gen/cms/cms/menus/menu';
import { MenuStatus } from 'src/types/gen/shared/shared/common/enums';

/**
 * Convert MenuStatus (enum or string) to API string format
 * API expects 'active' | 'inactive' instead of enum values
 */
const toApiStatus = (status?: MenuStatus | string): string | undefined => {
  if (status === MenuStatus.MENU_STATUS_ACTIVE || status === 'active') {
    return 'active';
  }
  if (status === MenuStatus.MENU_STATUS_INACTIVE || status === 'inactive') {
    return 'inactive';
  }
  return undefined;
};

/**
 * Menu Repository
 * Handles all menu-related API calls
 */
class MenuRepository {
  /**
   * Get menus with filters and sorting (no pagination)
   */
  getMenus = async (params: QueryMenusRequest): Promise<QueryMenusResponse> => {
    const { filters, sort } = params;

    // Build query params
    const queryParams: Record<string, string> = {};

    // Add filters if provided
    if (filters && Object.keys(filters).length > 0) {
      queryParams.filters = JSON.stringify(filters);
    }

    // Add sort if provided
    if (sort && sort.length > 0) {
      queryParams.sort = JSON.stringify(sort);
    }

    const response = await axiosInstance.get<Menu[] | QueryMenusResponse>('/menus', {
      params: queryParams,
    });

    // Handle both array response and paginated response formats
    if (Array.isArray(response.data)) {
      // API returns raw array - wrap it in QueryMenusResponse format
      return { data: response.data };
    }

    // API returns QueryMenusResponse
    return response.data;
  };

  /**
   * Get all menus (no pagination) for parent select dropdown
   */
  getAllMenus = async (): Promise<Menu[]> => {
    const response = await axiosInstance.get<Menu[] | QueryMenusResponse>('/menus', {
      params: { limit: '1000' },
    });

    // Handle both array response and paginated response formats
    if (Array.isArray(response.data)) {
      return response.data;
    }

    return response.data.data;
  };

  /**
   * Get single menu by ID
   */
  getMenuById = async (id: string): Promise<Menu> => {
    const response = await axiosInstance.get<Menu>(`/menus/${id}`);
    return response.data;
  };

  /**
   * Create a new menu
   */
  createMenu = async (data: CreateMenuRequest): Promise<Menu> => {
    const apiData = {
      ...data,
      status: toApiStatus(data.status as MenuStatus | string),
    };

    const response = await axiosInstance.post<Menu>('/menus', apiData);
    return response.data;
  };

  /**
   * Update an existing menu
   */
  updateMenu = async (id: string, data: Omit<UpdateMenuRequest, 'menuId'>): Promise<Menu> => {
    const apiData = {
      ...data,
      status: toApiStatus(data.status as MenuStatus | string),
    };

    const response = await axiosInstance.patch<Menu>(`/menus/${id}`, apiData);
    return response.data;
  };

  /**
   * Delete a menu
   */
  deleteMenu = async (id: string): Promise<void> => {
    await axiosInstance.delete(`/menus/${id}`);
  };

  /**
   * Bulk reorder menus
   */
  reorderMenus = async (menus: ReorderMenuItem[]): Promise<void> => {
    await axiosInstance.patch('/menus/reorder', { menus });
  };
}

export const menuRepository = new MenuRepository();
