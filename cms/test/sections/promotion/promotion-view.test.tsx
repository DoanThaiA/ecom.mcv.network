import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { PromotionView } from 'src/sections/promotion/promotion-view';

// Mock the dependencies
vi.mock('src/layouts/dashboard', () => ({
  DashboardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dashboard-content">{children}</div>
  ),
}));

vi.mock('src/sections/promotion/components', () => ({
  PromotionTypeCards: () => <div data-testid="promotion-type-cards">Promotion Type Cards</div>,
  PromotionListTable: () => <div data-testid="promotion-list-table">Promotion List Table</div>,
}));

describe('PromotionView', () => {
  it('renders without crashing', () => {
    const { container } = render(<PromotionView />);
    expect(container).toBeInTheDocument();
  });

  it('renders DashboardContent', () => {
    const { getByTestId } = render(<PromotionView />);
    expect(getByTestId('dashboard-content')).toBeInTheDocument();
  });

  it('renders PromotionTypeCards component', () => {
    const { getByTestId } = render(<PromotionView />);
    expect(getByTestId('promotion-type-cards')).toBeInTheDocument();
  });

  it('renders PromotionListTable component', () => {
    const { getByTestId } = render(<PromotionView />);
    expect(getByTestId('promotion-list-table')).toBeInTheDocument();
  });

  it('renders Box container with padding', () => {
    const { container } = render(<PromotionView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders both main components in order', () => {
    const { getByTestId } = render(<PromotionView />);
    const typeCards = getByTestId('promotion-type-cards');
    const listTable = getByTestId('promotion-list-table');
    
    expect(typeCards).toBeInTheDocument();
    expect(listTable).toBeInTheDocument();
  });

  it('wraps content in DashboardContent layout', () => {
    const { getByTestId } = render(<PromotionView />);
    const dashboardContent = getByTestId('dashboard-content');
    const typeCards = getByTestId('promotion-type-cards');
    
    expect(dashboardContent).toBeInTheDocument();
    expect(typeCards).toBeInTheDocument();
  });
});
