import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OrderTabs } from 'src/sections/order/components/order-tabs';
import type { OrderTab, OrderTabCounts } from 'src/types/orders';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

describe('OrderTabs', () => {
  const mockOnChange = vi.fn();
  const defaultTabCounts: OrderTabCounts = {
    all: 100,
    pending: 10,
    confirmed: 20,
    processing: 15,
    shipped: 25,
    delivered: 20,
    cancelled: 10,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <OrderTabs activeTab="all" tabCounts={defaultTabCounts} onChange={mockOnChange} />
      );
    }).not.toThrow();
  });

  it('renders all tabs', () => {
    render(<OrderTabs activeTab="all" tabCounts={defaultTabCounts} onChange={mockOnChange} />);

    expect(mockT).toHaveBeenCalledWith('all');
    expect(mockT).toHaveBeenCalledWith('orderStatusPending');
    expect(mockT).toHaveBeenCalledWith('orderStatusConfirmed');
    expect(mockT).toHaveBeenCalledWith('orderStatusProcessing');
    expect(mockT).toHaveBeenCalledWith('orderStatusShipped');
    expect(mockT).toHaveBeenCalledWith('orderStatusDelivered');
    expect(mockT).toHaveBeenCalledWith('orderStatusCancelled');
  });

  it('shows count for tabs with count > 0', () => {
    mockT.mockImplementation((key) => key);
    render(<OrderTabs activeTab="all" tabCounts={defaultTabCounts} onChange={mockOnChange} />);

    expect(screen.getByText('orderStatusPending (10)')).toBeInTheDocument();
    expect(screen.getByText('orderStatusConfirmed (20)')).toBeInTheDocument();
  });

  it('does not show count for all tab', () => {
    mockT.mockImplementation((key) => key);
    render(<OrderTabs activeTab="all" tabCounts={defaultTabCounts} onChange={mockOnChange} />);

    expect(screen.getByText('all')).toBeInTheDocument();
    expect(screen.queryByText('all (100)')).not.toBeInTheDocument();
  });

  it('does not show count for tabs with count = 0', () => {
    const countsWithZero: OrderTabCounts = {
      ...defaultTabCounts,
      pending: 0,
    };
    mockT.mockImplementation((key) => key);
    render(<OrderTabs activeTab="all" tabCounts={countsWithZero} onChange={mockOnChange} />);

    expect(screen.getByText('orderStatusPending')).toBeInTheDocument();
    expect(screen.queryByText('orderStatusPending (0)')).not.toBeInTheDocument();
  });

  it('calls onChange when tab is clicked', () => {
    render(<OrderTabs activeTab="all" tabCounts={defaultTabCounts} onChange={mockOnChange} />);

    const tabs = screen.getAllByRole('tab');
    fireEvent.click(tabs[1]); // Click pending tab

    expect(mockOnChange).toHaveBeenCalledWith('pending');
  });

  it('highlights active tab', () => {
    const { rerender } = render(
      <OrderTabs activeTab="all" tabCounts={defaultTabCounts} onChange={mockOnChange} />
    );

    const allTab = screen.getAllByRole('tab')[0];
    expect(allTab).toHaveClass('Mui-selected');

    rerender(<OrderTabs activeTab="pending" tabCounts={defaultTabCounts} onChange={mockOnChange} />);
    const pendingTab = screen.getAllByRole('tab')[1];
    expect(pendingTab).toHaveClass('Mui-selected');
  });

  it('uses translation hook', () => {
    render(<OrderTabs activeTab="all" tabCounts={defaultTabCounts} onChange={mockOnChange} />);
    expect(mockT).toHaveBeenCalled();
  });

  it('exports OrderTabs function', () => {
    expect(OrderTabs).toBeDefined();
    expect(typeof OrderTabs).toBe('function');
  });

  it('renders Tabs component', () => {
    const { container } = render(
      <OrderTabs activeTab="all" tabCounts={defaultTabCounts} onChange={mockOnChange} />
    );
    expect(container.querySelector('.MuiTabs-root')).toBeInTheDocument();
  });

  it('renders 7 tabs', () => {
    render(<OrderTabs activeTab="all" tabCounts={defaultTabCounts} onChange={mockOnChange} />);
    const tabs = screen.getAllByRole('tab');
    expect(tabs).toHaveLength(7);
  });

  it('renders with variant prop', () => {
    const { container } = render(
      <OrderTabs activeTab="all" tabCounts={defaultTabCounts} onChange={mockOnChange} />
    );
    expect(container.querySelector('.MuiTabs-root')).toBeInTheDocument();
  });

  it('renders each tab', () => {
    render(<OrderTabs activeTab="all" tabCounts={defaultTabCounts} onChange={mockOnChange} />);

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBeGreaterThan(0);
    expect(tabs[0]).toBeInTheDocument();
    expect(tabs[1]).toBeInTheDocument();
  });

  it('is a functional component', () => {
    expect(typeof OrderTabs).toBe('function');
    expect(OrderTabs.name).toBe('OrderTabs');
  });
});
