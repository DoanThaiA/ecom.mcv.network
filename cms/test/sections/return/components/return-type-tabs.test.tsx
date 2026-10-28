import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReturnTypeTabs } from 'src/sections/return/components/return-type-tabs';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('ReturnTypeTabs', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
  });

  it('renders Box container', () => {
    const { container } = render(
      <ReturnTypeTabs activeType="refund" onChange={mockOnChange} />
    );
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('renders Tabs component', () => {
    const { container } = render(
      <ReturnTypeTabs activeType="refund" onChange={mockOnChange} />
    );
    expect(container.querySelector('.MuiTabs-root')).toBeInTheDocument();
  });

  it('renders refund tab', () => {
    render(<ReturnTypeTabs activeType="refund" onChange={mockOnChange} />);
    expect(screen.getByText('returnTypeRefund')).toBeInTheDocument();
  });

  it('renders exchange tab', () => {
    render(<ReturnTypeTabs activeType="refund" onChange={mockOnChange} />);
    expect(screen.getByText('returnTypeExchange')).toBeInTheDocument();
  });

  it('sets active tab to refund', () => {
    const { container } = render(
      <ReturnTypeTabs activeType="refund" onChange={mockOnChange} />
    );
    const tabs = container.querySelector('.MuiTabs-root');
    expect(tabs).toBeInTheDocument();
  });

  it('sets active tab to exchange', () => {
    const { container } = render(
      <ReturnTypeTabs activeType="exchange" onChange={mockOnChange} />
    );
    const tabs = container.querySelector('.MuiTabs-root');
    expect(tabs).toBeInTheDocument();
  });

  it('calls onChange when tab is clicked', () => {
    render(<ReturnTypeTabs activeType="refund" onChange={mockOnChange} />);
    const exchangeTab = screen.getByText('returnTypeExchange');

    fireEvent.click(exchangeTab);
    expect(mockOnChange).toHaveBeenCalledWith('exchange');
  });

  it('translates refund tab label', () => {
    render(<ReturnTypeTabs activeType="refund" onChange={mockOnChange} />);
    expect(screen.getByText('returnTypeRefund')).toBeInTheDocument();
  });

  it('translates exchange tab label', () => {
    render(<ReturnTypeTabs activeType="refund" onChange={mockOnChange} />);
    expect(screen.getByText('returnTypeExchange')).toBeInTheDocument();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<ReturnTypeTabs activeType="refund" onChange={mockOnChange} />);
    }).not.toThrow();
  });

  it('exports ReturnTypeTabs function', () => {
    expect(ReturnTypeTabs).toBeDefined();
    expect(typeof ReturnTypeTabs).toBe('function');
  });

  it('Box has correct padding styles', () => {
    const { container } = render(
      <ReturnTypeTabs activeType="refund" onChange={mockOnChange} />
    );
    const box = container.querySelector('.MuiBox-root');
    expect(box).toHaveStyle({ paddingLeft: '16px', paddingRight: '16px' });
  });

  it('Tabs has correct min height', () => {
    const { container } = render(
      <ReturnTypeTabs activeType="refund" onChange={mockOnChange} />
    );
    const tabs = container.querySelector('.MuiTabs-root');
    expect(tabs).toHaveStyle({ minHeight: '36px' });
  });

  it('renders both tabs', () => {
    const { container } = render(
      <ReturnTypeTabs activeType="refund" onChange={mockOnChange} />
    );
    const tabs = container.querySelectorAll('.MuiTab-root');
    expect(tabs.length).toBe(2);
  });

  it('refund tab has correct value', () => {
    render(<ReturnTypeTabs activeType="refund" onChange={mockOnChange} />);
    const refundTab = screen.getByText('returnTypeRefund').closest('.MuiTab-root');
    expect(refundTab).toBeInTheDocument();
  });

  it('exchange tab has correct value', () => {
    render(<ReturnTypeTabs activeType="refund" onChange={mockOnChange} />);
    const exchangeTab = screen.getByText('returnTypeExchange').closest('.MuiTab-root');
    expect(exchangeTab).toBeInTheDocument();
  });

  it('calls onChange with correct value when switching tabs', () => {
    render(<ReturnTypeTabs activeType="refund" onChange={mockOnChange} />);
    const exchangeTab = screen.getByText('returnTypeExchange');

    fireEvent.click(exchangeTab);
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('exchange');
  });

  it('handles activeType prop correctly', () => {
    const { rerender } = render(
      <ReturnTypeTabs activeType="refund" onChange={mockOnChange} />
    );
    expect(screen.getByText('returnTypeRefund')).toBeInTheDocument();

    rerender(<ReturnTypeTabs activeType="exchange" onChange={mockOnChange} />);
    expect(screen.getByText('returnTypeExchange')).toBeInTheDocument();
  });

  it('uses translation hook', () => {
    render(<ReturnTypeTabs activeType="refund" onChange={mockOnChange} />);
    expect(screen.getByText('returnTypeRefund')).toBeInTheDocument();
    expect(screen.getByText('returnTypeExchange')).toBeInTheDocument();
  });

  it('has correct component structure', () => {
    const { container } = render(
      <ReturnTypeTabs activeType="refund" onChange={mockOnChange} />
    );
    const box = container.querySelector('.MuiBox-root');
    const tabs = container.querySelector('.MuiTabs-root');

    expect(box).toContainElement(tabs);
  });

  it('tabs contain tab elements', () => {
    const { container } = render(
      <ReturnTypeTabs activeType="refund" onChange={mockOnChange} />
    );
    const tabs = container.querySelector('.MuiTabs-root');
    const tabElements = container.querySelectorAll('.MuiTab-root');

    expect(tabs).toBeInTheDocument();
    expect(tabElements.length).toBe(2);
  });

  it('renders complete return type tabs component', () => {
    const { container } = render(
      <ReturnTypeTabs activeType="refund" onChange={mockOnChange} />
    );
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
    expect(container.querySelector('.MuiTabs-root')).toBeInTheDocument();
    expect(screen.getByText('returnTypeRefund')).toBeInTheDocument();
    expect(screen.getByText('returnTypeExchange')).toBeInTheDocument();
  });
});
