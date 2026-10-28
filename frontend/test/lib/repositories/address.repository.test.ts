import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  getCities,
  getDistricts,
  getWards,
  getMyShippingAddresses,
  addMyShippingAddress,
  updateMyShippingAddress,
  deleteMyShippingAddress,
  setDefaultMyShippingAddress,
  clearLocationCache,
  type Address,
  type City,
  type District,
  type Ward,
} from '@/lib/repositories/address.repository';
import axiosInstance from '@/lib/axios';

// Mock axios
vi.mock('@/lib/axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('AddressRepository', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    clearLocationCache(); // Clear cache after clearing mocks
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.clearAllMocks();
    clearLocationCache();
  });

  describe('getCities', () => {
    it('fetches cities from API', async () => {
      const mockCities: City[] = [
        { id: 1, name: 'Hanoi' },
        { id: 2, name: 'Ho Chi Minh' },
      ];

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { data: mockCities },
      });

      const result = await getCities();

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/shipping/locations/cities'
      );
      expect(result).toEqual(mockCities);
      expect(console.log).toHaveBeenCalledWith('Fetching cities from API');
    });

    it('returns cached cities on second call', async () => {
      const mockCities: City[] = [{ id: 1, name: 'Hanoi' }];

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { data: mockCities },
      });

      await getCities();
      const result = await getCities();

      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCities);
      expect(console.log).toHaveBeenCalledWith('Using cached cities data');
    });

    it('deduplicates concurrent requests', async () => {
      vi.mocked(axiosInstance.get).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ data: { data: [{ id: 1, name: 'Hanoi' }] } }),
              100
            )
          )
      );

      const [result1, result2] = await Promise.all([getCities(), getCities()]);

      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
      expect(console.log).toHaveBeenCalledWith(
        'Waiting for in-flight cities request'
      );
    });

    it('handles array response format', async () => {
      const mockCities: City[] = [{ id: 1, name: 'Hanoi' }];

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockCities,
      });

      const result = await getCities();

      expect(result).toEqual(mockCities);
    });

    it('returns empty array on error', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await getCities();

      expect(result).toEqual([]);
      expect(console.error).toHaveBeenCalledWith(
        'Failed to fetch cities:',
        expect.any(Error)
      );
    });

    it('returns cached data on error if available', async () => {
      vi.useFakeTimers();
      const mockCities: City[] = [{ id: 1, name: 'Hanoi' }];

      // First call: populate cache
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { data: mockCities },
      });
      await getCities();

      // Advance time by 25 hours to make cache expire
      vi.advanceTimersByTime(25 * 60 * 60 * 1000);

      // Now make API call fail - should return expired cached data
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await getCities();
      expect(result).toEqual(mockCities);

      vi.useRealTimers();
    });
  });

  describe('getDistricts', () => {
    it('fetches districts for a city', async () => {
      const mockDistricts: District[] = [
        { id: 10, name: 'District 1' },
        { id: 20, name: 'District 2' },
      ];

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { data: mockDistricts },
      });

      const result = await getDistricts(1);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/shipping/locations/districts',
        { params: { cityId: 1 } }
      );
      expect(result).toEqual(mockDistricts);
    });

    it('returns cached districts on second call', async () => {
      const mockDistricts: District[] = [{ id: 10, name: 'District 1' }];

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { data: mockDistricts },
      });

      await getDistricts(1);
      const result = await getDistricts(1);

      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDistricts);
    });

    it('fetches different city districts separately', async () => {
      vi.mocked(axiosInstance.get)
        .mockResolvedValueOnce({
          data: { data: [{ id: 10, name: 'District 1' }] },
        })
        .mockResolvedValueOnce({
          data: { data: [{ id: 30, name: 'District 3' }] },
        });

      const result1 = await getDistricts(1);
      const result2 = await getDistricts(2);

      expect(result1[0].id).toBe(10);
      expect(result2[0].id).toBe(30);
    });

    it('deduplicates concurrent requests for same city', async () => {
      vi.mocked(axiosInstance.get).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({ data: { data: [{ id: 10, name: 'District 1' }] } }),
              100
            )
          )
      );

      const [result1, result2] = await Promise.all([
        getDistricts(1),
        getDistricts(1),
      ]);

      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it('returns empty array on error', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await getDistricts(1);

      expect(result).toEqual([]);
    });
  });

  describe('getWards', () => {
    it('fetches wards for a district', async () => {
      const mockWards: Ward[] = [
        { id: 100, name: 'Ward 1' },
        { id: 200, name: 'Ward 2' },
      ];

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { data: mockWards },
      });

      const result = await getWards(10);

      expect(axiosInstance.get).toHaveBeenCalledWith(
        '/shop/shipping/locations/wards',
        { params: { districtId: 10 } }
      );
      expect(result).toEqual(mockWards);
    });

    it('returns cached wards on second call', async () => {
      const mockWards: Ward[] = [{ id: 100, name: 'Ward 1' }];

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { data: mockWards },
      });

      await getWards(10);
      const result = await getWards(10);

      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockWards);
    });

    it('fetches different district wards separately', async () => {
      vi.mocked(axiosInstance.get)
        .mockResolvedValueOnce({
          data: { data: [{ id: 100, name: 'Ward 1' }] },
        })
        .mockResolvedValueOnce({
          data: { data: [{ id: 300, name: 'Ward 3' }] },
        });

      const result1 = await getWards(10);
      const result2 = await getWards(20);

      expect(result1[0].id).toBe(100);
      expect(result2[0].id).toBe(300);
    });

    it('deduplicates concurrent requests for same district', async () => {
      vi.mocked(axiosInstance.get).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () => resolve({ data: { data: [{ id: 100, name: 'Ward 1' }] } }),
              100
            )
          )
      );

      const [result1, result2] = await Promise.all([getWards(10), getWards(10)]);

      expect(axiosInstance.get).toHaveBeenCalledTimes(1);
      expect(result1).toEqual(result2);
    });

    it('returns empty array on error', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Network error')
      );

      const result = await getWards(10);

      expect(result).toEqual([]);
    });
  });

  describe('getMyShippingAddresses', () => {
    it('fetches user addresses', async () => {
      const mockAddresses: Address[] = [
        {
          id: '1',
          address: '123 Main St',
          isDefault: true,
        } as Address,
      ];

      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: mockAddresses,
      });

      const result = await getMyShippingAddresses();

      expect(axiosInstance.get).toHaveBeenCalledWith('/addresses');
      expect(result).toEqual(mockAddresses);
    });

    it('returns empty array on error', async () => {
      vi.mocked(axiosInstance.get).mockRejectedValueOnce(
        new Error('Unauthorized')
      );

      const result = await getMyShippingAddresses();

      expect(result).toEqual([]);
    });

    it('returns empty array if data is null', async () => {
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: null,
      });

      const result = await getMyShippingAddresses();

      expect(result).toEqual([]);
    });
  });

  describe('addMyShippingAddress', () => {
    it('adds new address successfully', async () => {
      const newAddress = {
        address: '456 Second St',
        cityId: 1,
        districtId: 10,
        wardId: 100,
        isDefault: false,
      };

      const mockResponse: Address = {
        id: '2',
        ...newAddress,
      } as Address;

      vi.mocked(axiosInstance.post).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await addMyShippingAddress(newAddress);

      expect(axiosInstance.post).toHaveBeenCalledWith('/addresses', newAddress);
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      vi.mocked(axiosInstance.post).mockRejectedValueOnce(
        new Error('Invalid address')
      );

      await expect(
        addMyShippingAddress({
          address: 'Invalid',
          cityId: 1,
          districtId: 10,
          wardId: 100,
        })
      ).rejects.toThrow('Invalid address');
    });
  });

  describe('updateMyShippingAddress', () => {
    it('updates address successfully', async () => {
      const updates = {
        address: '789 Third St',
      };

      const mockResponse: Address = {
        id: '1',
        address: '789 Third St',
      } as Address;

      vi.mocked(axiosInstance.put).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await updateMyShippingAddress('1', updates);

      expect(axiosInstance.put).toHaveBeenCalledWith('/addresses/1', updates);
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      vi.mocked(axiosInstance.put).mockRejectedValueOnce(
        new Error('Address not found')
      );

      await expect(
        updateMyShippingAddress('invalid-id', { address: 'Test' })
      ).rejects.toThrow('Address not found');
    });
  });

  describe('deleteMyShippingAddress', () => {
    it('deletes address successfully', async () => {
      vi.mocked(axiosInstance.delete).mockResolvedValueOnce({ data: undefined });

      await deleteMyShippingAddress('1');

      expect(axiosInstance.delete).toHaveBeenCalledWith('/addresses/1');
    });

    it('throws error on failure', async () => {
      vi.mocked(axiosInstance.delete).mockRejectedValueOnce(
        new Error('Cannot delete default address')
      );

      await expect(deleteMyShippingAddress('1')).rejects.toThrow(
        'Cannot delete default address'
      );
    });
  });

  describe('setDefaultMyShippingAddress', () => {
    it('sets address as default successfully', async () => {
      const mockResponse: Address = {
        id: '2',
        isDefault: true,
      } as Address;

      vi.mocked(axiosInstance.put).mockResolvedValueOnce({
        data: mockResponse,
      });

      const result = await setDefaultMyShippingAddress('2');

      expect(axiosInstance.put).toHaveBeenCalledWith('/addresses/2/set-default');
      expect(result).toEqual(mockResponse);
    });

    it('throws error on failure', async () => {
      vi.mocked(axiosInstance.put).mockRejectedValueOnce(
        new Error('Address not found')
      );

      await expect(setDefaultMyShippingAddress('invalid-id')).rejects.toThrow(
        'Address not found'
      );
    });
  });

  describe('clearLocationCache', () => {
    it('clears all location cache', async () => {
      // Populate cache
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { data: [{ id: 1, name: 'Hanoi' }] },
      });

      await getCities();
      expect(axiosInstance.get).toHaveBeenCalledTimes(1);

      // Clear cache
      clearLocationCache();

      // Fetch again - should make new API call
      vi.mocked(axiosInstance.get).mockResolvedValueOnce({
        data: { data: [{ id: 1, name: 'Hanoi' }] },
      });

      await getCities();
      expect(axiosInstance.get).toHaveBeenCalledTimes(2);
    });
  });
});
