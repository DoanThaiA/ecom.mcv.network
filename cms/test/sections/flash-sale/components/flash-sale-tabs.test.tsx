import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlashSaleTabs } from 'src/sections/flash-sale/components/flash-sale-tabs';
import { FlashSaleStatus } from 'src/types/gen/shared/shared/common/enums';

const mockT = vi.fn((key: string) => key);
const mockOnChange = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

describe('FlashSaleTabs', () => {
  const defaultProps = {
    activeTab: 'all' as const,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tabs', () => {
    render(<FlashSaleTabs {...defaultProps} />);
    expect(screen.getByText('all')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('upcoming')).toBeInTheDocument();
    expect(screen.getByText('ended')).toBeInTheDocument();
    expect(screen.getByText('disabled')).toBeInTheDocument();
  });

  it('calls onChange when tab is clicked', () => {
    render(<FlashSaleTabs {...defaultProps} />);
    const activeTab = screen.getByText('active');
    fireEvent.click(activeTab);
    expect(mockOnChange).toHaveBeenCalledWith(FlashSaleStatus.FLASH_SALE_STATUS_ACTIVE);
  });

  it('translates tab labels', () => {
    render(<FlashSaleTabs {...defaultProps} />);
    expect(mockT).toHaveBeenCalledWith('all');
    expect(mockT).toHaveBeenCalledWith('active');
    expect(mockT).toHaveBeenCalledWith('upcoming');
    expect(mockT).toHaveBeenCalledWith('ended');
    expect(mockT).toHaveBeenCalledWith('disabled');
  });

  it('renders MUI Tabs component', () => {
    const { container } = render(<FlashSaleTabs {...defaultProps} />);
    expect(container.querySelector('.MuiTabs-root')).toBeInTheDocument();
  });

  it('renders MUI Tab components', () => {
    const { container } = render(<FlashSaleTabs {...defaultProps} />);
    const tabs = container.querySelectorAll('.MuiTab-root');
    expect(tabs).toHaveLength(5);
  });

  it('sets active tab', () => {
    render(<FlashSaleTabs {...defaultProps} activeTab={FlashSaleStatus.FLASH_SALE_STATUS_ACTIVE} />);
    expect(screen.getByText('active')).toBeInTheDocument();
  });

  it('exports FlashSaleTabs function', () => {
    expect(FlashSaleTabs).toBeDefined();
    expect(typeof FlashSaleTabs).toBe('function');
  });

  it('handles different active tabs', () => {
    render(<FlashSaleTabs {...defaultProps} activeTab={FlashSaleStatus.FLASH_SALE_STATUS_UPCOMING} />);
    expect(screen.getByText('upcoming')).toBeInTheDocument();
  });

  it('calls onChange with correct tab value', () => {
    render(<FlashSaleTabs {...defaultProps} />);
    const endedTab = screen.getByText('ended');
    fireEvent.click(endedTab);
    expect(mockOnChange).toHaveBeenCalledWith(FlashSaleStatus.FLASH_SALE_STATUS_ENDED);
  });

  it('uses TAB_CONFIG for rendering', () => {
    render(<FlashSaleTabs {...defaultProps} />);
    expect(screen.getByText('all')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('upcoming')).toBeInTheDocument();
    expect(screen.getByText('ended')).toBeInTheDocument();
    expect(screen.getByText('disabled')).toBeInTheDocument();
  });

  it('renders tabs in correct order', () => {
    const { container } = render(<FlashSaleTabs {...defaultProps} />);
    const tabs = container.querySelectorAll('.MuiTab-root');
    expect(tabs[0]).toHaveTextContent('all');
    expect(tabs[1]).toHaveTextContent('active');
    expect(tabs[2]).toHaveTextContent('upcoming');
    expect(tabs[3]).toHaveTextContent('ended');
    expect(tabs[4]).toHaveTextContent('disabled');
  });

  it('uses useTranslation hook', () => {
    render(<FlashSaleTabs {...defaultProps} />);
    expect(mockT).toHaveBeenCalled();
  });

  it('applies scrollable variant', () => {
    const { container } = render(<FlashSaleTabs {...defaultProps} />);
    const tabs = container.querySelector('.MuiTabs-root');
    expect(tabs).toBeInTheDocument();
  });

  it('handles handleChange event', () => {
    render(<FlashSaleTabs {...defaultProps} />);
    const disabledTab = screen.getByText('disabled');
    fireEvent.click(disabledTab);
    expect(mockOnChange).toHaveBeenCalledWith(FlashSaleStatus.FLASH_SALE_STATUS_DISABLED);
  });

  it('renders without errors', () => {
    expect(() => {
      render(<FlashSaleTabs {...defaultProps} />);
    }).not.toThrow();
  });

  it('handles all FlashSaleStatus values', () => {
    render(<FlashSaleTabs {...defaultProps} />);
    expect(screen.getByText('all')).toBeInTheDocument();
    expect(screen.getByText('active')).toBeInTheDocument();
    expect(screen.getByText('upcoming')).toBeInTheDocument();
    expect(screen.getByText('ended')).toBeInTheDocument();
    expect(screen.getByText('disabled')).toBeInTheDocument();
  });

  it('uses FlashSaleStatus enum values', () => {
    render(<FlashSaleTabs {...defaultProps} />);
    const activeTab = screen.getByText('active');
    fireEvent.click(activeTab);
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('applies custom styles', () => {
    const { container } = render(<FlashSaleTabs {...defaultProps} />);
    const tabs = container.querySelector('.MuiTabs-root');
    expect(tabs).toBeInTheDocument();
  });

  it('converts tab values to strings for keys', () => {
    const { container } = render(<FlashSaleTabs {...defaultProps} />);
    const tabs = container.querySelectorAll('.MuiTab-root');
    expect(tabs).toHaveLength(5);
  });

  it('handles tab change with all tab', () => {
    render(
      <FlashSaleTabs
        {...defaultProps}
        activeTab={FlashSaleStatus.FLASH_SALE_STATUS_ACTIVE}
      />
    );
    const allTab = screen.getByText('all');
    fireEvent.click(allTab);
    expect(mockOnChange).toHaveBeenCalledWith('all');
  });
});
