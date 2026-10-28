import { describe, it, expect, vi, beforeEach } from 'vitest';
import { menuRepository } from 'src/repositories/menu.repository';
import axiosInstance from 'src/utils/axios';
import { MenuStatus } from 'src/types/gen/shared/shared/common/enums';

vi.mock('src/utils/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('menuRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('exports menuRepository instance', () => {
    expect(menuRepository).toBeDefined();
    expect(menuRepository).toHaveProperty('getMenus');
    expect(menuRepository).toHaveProperty('getAllMenus');
    expect(menuRepository).toHaveProperty('getMenuById');
    expect(menuRepository).toHaveProperty('createMenu');
    expect(menuRepository).toHaveProperty('updateMenu');
    expect(menuRepository).toHaveProperty('deleteMenu');
    expect(menuRepository).toHaveProperty('reorderMenus');
  });

  describe('getMenus', () => {
    it('calls GET /menus with page and limit', async () => {
      const mockResponse = {
        data: {
          data: [],
          total: 0,
          hasNextPage: false,
          page: 1,
          limit: 10,
          totalPages: 0,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await menuRepository.getMenus({ page: 1, limit: 10 });

      expect(axiosInstance.get).toHaveBeenCalledWith('/menus', {
        params: {
          page: '1',
          limit: '10',
        },
      });
    });

    it('uses default page and limit when not provided', async () => {
      const mockResponse = {
        data: [],
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await menuRepository.getMenus({});

      expect(axiosInstance.get).toHaveBeenCalledWith('/menus', {
        params: {
          page: '1',
          limit: '10',
        },
      });
    });

    it('includes filters when provided', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const filters = { name: 'test', status: 'active' };
      await menuRepository.getMenus({ filters });

      expect(axiosInstance.get).toHaveBeenCalledWith('/menus', {
        params: {
          page: '1',
          limit: '10',
          filters: JSON.stringify(filters),
        },
      });
    });

    it('omits filters when empty object', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await menuRepository.getMenus({ filters: {} });

      expect(axiosInstance.get).toHaveBeenCalledWith('/menus', {
        params: {
          page: '1',
          limit: '10',
        },
      });
    });

    it('includes sort when provided', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const sort = [{ field: 'createdAt', order: 'desc' }];
      await menuRepository.getMenus({ sort });

      expect(axiosInstance.get).toHaveBeenCalledWith('/menus', {
        params: {
          page: '1',
          limit: '10',
          sort: JSON.stringify(sort),
        },
      });
    });

    it('omits sort when empty array', async () => {
      const mockResponse = { data: [] };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await menuRepository.getMenus({ sort: [] });

      expect(axiosInstance.get).toHaveBeenCalledWith('/menus', {
        params: {
          page: '1',
          limit: '10',
        },
      });
    });

    it('wraps array response in paginated format', async () => {
      const mockMenus = [
        { id: 'm1', name: 'Menu 1' },
        { id: 'm2', name: 'Menu 2' },
      ];
      const mockResponse = { data: mockMenus };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await menuRepository.getMenus({ page: 1, limit: 10 });

      expect(result).toEqual({
        data: mockMenus,
        hasNextPage: false,
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('sets hasNextPage true when array length equals limit', async () => {
      const mockMenus = Array(10)
        .fill(null)
        .map((_, i) => ({ id: `m${i}`, name: `Menu ${i}` }));
      const mockResponse = { data: mockMenus };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await menuRepository.getMenus({ limit: 10 });

      expect(result.hasNextPage).toBe(true);
    });

    it('returns paginated response as is', async () => {
      const mockResponse = {
        data: {
          data: [{ id: 'm1', name: 'Menu 1' }],
          hasNextPage: true,
          total: 100,
          page: 2,
          limit: 20,
          totalPages: 5,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await menuRepository.getMenus({});

      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('getAllMenus', () => {
    it('calls GET /menus with limit 1000', async () => {
      const mockResponse = {
        data: [],
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await menuRepository.getAllMenus();

      expect(axiosInstance.get).toHaveBeenCalledWith('/menus', {
        params: { limit: '1000' },
      });
    });

    it('returns array when response is array', async () => {
      const mockMenus = [
        { id: 'm1', name: 'Menu 1' },
        { id: 'm2', name: 'Menu 2' },
      ];
      const mockResponse = { data: mockMenus };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await menuRepository.getAllMenus();

      expect(result).toEqual(mockMenus);
    });

    it('returns data array when response is paginated', async () => {
      const mockMenus = [
        { id: 'm1', name: 'Menu 1' },
        { id: 'm2', name: 'Menu 2' },
      ];
      const mockResponse = {
        data: {
          data: mockMenus,
          total: 2,
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await menuRepository.getAllMenus();

      expect(result).toEqual(mockMenus);
    });
  });

  describe('getMenuById', () => {
    it('calls GET /menus/:id', async () => {
      const mockResponse = {
        data: {
          id: 'm1',
          name: 'Menu 1',
        },
      };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      await menuRepository.getMenuById('m1');

      expect(axiosInstance.get).toHaveBeenCalledWith('/menus/m1');
    });

    it('returns Menu', async () => {
      const mockMenu = {
        id: 'm1',
        name: 'Test Menu',
      };
      const mockResponse = { data: mockMenu };
      vi.mocked(axiosInstance.get).mockResolvedValue(mockResponse);

      const result = await menuRepository.getMenuById('m1');

      expect(result).toEqual(mockMenu);
    });
  });

  describe('createMenu', () => {
    it('calls POST /menus with active status', async () => {
      const mockData = {
        name: 'New Menu',
        status: MenuStatus.MENU_STATUS_ACTIVE,
      };
      const mockResponse = {
        data: {
          id: 'm1',
          name: 'New Menu',
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await menuRepository.createMenu(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/menus', {
        name: 'New Menu',
        status: 'active',
      });
    });

    it('calls POST /menus with inactive status', async () => {
      const mockData = {
        name: 'New Menu',
        status: MenuStatus.MENU_STATUS_INACTIVE,
      };
      const mockResponse = {
        data: {
          id: 'm1',
          name: 'New Menu',
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await menuRepository.createMenu(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/menus', {
        name: 'New Menu',
        status: 'inactive',
      });
    });

    it('handles string active status', async () => {
      const mockData = {
        name: 'New Menu',
        status: 'active' as any,
      };
      const mockResponse = {
        data: {
          id: 'm1',
          name: 'New Menu',
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await menuRepository.createMenu(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/menus', {
        name: 'New Menu',
        status: 'active',
      });
    });

    it('handles string inactive status', async () => {
      const mockData = {
        name: 'New Menu',
        status: 'inactive' as any,
      };
      const mockResponse = {
        data: {
          id: 'm1',
          name: 'New Menu',
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await menuRepository.createMenu(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/menus', {
        name: 'New Menu',
        status: 'inactive',
      });
    });

    it('handles undefined status', async () => {
      const mockData = {
        name: 'New Menu',
      };
      const mockResponse = {
        data: {
          id: 'm1',
          name: 'New Menu',
        },
      };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      await menuRepository.createMenu(mockData);

      expect(axiosInstance.post).toHaveBeenCalledWith('/menus', {
        name: 'New Menu',
        status: undefined,
      });
    });

    it('returns created Menu', async () => {
      const mockData = {
        name: 'New Menu',
        status: MenuStatus.MENU_STATUS_ACTIVE,
      };
      const mockMenu = {
        id: 'm1',
        name: 'New Menu',
      };
      const mockResponse = { data: mockMenu };
      vi.mocked(axiosInstance.post).mockResolvedValue(mockResponse);

      const result = await menuRepository.createMenu(mockData);

      expect(result).toEqual(mockMenu);
    });
  });

  describe('updateMenu', () => {
    it('calls PATCH /menus/:id with active status', async () => {
      const mockData = {
        name: 'Updated Menu',
        status: MenuStatus.MENU_STATUS_ACTIVE,
      };
      const mockResponse = {
        data: {
          id: 'm1',
          name: 'Updated Menu',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await menuRepository.updateMenu('m1', mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/menus/m1', {
        name: 'Updated Menu',
        status: 'active',
      });
    });

    it('calls PATCH /menus/:id with inactive status', async () => {
      const mockData = {
        name: 'Updated Menu',
        status: MenuStatus.MENU_STATUS_INACTIVE,
      };
      const mockResponse = {
        data: {
          id: 'm1',
          name: 'Updated Menu',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await menuRepository.updateMenu('m1', mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/menus/m1', {
        name: 'Updated Menu',
        status: 'inactive',
      });
    });

    it('handles string active status', async () => {
      const mockData = {
        name: 'Updated Menu',
        status: 'active' as any,
      };
      const mockResponse = {
        data: {
          id: 'm1',
          name: 'Updated Menu',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await menuRepository.updateMenu('m1', mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/menus/m1', {
        name: 'Updated Menu',
        status: 'active',
      });
    });

    it('handles undefined status', async () => {
      const mockData = {
        name: 'Updated Menu',
      };
      const mockResponse = {
        data: {
          id: 'm1',
          name: 'Updated Menu',
        },
      };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      await menuRepository.updateMenu('m1', mockData);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/menus/m1', {
        name: 'Updated Menu',
        status: undefined,
      });
    });

    it('returns updated Menu', async () => {
      const mockData = {
        name: 'Updated Menu',
      };
      const mockMenu = {
        id: 'm1',
        name: 'Updated Menu',
      };
      const mockResponse = { data: mockMenu };
      vi.mocked(axiosInstance.patch).mockResolvedValue(mockResponse);

      const result = await menuRepository.updateMenu('m1', mockData);

      expect(result).toEqual(mockMenu);
    });
  });

  describe('deleteMenu', () => {
    it('calls DELETE /menus/:id', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({});

      await menuRepository.deleteMenu('m1');

      expect(axiosInstance.delete).toHaveBeenCalledWith('/menus/m1');
    });

    it('returns void', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValue({});

      const result = await menuRepository.deleteMenu('m1');

      expect(result).toBeUndefined();
    });
  });

  describe('reorderMenus', () => {
    it('calls PATCH /menus/reorder', async () => {
      const menus = [
        { id: 'm1', sortOrder: 1 },
        { id: 'm2', sortOrder: 2 },
      ];
      vi.mocked(axiosInstance.patch).mockResolvedValue({});

      await menuRepository.reorderMenus(menus);

      expect(axiosInstance.patch).toHaveBeenCalledWith('/menus/reorder', { menus });
    });

    it('returns void', async () => {
      const menus = [{ id: 'm1', sortOrder: 1 }];
      vi.mocked(axiosInstance.patch).mockResolvedValue({});

      const result = await menuRepository.reorderMenus(menus);

      expect(result).toBeUndefined();
    });
  });
});
