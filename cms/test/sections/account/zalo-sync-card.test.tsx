import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ZaloSyncCard } from 'src/sections/account/zalo-sync-card';

const mockDispatch = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

let callCount = 0;
const mockOaInfo = {
  oa_name: 'Test OA',
  num_follower: 1000,
  oa_id: 'test123',
  description: 'Test OA Description'
};

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn(() => {
    callCount++;
    const mod = callCount % 3;
    // Cycle through: isConnected, isLoading, oaInfo
    if (mod === 1) return true; // isConnected
    if (mod === 2) return false; // isLoading
    return mockOaInfo; // oaInfo (mod === 0)
  }),
}));

vi.mock('src/redux/store/zaloSlice', () => ({
  zaloRedirectRequest: vi.fn((params) => ({ type: 'ZALO_REDIRECT', payload: params })),
  zaloCheckConnectionRequest: vi.fn((params) => ({
    type: 'ZALO_CHECK_CONNECTION',
    payload: params,
  })),
  selectZaloIsConnected: vi.fn((state) => state.isConnected),
  selectZaloLoading: vi.fn((state) => state.loading),
  selectZaloOAInfo: vi.fn((state) => state.oaInfo),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: any) => <span data-testid="iconify">{icon}</span>,
}));

describe('ZaloSyncCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    callCount = 0;
  });

  it('renders without crashing', () => {
    const { container } = render(<ZaloSyncCard />);
    expect(container).toBeInTheDocument();
  });

  it('renders card title', () => {
    render(<ZaloSyncCard />);
    expect(screen.getByText('zaloOaSync')).toBeInTheDocument();
  });

  it('renders status chip', () => {
    const { container } = render(<ZaloSyncCard />);
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeInTheDocument();
  });

  it('dispatches zaloCheckConnectionRequest on mount', () => {
    render(<ZaloSyncCard />);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('renders icon in header', () => {
    render(<ZaloSyncCard />);
    const icons = screen.getAllByTestId('iconify');
    expect(icons.length).toBeGreaterThan(0);
  });

  it('renders divider', () => {
    const { container } = render(<ZaloSyncCard />);
    const dividers = container.querySelectorAll('.MuiDivider-root');
    expect(dividers.length).toBeGreaterThan(0);
  });

  it('renders description box', () => {
    const { container } = render(<ZaloSyncCard />);
    const boxes = container.querySelectorAll('.MuiBox-root');
    expect(boxes.length).toBeGreaterThan(0);
  });

  it('exports ZaloSyncCard function', () => {
    expect(ZaloSyncCard).toBeDefined();
    expect(typeof ZaloSyncCard).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ZaloSyncCard).toBe('function');
    expect(ZaloSyncCard.name).toBe('ZaloSyncCard');
  });

  it('renders Card component', () => {
    const { container } = render(<ZaloSyncCard />);
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('renders Stack components', () => {
    const { container } = render(<ZaloSyncCard />);
    const stacks = container.querySelectorAll('.MuiStack-root');
    expect(stacks.length).toBeGreaterThan(0);
  });

  it('renders Chip component for status', () => {
    const { container } = render(<ZaloSyncCard />);
    const chip = container.querySelector('.MuiChip-root');
    expect(chip).toBeInTheDocument();
  });

  it('renders Typography components', () => {
    const { container } = render(<ZaloSyncCard />);
    const typographies = container.querySelectorAll('.MuiTypography-root');
    expect(typographies.length).toBeGreaterThan(0);
  });

  it('uses useEffect to check connection', () => {
    render(<ZaloSyncCard />);
    expect(mockDispatch).toHaveBeenCalled();
  });
});
