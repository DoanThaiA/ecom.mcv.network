import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReturnTabs } from 'src/sections/return/components/return-tabs';

const mockT = vi.fn((key: string) => key);
const mockOnChange = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

describe('ReturnTabs', () => {
  const defaultProps = {
    activeTab: 'all' as const,
    tabCounts: {
      all: 10,
      pending: 3,
      confirmed: 2,
      refunded: 4,
      rejected: 1,
    },
    onChange: mockOnChange,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tabs', () => {
    render(<ReturnTabs {...defaultProps} />);
    expect(screen.getByText('all (10)')).toBeInTheDocument();
    expect(screen.getByText('returnStatusPending (3)')).toBeInTheDocument();
    expect(screen.getByText('returnStatusConfirmed (2)')).toBeInTheDocument();
    expect(screen.getByText('returnStatusRefunded (4)')).toBeInTheDocument();
    expect(screen.getByText('returnStatusRejected (1)')).toBeInTheDocument();
  });

  it('renders with correct counts', () => {
    render(<ReturnTabs {...defaultProps} />);
    expect(screen.getByText('all (10)')).toBeInTheDocument();
  });

  it('shows count 0 when tab has no count', () => {
    const props = {
      ...defaultProps,
      tabCounts: {},
    };
    render(<ReturnTabs {...props} />);
    expect(screen.getByText('all (0)')).toBeInTheDocument();
  });

  it('calls onChange when tab is clicked', () => {
    render(<ReturnTabs {...defaultProps} />);
    const pendingTab = screen.getByText('returnStatusPending (3)');
    fireEvent.click(pendingTab);
    expect(mockOnChange).toHaveBeenCalledWith('pending');
  });

  it('translates tab labels', () => {
    render(<ReturnTabs {...defaultProps} />);
    expect(mockT).toHaveBeenCalledWith('all');
    expect(mockT).toHaveBeenCalledWith('returnStatusPending');
    expect(mockT).toHaveBeenCalledWith('returnStatusConfirmed');
    expect(mockT).toHaveBeenCalledWith('returnStatusRefunded');
    expect(mockT).toHaveBeenCalledWith('returnStatusRejected');
  });

  it('renders MUI Tabs component', () => {
    const { container } = render(<ReturnTabs {...defaultProps} />);
    expect(container.querySelector('.MuiTabs-root')).toBeInTheDocument();
  });

  it('renders MUI Tab components', () => {
    const { container } = render(<ReturnTabs {...defaultProps} />);
    const tabs = container.querySelectorAll('.MuiTab-root');
    expect(tabs).toHaveLength(5);
  });

  it('sets active tab', () => {
    render(<ReturnTabs {...defaultProps} activeTab="pending" />);
    expect(screen.getByText('returnStatusPending (3)')).toBeInTheDocument();
  });

  it('renders Box container with border', () => {
    const { container } = render(<ReturnTabs {...defaultProps} />);
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('exports ReturnTabs function', () => {
    expect(ReturnTabs).toBeDefined();
    expect(typeof ReturnTabs).toBe('function');
  });

  it('getTabLabel includes translation and count', () => {
    render(<ReturnTabs {...defaultProps} />);
    const allTab = screen.getByText('all (10)');
    expect(allTab).toBeInTheDocument();
  });

  it('handles different active tabs', () => {
    render(<ReturnTabs {...defaultProps} activeTab="confirmed" />);
    expect(screen.getByText('returnStatusConfirmed (2)')).toBeInTheDocument();
  });

  it('calls onChange with correct tab value', () => {
    render(<ReturnTabs {...defaultProps} />);
    const refundedTab = screen.getByText('returnStatusRefunded (4)');
    fireEvent.click(refundedTab);
    expect(mockOnChange).toHaveBeenCalledWith('refunded');
  });

  it('uses TAB_CONFIG for rendering', () => {
    render(<ReturnTabs {...defaultProps} />);
    expect(screen.getByText('all (10)')).toBeInTheDocument();
    expect(screen.getByText('returnStatusPending (3)')).toBeInTheDocument();
    expect(screen.getByText('returnStatusConfirmed (2)')).toBeInTheDocument();
    expect(screen.getByText('returnStatusRefunded (4)')).toBeInTheDocument();
    expect(screen.getByText('returnStatusRejected (1)')).toBeInTheDocument();
  });

  it('renders tabs in correct order', () => {
    const { container } = render(<ReturnTabs {...defaultProps} />);
    const tabs = container.querySelectorAll('.MuiTab-root');
    expect(tabs[0]).toHaveTextContent('all (10)');
    expect(tabs[1]).toHaveTextContent('returnStatusPending (3)');
    expect(tabs[2]).toHaveTextContent('returnStatusConfirmed (2)');
    expect(tabs[3]).toHaveTextContent('returnStatusRefunded (4)');
    expect(tabs[4]).toHaveTextContent('returnStatusRejected (1)');
  });

  it('uses useTranslation hook', () => {
    render(<ReturnTabs {...defaultProps} />);
    expect(mockT).toHaveBeenCalled();
  });

  it('applies custom styles to tabs', () => {
    const { container } = render(<ReturnTabs {...defaultProps} />);
    const tabs = container.querySelector('.MuiTabs-root');
    expect(tabs).toBeInTheDocument();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<ReturnTabs {...defaultProps} />);
    }).not.toThrow();
  });

  it('handles all tab types', () => {
    render(<ReturnTabs {...defaultProps} />);
    expect(screen.getByText('all (10)')).toBeInTheDocument();
    expect(screen.getByText('returnStatusPending (3)')).toBeInTheDocument();
    expect(screen.getByText('returnStatusConfirmed (2)')).toBeInTheDocument();
    expect(screen.getByText('returnStatusRefunded (4)')).toBeInTheDocument();
    expect(screen.getByText('returnStatusRejected (1)')).toBeInTheDocument();
  });
});
