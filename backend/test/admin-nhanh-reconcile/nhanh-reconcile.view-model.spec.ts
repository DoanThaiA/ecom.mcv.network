import { NhanhOrderStatus } from '../../src/nhanh/enums/nhanh-order-status.enum';
import {
  compareOrder,
  compareProduct,
  mapNhanhOrderStatus,
  ProductComparison,
  summariseOrders,
  summariseProducts,
} from '../../src/admin-nhanh-reconcile/nhanh-reconcile.view-model';

describe('nhanh reconcile view model', () => {
  describe('mapNhanhOrderStatus', () => {
    it('should cover every value of the NhanhOrderStatus enum', () => {
      // Guards the copy in the view model against drifting from
      // NhanhWebhookService.mapNhanhStatusToOrderStatus. If someone adds a
      // status to the enum and not to the map, this fails.
      const codes = Object.values(NhanhOrderStatus).filter(
        (v): v is number => typeof v === 'number',
      );
      expect(codes.length).toBeGreaterThan(0);
      for (const code of codes) {
        expect(mapNhanhOrderStatus(code)).not.toBeNull();
      }
    });

    it('should map the statuses that mattered during the outage', () => {
      expect(mapNhanhOrderStatus(60)).toBe('delivered');
      expect(mapNhanhOrderStatus(72)).toBe('refunded');
      expect(mapNhanhOrderStatus(63)).toBe('cancelled');
      expect(mapNhanhOrderStatus(59)).toBe('shipped');
    });

    it('should return null for codes it does not know', () => {
      expect(mapNhanhOrderStatus(999)).toBeNull();
      expect(mapNhanhOrderStatus(0)).toBeNull();
    });
  });

  describe('compareProduct', () => {
    const variant = {
      code: 'ABC-đen-M',
      status: 2,
      available: 5,
      parentId: 1234,
    };

    it('should report no divergence when both sides agree', () => {
      const c = compareProduct(variant, { status: 2, available: 5 });
      expect(c.statusDiverged).toBe(false);
      expect(c.stockDiverged).toBe(false);
      expect(c.showingWronglyOnWeb).toBe(false);
    });

    it('should flag a product still selling on web that Nhanh has hidden', () => {
      const c = compareProduct(variant, { status: 1, available: 5 });
      expect(c.statusDiverged).toBe(true);
      expect(c.showingWronglyOnWeb).toBe(true);
    });

    it('should not call it showing-wrongly when web already hides it', () => {
      const c = compareProduct(
        { ...variant, status: 1 },
        { status: 2, available: 5 },
      );
      expect(c.statusDiverged).toBe(true);
      expect(c.showingWronglyOnWeb).toBe(false);
    });

    it('should compare availability, not the stale denormalised stock field', () => {
      // Reproduces 15QDD2083ST-trắng-XL on 12/08/2026: stock said 8, but both
      // inventory.available and Nhanh said 0. Comparing `stock` would have
      // raised a false alarm on hundreds of healthy SKUs.
      const c = compareProduct(
        { ...variant, available: 0 },
        { status: 2, available: 0 },
      );
      expect(c.stockDiverged).toBe(false);
      expect(c.dbAvailable).toBe(0);
    });

    it('should flag genuine stock divergence on a variant', () => {
      const c = compareProduct(variant, { status: 2, available: 0 });
      expect(c.stockDiverged).toBe(true);
      expect(c.nhanhAvailable).toBe(0);
    });

    it('should never compare stock on a parent product', () => {
      // Nhanh reports available: 0 on every parent because stock lives on the
      // children, while we store the sum of children on the parent. Comparing
      // marks every parent as diverged.
      const parent = { code: 'ABC', status: 2, available: 212, parentId: -2 };
      const c = compareProduct(parent, { status: 2, available: 0 });
      expect(c.isParent).toBe(true);
      expect(c.stockComparable).toBe(false);
      expect(c.stockDiverged).toBe(false);
      expect(c.notes.join(' ')).toContain('Sản phẩm cha');
    });

    it('should still compare status on a parent product', () => {
      const parent = { code: 'ABC', status: 2, available: 212, parentId: -2 };
      const c = compareProduct(parent, { status: 3, available: 0 });
      expect(c.statusDiverged).toBe(true);
      expect(c.showingWronglyOnWeb).toBe(true);
    });

    it('should refuse to conclude anything when Nhanh returns nothing', () => {
      const c = compareProduct(variant, null);
      expect(c.statusDiverged).toBe(false);
      expect(c.stockDiverged).toBe(false);
      expect(c.nhanhStatus).toBeNull();
      expect(c.notes.join(' ')).toContain('không tự suy diễn');
    });

    it('should not treat an unknown status code as a divergence', () => {
      const c = compareProduct({ ...variant, status: 99 }, { status: 2 });
      expect(c.statusDiverged).toBe(false);
      expect(c.notes.join(' ')).toContain('không hợp lệ');
    });
  });

  describe('compareOrder', () => {
    it('should flag an order Nhanh delivered while web still says pending', () => {
      const c = compareOrder('pending', 60);
      expect(c.diverged).toBe(true);
      expect(c.shouldBe).toBe('delivered');
      expect(c.nhanhStatusLabel).toBe('Thành công');
    });

    it('should report no divergence when both agree', () => {
      expect(compareOrder('delivered', 60).diverged).toBe(false);
    });

    it('should refuse to conclude when Nhanh returns nothing', () => {
      const c = compareOrder('pending', null);
      expect(c.diverged).toBe(false);
      expect(c.notes.join(' ')).toContain('không trả về đơn này');
    });

    it('should not flag divergence on a status code it cannot map', () => {
      const c = compareOrder('pending', 999);
      expect(c.diverged).toBe(false);
      expect(c.notes.join(' ')).toContain('chưa có trong bảng ánh xạ');
    });
  });

  describe('summaries', () => {
    const c = (over: Partial<ProductComparison>): ProductComparison => ({
      statusDiverged: false,
      stockDiverged: false,
      stockComparable: true,
      dbStatus: 2,
      nhanhStatus: 2,
      dbAvailable: 1,
      nhanhAvailable: 1,
      isParent: false,
      showingWronglyOnWeb: false,
      notes: [],
      ...over,
    });

    it('should compute a divergence rate over the sample', () => {
      const s = summariseProducts([
        c({ statusDiverged: true, showingWronglyOnWeb: true }),
        c({ stockDiverged: true }),
        c({}),
        c({}),
      ]);
      expect(s.checked).toBe(4);
      expect(s.statusDiverged).toBe(1);
      expect(s.stockDiverged).toBe(1);
      expect(s.showingWronglyOnWeb).toBe(1);
      expect(s.divergenceRatePercent).toBe(50);
    });

    it('should not count one item twice when both status and stock differ', () => {
      const s = summariseProducts([
        c({ statusDiverged: true, stockDiverged: true }),
        c({}),
      ]);
      expect(s.divergenceRatePercent).toBe(50);
    });

    it('should return zero rather than divide by zero on an empty sample', () => {
      expect(summariseProducts([]).divergenceRatePercent).toBe(0);
      expect(summariseOrders([]).divergenceRatePercent).toBe(0);
    });

    it('should count orders Nhanh did not return separately from divergence', () => {
      const s = summariseOrders([
        compareOrder('pending', 60),
        compareOrder('pending', null),
        compareOrder('delivered', 60),
      ]);
      expect(s.checked).toBe(3);
      expect(s.statusDiverged).toBe(1);
      expect(s.notReturnedByNhanh).toBe(1);
    });
  });
});
