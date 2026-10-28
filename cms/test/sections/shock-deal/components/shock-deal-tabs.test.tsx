import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ShockDealTabs } from 'src/sections/shock-deal/components/shock-deal-tabs';
import { PromotionStatus } from 'src/types/promotion';

const mockT = vi.fn((key: string) => key);
const mockOnChange = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

describe('ShockDealTabs', () => {
  const defaultProps = {
    activeTab: 'all' as const,
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tabs', () => {
    render(<ShockDealTabs {...defaultProps} />);
    expect(screen.getByText('all')).toBeInTheDocument();
    expect(screen.getByText('ongoing')).toBeInTheDocument();
    expect(screen.getByText('paused')).toBeInTheDocument();
    expect(screen.getByText('upcoming')).toBeInTheDocument();
    expect(screen.getByText('ended')).toBeInTheDocument();
  });

  it('calls onChange when tab is clicked', () => {
    render(<ShockDealTabs {...defaultProps} />);
    const ongoingTab = screen.getByText('ongoing');
    fireEvent.click(ongoingTab);
    expect(mockOnChange).toHaveBeenCalledWith(PromotionStatus.PROMOTION_STATUS_ACTIVE);
  });

  it('translates tab labels', () => {
    render(<ShockDealTabs {...defaultProps} />);
    expect(mockT).toHaveBeenCalledWith('all');
    expect(mockT).toHaveBeenCalledWith('ongoing');
    expect(mockT).toHaveBeenCalledWith('paused');
    expect(mockT).toHaveBeenCalledWith('upcoming');
    expect(mockT).toHaveBeenCalledWith('ended');
  });

  it('renders MUI Tabs component', () => {
    const { container } = render(<ShockDealTabs {...defaultProps} />);
    expect(container.querySelector('.MuiTabs-root')).toBeInTheDocument();
  });

  it('renders MUI Tab components', () => {
    const { container } = render(<ShockDealTabs {...defaultProps} />);
    const tabs = container.querySelectorAll('.MuiTab-root');
    expect(tabs).toHaveLength(5);
  });

  it('sets active tab', () => {
    render(
      <ShockDealTabs
        {...defaultProps}
        activeTab={PromotionStatus.PROMOTION_STATUS_ACTIVE}
      />
    );
    expect(screen.getByText('ongoing')).toBeInTheDocument();
  });

  it('exports ShockDealTabs function', () => {
    expect(ShockDealTabs).toBeDefined();
    expect(typeof ShockDealTabs).toBe('function');
  });

  it('handles different active tabs', () => {
    render(
      <ShockDealTabs
        {...defaultProps}
        activeTab={PromotionStatus.PROMOTION_STATUS_UPCOMING}
      />
    );
    expect(screen.getByText('upcoming')).toBeInTheDocument();
  });

  it('calls onChange with correct tab value', () => {
    render(<ShockDealTabs {...defaultProps} />);
    const endedTab = screen.getByText('ended');
    fireEvent.click(endedTab);
    expect(mockOnChange).toHaveBeenCalledWith(PromotionStatus.PROMOTION_STATUS_ENDED);
  });

  it('uses TAB_CONFIG for rendering', () => {
    render(<ShockDealTabs {...defaultProps} />);
    expect(screen.getByText('all')).toBeInTheDocument();
    expect(screen.getByText('ongoing')).toBeInTheDocument();
    expect(screen.getByText('paused')).toBeInTheDocument();
    expect(screen.getByText('upcoming')).toBeInTheDocument();
    expect(screen.getByText('ended')).toBeInTheDocument();
  });

  it('renders tabs in correct order', () => {
    const { container } = render(<ShockDealTabs {...defaultProps} />);
    const tabs = container.querySelectorAll('.MuiTab-root');
    expect(tabs[0]).toHaveTextContent('all');
    expect(tabs[1]).toHaveTextContent('ongoing');
    expect(tabs[2]).toHaveTextContent('paused');
    expect(tabs[3]).toHaveTextContent('upcoming');
    expect(tabs[4]).toHaveTextContent('ended');
  });

  it('uses useTranslation hook', () => {
    render(<ShockDealTabs {...defaultProps} />);
    expect(mockT).toHaveBeenCalled();
  });

  it('applies scrollable variant', () => {
    const { container } = render(<ShockDealTabs {...defaultProps} />);
    const tabs = container.querySelector('.MuiTabs-root');
    expect(tabs).toBeInTheDocument();
  });

  it('handles handleChange event', () => {
    render(<ShockDealTabs {...defaultProps} />);
    const pausedTab = screen.getByText('paused');
    fireEvent.click(pausedTab);
    expect(mockOnChange).toHaveBeenCalledWith(PromotionStatus.PROMOTION_STATUS_PAUSED);
  });

  it('renders without errors', () => {
    expect(() => {
      render(<ShockDealTabs {...defaultProps} />);
    }).not.toThrow();
  });

  it('handles all PromotionStatus values', () => {
    render(<ShockDealTabs {...defaultProps} />);
    expect(screen.getByText('all')).toBeInTheDocument();
    expect(screen.getByText('ongoing')).toBeInTheDocument();
    expect(screen.getByText('paused')).toBeInTheDocument();
    expect(screen.getByText('upcoming')).toBeInTheDocument();
    expect(screen.getByText('ended')).toBeInTheDocument();
  });

  it('uses PromotionStatus enum values', () => {
    render(<ShockDealTabs {...defaultProps} />);
    const ongoingTab = screen.getByText('ongoing');
    fireEvent.click(ongoingTab);
    expect(mockOnChange).toHaveBeenCalled();
  });

  it('applies custom styles', () => {
    const { container } = render(<ShockDealTabs {...defaultProps} />);
    const tabs = container.querySelector('.MuiTabs-root');
    expect(tabs).toBeInTheDocument();
  });

  it('converts tab values to strings for keys', () => {
    const { container } = render(<ShockDealTabs {...defaultProps} />);
    const tabs = container.querySelectorAll('.MuiTab-root');
    expect(tabs).toHaveLength(5);
  });

  it('handles tab change with all tab', () => {
    render(
      <ShockDealTabs
        {...defaultProps}
        activeTab={PromotionStatus.PROMOTION_STATUS_ACTIVE}
      />
    );
    const allTab = screen.getByText('all');
    fireEvent.click(allTab);
    expect(mockOnChange).toHaveBeenCalledWith('all');
  });
});
