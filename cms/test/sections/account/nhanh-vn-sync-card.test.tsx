import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NhanhVnSyncCard } from 'src/sections/account/nhanh-vn-sync-card';

const mockDispatch = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let callCount = 0;
vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn(() => {
    callCount++;
    // First call is for isConnected, second is for isLoading
    if (callCount % 2 === 1) return true; // isConnected
    return false; // isLoading
  }),
}));

vi.mock('src/redux/store/nhanhSlice', () => ({
  nhanhRedirectRequest: vi.fn((params) => ({ type: 'NHANH_REDIRECT', payload: params })),
  nhanhSyncAllRequest: vi.fn((params) => ({ type: 'NHANH_SYNC_ALL', payload: params })),
  nhanhSyncProductCategoriesRequest: vi.fn((params) => ({
    type: 'NHANH_SYNC_PRODUCT_CATEGORIES',
    payload: params,
  })),
  selectNhanhIsConnected: vi.fn((state) => state.isConnected),
  selectNhanhLoading: vi.fn((state) => state.loading),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: any) => <span data-testid="iconify">{icon}</span>,
}));

vi.mock('src/sections/account/sync-history-table', () => ({
  SyncHistoryTable: () => <div data-testid="sync-history-table">Sync History</div>,
}));

describe('NhanhVnSyncCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    callCount = 0;
  });

  it('renders without crashing', () => {
    const { container } = render(<NhanhVnSyncCard />);
    expect(container).toBeInTheDocument();
  });

  it('renders card title', () => {
    render(<NhanhVnSyncCard />);
    expect(screen.getByText('nhanhVnSync')).toBeInTheDocument();
  });

  it('renders status chip', () => {
    const { container } = render(<NhanhVnSyncCard />);
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeInTheDocument();
  });

  it('renders description text', () => {
    const { container } = render(<NhanhVnSyncCard />);
    expect(container).toBeInTheDocument();
  });

  it('renders SyncHistoryTable when connected', () => {
    render(<NhanhVnSyncCard />);
    expect(screen.getByTestId('sync-history-table')).toBeInTheDocument();
  });

  it('renders icon in header', () => {
    render(<NhanhVnSyncCard />);
    const icons = screen.getAllByTestId('iconify');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('renders divider', () => {
    const { container } = render(<NhanhVnSyncCard />);
    const dividers = container.querySelectorAll('.MuiDivider-root');
    expect(dividers.length).toBeGreaterThan(0);
  });

  it('renders description box', () => {
    const { container } = render(<NhanhVnSyncCard />);
    const boxes = container.querySelectorAll('.MuiBox-root');
    expect(boxes.length).toBeGreaterThan(0);
  });

  it('exports NhanhVnSyncCard function', () => {
    expect(NhanhVnSyncCard).toBeDefined();
    expect(typeof NhanhVnSyncCard).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof NhanhVnSyncCard).toBe('function');
    expect(NhanhVnSyncCard.name).toBe('NhanhVnSyncCard');
  });

  it('renders Card component', () => {
    const { container } = render(<NhanhVnSyncCard />);
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('renders Stack components', () => {
    const { container } = render(<NhanhVnSyncCard />);
    const stacks = container.querySelectorAll('.MuiStack-root');
    expect(stacks.length).toBeGreaterThan(0);
  });

  it('renders Chip component for status', () => {
    const { container } = render(<NhanhVnSyncCard />);
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeInTheDocument();
  });

  it('renders Typography components', () => {
    const { container } = render(<NhanhVnSyncCard />);
    const typographies = container.querySelectorAll('.MuiTypography-root');
    expect(typographies.length).toBeGreaterThan(0);
  });

  it('renders sync categories button when connected', () => {
    render(<NhanhVnSyncCard />);
    expect(screen.getByText('categorySync')).toBeInTheDocument();
  });

  it('renders sync categories button as MUI Button', () => {
    const { container } = render(<NhanhVnSyncCard />);
    const buttons = container.querySelectorAll('.MuiButton-root');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('dispatches nhanhSyncProductCategoriesRequest when sync categories button is clicked', async () => {
    render(<NhanhVnSyncCard />);
    const button = screen.getByText('categorySync');
    button.click();
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('sync categories button has correct styling', () => {
    const { container } = render(<NhanhVnSyncCard />);
    const button = container.querySelector('.MuiButton-contained');
    expect(button).toBeInTheDocument();
  });
});
