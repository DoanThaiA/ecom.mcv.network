import { describe, it, expect } from 'vitest';
import {
  STORES,
  STORE_STATS,
  getStoresByCity,
  type Store,
  type StoreGroup,
} from '@/lib/constants/stores';

describe('stores', () => {
  describe('STORES constant', () => {
    it('exports array of stores', () => {
      expect(STORES).toBeInstanceOf(Array);
      expect(STORES.length).toBeGreaterThan(0);
    });

    it('all stores have required fields', () => {
      STORES.forEach((store: Store) => {
        expect(store.id).toBeDefined();
        expect(store.name).toBeDefined();
        expect(store.shortName).toBeDefined();
        expect(store.city).toBeDefined();
        expect(store.address).toBeDefined();
        expect(store.phone).toBeDefined();
        expect(store.openTime).toBeDefined();
        expect(store.closeTime).toBeDefined();
        expect(store.googleMapUrl).toBeDefined();
        expect(store.googleMapEmbedUrl).toBeDefined();
      });
    });

    it('all stores have unique IDs', () => {
      const ids = STORES.map((store) => store.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('contains Hanoi stores', () => {
      const hanoiStores = STORES.filter((store) => store.city === 'Hà Nội');
      expect(hanoiStores.length).toBeGreaterThan(0);
    });
  });

  describe('STORE_STATS constant', () => {
    it('has totalStores count', () => {
      expect(STORE_STATS.totalStores).toBeDefined();
      expect(typeof STORE_STATS.totalStores).toBe('number');
    });

    it('has customersPerDay count', () => {
      expect(STORE_STATS.customersPerDay).toBeDefined();
      expect(typeof STORE_STATS.customersPerDay).toBe('number');
    });

    it('totalStores matches STORES array length', () => {
      expect(STORE_STATS.totalStores).toBe(STORES.length);
    });
  });

  describe('getStoresByCity', () => {
    it('returns array of store groups', () => {
      const result = getStoresByCity();
      expect(result).toBeInstanceOf(Array);
      expect(result.length).toBeGreaterThan(0);
    });

    it('groups have city and stores fields', () => {
      const result = getStoresByCity();
      result.forEach((group: StoreGroup) => {
        expect(group.city).toBeDefined();
        expect(group.stores).toBeInstanceOf(Array);
      });
    });

    it('puts Hanoi stores in first group', () => {
      const result = getStoresByCity();
      expect(result[0].city).toBe('Hà Nội');
      expect(result[0].stores.length).toBeGreaterThan(0);
      result[0].stores.forEach((store) => {
        expect(store.city).toBe('Hà Nội');
      });
    });

    it('groups other cities together', () => {
      const result = getStoresByCity();
      const otherCitiesGroup = result.find(
        (group) => group.city === 'Các thành phố khác'
      );

      if (otherCitiesGroup) {
        otherCitiesGroup.stores.forEach((store) => {
          expect(store.city).not.toBe('Hà Nội');
        });
      }
    });

    it('includes all stores from STORES', () => {
      const result = getStoresByCity();
      const allGroupedStores = result.flatMap((group) => group.stores);
      expect(allGroupedStores.length).toBe(STORES.length);
    });

    it('each store appears exactly once in groups', () => {
      const result = getStoresByCity();
      const allIds = result.flatMap((group) =>
        group.stores.map((store) => store.id)
      );
      const uniqueIds = new Set(allIds);
      expect(uniqueIds.size).toBe(allIds.length);
    });

    it('maintains original store data in groups', () => {
      const result = getStoresByCity();
      const firstGroupStore = result[0].stores[0];
      const originalStore = STORES.find(
        (store) => store.id === firstGroupStore.id
      );

      expect(firstGroupStore).toEqual(originalStore);
    });
  });
});
