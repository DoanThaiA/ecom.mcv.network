import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { NhanhVnSyncCard } from 'src/sections/account/nhanh-vn-sync-card';
import { nhanhRedirectRequest } from 'src/redux/store/nhanhSlice';

const mockDispatch = vi.fn();
const nhanhState = {
  isConnected: false,
  loading: false,
  loadingCategories: false,
  loadingProducts: false,
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: (state: unknown) => unknown) => selector({ nhanh: nhanhState }),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: { icon: string }) => <span>{icon}</span>,
}));

vi.mock('src/sections/account/sync-history-table', () => ({
  SyncHistoryTable: () => <div />,
}));

describe('NhanhVnSyncCard login button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    nhanhState.isConnected = false;
    nhanhState.loading = false;
  });

  it('starts the Nhanh.vn login when not connected', () => {
    render(<NhanhVnSyncCard />);

    fireEvent.click(screen.getByRole('button', { name: /signin/ }));

    expect(mockDispatch).toHaveBeenCalledWith(nhanhRedirectRequest({}));
    expect(screen.queryByText('syncProducts')).not.toBeInTheDocument();
  });

  it('disables the button while the login is loading', () => {
    nhanhState.loading = true;
    render(<NhanhVnSyncCard />);

    expect(screen.getByRole('button', { name: /loggingInToNhanhVn/ })).toBeDisabled();
  });

  it('hides the login button once connected', () => {
    nhanhState.isConnected = true;
    render(<NhanhVnSyncCard />);

    expect(screen.queryByText('signin')).not.toBeInTheDocument();
    expect(screen.getByText('syncProducts')).toBeInTheDocument();
  });

  it('offers to re-authorize once connected and restarts the Nhanh.vn login', () => {
    nhanhState.isConnected = true;
    render(<NhanhVnSyncCard />);

    fireEvent.click(screen.getByRole('button', { name: /relogin/ }));

    expect(mockDispatch).toHaveBeenCalledWith(nhanhRedirectRequest({}));
  });

  it('does not offer the re-authorize button before connecting', () => {
    render(<NhanhVnSyncCard />);

    expect(screen.queryByRole('button', { name: /relogin/ })).not.toBeInTheDocument();
  });

  it('disables the re-authorize button while the login is loading', () => {
    nhanhState.isConnected = true;
    nhanhState.loading = true;
    render(<NhanhVnSyncCard />);

    expect(screen.getByRole('button', { name: /loggingInToNhanhVn/ })).toBeDisabled();
  });
});
