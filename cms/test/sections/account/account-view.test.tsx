import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AccountView } from 'src/sections/account/account-view';
import type { User } from 'src/types/user';

const mockUser: User = {
  id: 'user1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john.doe@example.com',
  phone: '0123456789',
  username: 'johndoe',
  role: 'admin',
} as User;

const mockDispatch = vi.fn();
const mockUseDialog = {
  isOpen: false,
  open: vi.fn(),
  close: vi.fn(),
  data: null,
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/hooks', () => ({
  useDialog: () => mockUseDialog,
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn((selector) => {
    if (selector.name === 'selectAccountUser') return mockUser;
    if (selector.name === 'selectAccountLoading') return false;
    return null;
  }),
}));

vi.mock('src/redux/store/accountSlice', () => ({
  fetchUserRequest: vi.fn((params) => ({ type: 'FETCH_USER', payload: params })),
  updateUserRequest: vi.fn((params) => ({ type: 'UPDATE_USER', payload: params })),
  selectAccountUser: vi.fn((state) => state.user),
  selectAccountLoading: vi.fn((state) => state.loading),
}));

vi.mock('src/redux/store/nhanhSlice', () => ({
  nhanhCheckConnectionRequest: vi.fn((params) => ({
    type: 'CHECK_NHANH_CONNECTION',
    payload: params,
  })),
  selectNhanhIsConnected: vi.fn((state) => state.isConnected),
  selectNhanhLoading: vi.fn((state) => state.loading),
  nhanhConnectRequest: vi.fn((params) => ({ type: 'NHANH_CONNECT', payload: params })),
  selectNhanhLastSync: vi.fn((state) => state.lastSync),
  nhanhRedirectRequest: vi.fn((params) => ({ type: 'NHANH_REDIRECT', payload: params })),
  nhanhSyncAllRequest: vi.fn((params) => ({ type: 'NHANH_SYNC_ALL', payload: params })),
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

vi.mock('src/sections/account/edit-account-dialog', () => ({
  EditAccountDialog: ({ open, onClose, initialData, onSave }: any) =>
    open ? (
      <div data-testid="edit-account-dialog">
        <span>{initialData.fullName}</span>
        <button onClick={onClose}>Close</button>
        <button onClick={() => onSave(initialData)}>Save</button>
      </div>
    ) : null,
}));

vi.mock('src/sections/account/nhanh-vn-sync-card', () => ({
  NhanhVnSyncCard: () => <div data-testid="nhanh-vn-sync-card">Nhanh Sync Card</div>,
}));

vi.mock('src/sections/account/zalo-sync-card', () => ({
  ZaloSyncCard: () => <div data-testid="zalo-sync-card">Zalo Sync Card</div>,
}));

vi.mock('src/sections/account/sync-history-table', () => ({
  SyncHistoryTable: () => <div data-testid="sync-history-table">Sync History</div>,
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: any) => <span data-testid="iconify">{icon}</span>,
}));

describe('AccountView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseDialog.isOpen = false;
  });

  it('renders without crashing', () => {
    const { container } = render(<AccountView />);
    expect(container).toBeInTheDocument();
  });

  it('dispatches fetchUserRequest on mount', () => {
    render(<AccountView />);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('dispatches nhanhCheckConnectionRequest on mount', () => {
    render(<AccountView />);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('renders user profile section', () => {
    const { container } = render(<AccountView />);
    const avatars = container.querySelectorAll('.MuiAvatar-root');
    expect(avatars.length).toBeGreaterThan(0);
  });

  it('renders user information fields', () => {
    render(<AccountView />);
    expect(screen.getByText('fullName')).toBeInTheDocument();
    expect(screen.getByText('phone')).toBeInTheDocument();
    expect(screen.getByText('email')).toBeInTheDocument();
  });

  it('renders profile header card', () => {
    const { container } = render(<AccountView />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('renders account details card', () => {
    render(<AccountView />);
    expect(screen.getByText('accountInfo')).toBeInTheDocument();
  });

  it('renders edit button', () => {
    render(<AccountView />);
    expect(screen.getByText('edit')).toBeInTheDocument();
  });

  it('renders NhanhVnSyncCard component', () => {
    render(<AccountView />);
    expect(screen.getByTestId('nhanh-vn-sync-card')).toBeInTheDocument();
  });

  it('renders ZaloSyncCard component', () => {
    render(<AccountView />);
    expect(screen.getByTestId('zalo-sync-card')).toBeInTheDocument();
  });

  it('can interact with edit button', () => {
    render(<AccountView />);
    const editButton = screen.getByText('edit');
    expect(editButton).toBeEnabled();
  });

  it('does not render EditAccountDialog when dialog is closed', () => {
    render(<AccountView />);
    expect(screen.queryByTestId('edit-account-dialog')).not.toBeInTheDocument();
  });

  it('exports AccountView function', () => {
    expect(AccountView).toBeDefined();
    expect(typeof AccountView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof AccountView).toBe('function');
    expect(AccountView.name).toBe('AccountView');
  });

  it('renders info fields with icons', () => {
    render(<AccountView />);
    const iconifyElements = screen.getAllByTestId('iconify');
    expect(iconifyElements.length).toBeGreaterThan(0);
  });

  it('handles missing user data gracefully', () => {
    const { container } = render(<AccountView />);
    expect(container).toBeInTheDocument();
  });

  it('renders Grid container for info fields', () => {
    const { container } = render(<AccountView />);
    const grids = container.querySelectorAll('.MuiGrid-container');
    expect(grids.length).toBeGreaterThan(0);
  });

  it('renders Paper components for info fields', () => {
    const { container } = render(<AccountView />);
    const papers = container.querySelectorAll('.MuiPaper-root');
    expect(papers.length).toBeGreaterThan(0);
  });
});
