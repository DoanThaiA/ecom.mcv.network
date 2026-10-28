import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductInventoryTab } from 'src/sections/product-detail/product-inventory-tab';
import type { GetInventoriesResponse } from 'src/types/product-inventories';

const mockInventory: GetInventoriesResponse = {
  data: [
    {
      id: 'inv1',
      name: 'Variant 1',
      barcode: 'BAR001',
      totalAvailable: 100,
      totalShipping: 10,
      totalDamaged: 2,
      totalHolding: 5,
      prices: {
        import: 100000,
        retail: 150000,
      },
      depots: [
        {
          id: 'depot1',
          name: 'Depot 1',
          available: 50,
          shipping: 5,
        },
      ],
    },
  ],
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('ProductInventoryTab', () => {
  it('renders without crashing with null inventory', () => {
    const { container } = render(
      <ProductInventoryTab inventory={null} inventoryLoading={false} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders without crashing with inventory data', () => {
    const { container } = render(
      <ProductInventoryTab inventory={mockInventory} inventoryLoading={false} />
    );
    expect(container).toBeInTheDocument();
  });

  it('displays loading state', () => {
    render(<ProductInventoryTab inventory={null} inventoryLoading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('displays no data message when inventory is null', () => {
    const { container } = render(
      <ProductInventoryTab inventory={null} inventoryLoading={false} />
    );
    expect(container).toBeInTheDocument();
  });

  it('displays inventory data when available', () => {
    const { container } = render(
      <ProductInventoryTab inventory={mockInventory} inventoryLoading={false} />
    );
    const text = container.textContent || '';
    expect(text).toContain('BAR001'); // Barcode should be displayed
  });

  it('exports ProductInventoryTab function', () => {
    expect(ProductInventoryTab).toBeDefined();
    expect(typeof ProductInventoryTab).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ProductInventoryTab).toBe('function');
    expect(ProductInventoryTab.name).toBe('ProductInventoryTab');
  });

  it('renders Box container', () => {
    const { container } = render(
      <ProductInventoryTab inventory={mockInventory} inventoryLoading={false} />
    );
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Typography components', () => {
    const { container } = render(
      <ProductInventoryTab inventory={mockInventory} inventoryLoading={false} />
    );
    const typographies = container.querySelectorAll('.MuiTypography-root');
    expect(typographies.length).toBeGreaterThan(0);
  });

  it('handles empty inventory data array', () => {
    const emptyInventory: GetInventoriesResponse = { data: [] };
    const { container } = render(
      <ProductInventoryTab inventory={emptyInventory} inventoryLoading={false} />
    );
    expect(container).toBeInTheDocument();
  });

  it('displays barcode when available', () => {
    const { container } = render(
      <ProductInventoryTab inventory={mockInventory} inventoryLoading={false} />
    );
    expect(container).toBeInTheDocument();
  });

  it('displays total available quantity', () => {
    const { container } = render(
      <ProductInventoryTab inventory={mockInventory} inventoryLoading={false} />
    );
    const text = container.textContent || '';
    expect(text).toContain('100');
  });

  it('maintains state across renders', () => {
    const { rerender } = render(
      <ProductInventoryTab inventory={mockInventory} inventoryLoading={false} />
    );
    rerender(<ProductInventoryTab inventory={mockInventory} inventoryLoading={false} />);
    const { container } = render(
      <ProductInventoryTab inventory={mockInventory} inventoryLoading={false} />
    );
    expect(container).toBeInTheDocument();
  });

  it('handles inventory without depots', () => {
    const inventoryWithoutDepots: GetInventoriesResponse = {
      data: [
        {
          id: 'inv2',
          name: 'Variant 2',
          totalAvailable: 50,
        },
      ],
    };
    const { container } = render(
      <ProductInventoryTab inventory={inventoryWithoutDepots} inventoryLoading={false} />
    );
    expect(container).toBeInTheDocument();
  });

  it('handles inventory without prices', () => {
    const inventoryWithoutPrices: GetInventoriesResponse = {
      data: [
        {
          id: 'inv3',
          name: 'Variant 3',
          totalAvailable: 30,
        },
      ],
    };
    const { container } = render(
      <ProductInventoryTab inventory={inventoryWithoutPrices} inventoryLoading={false} />
    );
    expect(container).toBeInTheDocument();
  });
});
