import { describe, it, expect } from 'vitest';
import { columnWidths, getColumnStyle } from 'src/sections/review/review-config';

describe('review-config', () => {
  describe('columnWidths', () => {
    it('exports columnWidths object', () => {
      expect(columnWidths).toBeDefined();
      expect(typeof columnWidths).toBe('object');
    });

    it('has orderId width defined', () => {
      expect(columnWidths.orderId).toBe('12%');
    });

    it('has nhanhId width defined', () => {
      expect(columnWidths.nhanhId).toBe('8%');
    });

    it('has product width defined', () => {
      expect(columnWidths.product).toBe('15%');
    });

    it('has height width defined', () => {
      expect(columnWidths.height).toBe('8%');
    });

    it('has weight width defined', () => {
      expect(columnWidths.weight).toBe('8%');
    });

    it('has fitLevel width defined', () => {
      expect(columnWidths.fitLevel).toBe('10%');
    });

    it('has content width defined', () => {
      expect(columnWidths.content).toBe('35%');
    });

    it('has status width defined', () => {
      expect(columnWidths.status).toBe('6%');
    });
  });

  describe('getColumnStyle', () => {
    it('exports getColumnStyle function', () => {
      expect(getColumnStyle).toBeDefined();
      expect(typeof getColumnStyle).toBe('function');
    });

    it('returns style object with correct width for orderId', () => {
      const style = getColumnStyle('orderId');
      expect(style.width).toBe('12%');
    });

    it('returns style object with correct width for product', () => {
      const style = getColumnStyle('product');
      expect(style.width).toBe('15%');
    });

    it('returns style object with border-right by default', () => {
      const style = getColumnStyle('orderId');
      expect(style.borderRight).toBe('1px solid #E5E6EB');
    });

    it('returns style object without border-right when isLast is true', () => {
      const style = getColumnStyle('status', true);
      expect(style.borderRight).toBe('none');
    });

    it('returns style object with padding', () => {
      const style = getColumnStyle('orderId');
      expect(style.p).toBe(1.5);
    });

    it('returns style object with display flex', () => {
      const style = getColumnStyle('orderId');
      expect(style.display).toBe('flex');
    });

    it('returns style object with alignItems center', () => {
      const style = getColumnStyle('orderId');
      expect(style.alignItems).toBe('center');
    });

    it('returns default width for unknown key', () => {
      const style = getColumnStyle('unknown');
      expect(style.width).toBe('10%');
    });
  });
});
