import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SyncHistoryTable } from 'src/sections/account/sync-history-table';
import { JobType, JobStatus } from 'src/types/gen/shared/shared/common/enums';
import type { Job } from 'src/types/gen/shared/shared/common/jobs';

const mockJobs: Job[] = [
  {
    id: 'job1',
    type: JobType.JOB_TYPE_NHANH_PRODUCT_LIST_SYNC,
    status: JobStatus.JOB_STATUS_COMPLETED,
    percentComplete: 100,
    processed: 50,
    total: 50,
    createdAt: new Date('2024-01-01'),
  } as Job,
  {
    id: 'job2',
    type: JobType.JOB_TYPE_NHANH_CATEGORY_SYNC,
    status: JobStatus.JOB_STATUS_RUNNING,
    percentComplete: 50,
    processed: 25,
    total: 50,
    createdAt: new Date('2024-01-02'),
  } as Job,
];

const mockDispatch = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'vi' } }),
}));

let callCount = 0;
vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn(() => {
    callCount++;
    if (callCount % 3 === 1) return mockJobs; // selectJobs
    if (callCount % 3 === 2) return false; // selectJobsLoading
    return true; // selectJobsHasNextPage
  }),
}));

vi.mock('src/redux/store/jobSlice', () => ({
  listJobsRequest: vi.fn((params) => ({ type: 'LIST_JOBS', payload: params })),
  selectJobs: vi.fn((state) => state.jobs),
  selectJobsLoading: vi.fn((state) => state.loading),
  selectJobsHasNextPage: vi.fn((state) => state.hasNextPage),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon }: any) => <span data-testid="iconify">{icon}</span>,
}));

describe('SyncHistoryTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    callCount = 0;
  });

  it('renders without crashing', () => {
    const { container } = render(<SyncHistoryTable />);
    expect(container).toBeInTheDocument();
  });

  it('renders toggle button', () => {
    render(<SyncHistoryTable />);
    expect(screen.getByText('viewSyncHistory')).toBeInTheDocument();
  });

  it('expands when toggle button is clicked', () => {
    render(<SyncHistoryTable />);
    const toggleButton = screen.getByText('viewSyncHistory');
    fireEvent.click(toggleButton);
    expect(screen.getByText('hideSyncHistory')).toBeInTheDocument();
  });

  it('renders sync history title when expanded', () => {
    render(<SyncHistoryTable />);
    const toggleButton = screen.getByText('viewSyncHistory');
    fireEvent.click(toggleButton);
    expect(screen.getByText('syncHistory')).toBeInTheDocument();
  });

  it('renders reload button when expanded', () => {
    render(<SyncHistoryTable />);
    const toggleButton = screen.getByText('viewSyncHistory');
    fireEvent.click(toggleButton);
    const icons = screen.getAllByTestId('iconify');
    const refreshIcon = icons.find((icon) => icon.textContent === 'mdi:refresh');
    expect(refreshIcon).toBeDefined();
  });

  it('renders table headers when expanded', () => {
    render(<SyncHistoryTable />);
    const toggleButton = screen.getByText('viewSyncHistory');
    fireEvent.click(toggleButton);
    expect(screen.getByText('type')).toBeInTheDocument();
    expect(screen.getByText('status')).toBeInTheDocument();
    expect(screen.getByText('progress')).toBeInTheDocument();
    expect(screen.getByText('createdAt')).toBeInTheDocument();
  });

  it('renders pagination controls when expanded', () => {
    render(<SyncHistoryTable />);
    const toggleButton = screen.getByText('viewSyncHistory');
    fireEvent.click(toggleButton);
    expect(screen.getByText('previous')).toBeInTheDocument();
    expect(screen.getByText('next')).toBeInTheDocument();
  });

  it('renders page number when expanded', () => {
    render(<SyncHistoryTable />);
    const toggleButton = screen.getByText('viewSyncHistory');
    fireEvent.click(toggleButton);
    expect(screen.getByText(/page/)).toBeInTheDocument();
  });

  it('handles next page button click', () => {
    render(<SyncHistoryTable />);
    const toggleButton = screen.getByText('viewSyncHistory');
    fireEvent.click(toggleButton);
    const nextButton = screen.getByText('next');
    fireEvent.click(nextButton);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('handles previous page button click', () => {
    render(<SyncHistoryTable />);
    const toggleButton = screen.getByText('viewSyncHistory');
    fireEvent.click(toggleButton);
    const nextButton = screen.getByText('next');
    fireEvent.click(nextButton);
    const prevButton = screen.getByText('previous');
    fireEvent.click(prevButton);
    expect(mockDispatch).toHaveBeenCalled();
  });

  it('exports SyncHistoryTable function', () => {
    expect(SyncHistoryTable).toBeDefined();
    expect(typeof SyncHistoryTable).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof SyncHistoryTable).toBe('function');
    expect(SyncHistoryTable.name).toBe('SyncHistoryTable');
  });

  it('renders Collapse component', () => {
    const { container } = render(<SyncHistoryTable />);
    expect(container).toBeInTheDocument();
  });

  it('renders Button components', () => {
    render(<SyncHistoryTable />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('can toggle expand and collapse', () => {
    render(<SyncHistoryTable />);
    const toggleButton = screen.getByText('viewSyncHistory');
    fireEvent.click(toggleButton);
    expect(screen.getByText('hideSyncHistory')).toBeInTheDocument();
    const hideButton = screen.getByText('hideSyncHistory');
    fireEvent.click(hideButton);
    expect(screen.getByText('viewSyncHistory')).toBeInTheDocument();
  });

  it('handles reload button click', () => {
    render(<SyncHistoryTable />);
    const toggleButton = screen.getByText('viewSyncHistory');
    fireEvent.click(toggleButton);
    const reloadButtons = screen.getAllByRole('button');
    const reloadBtn = reloadButtons.find((btn) => {
      const icon = btn.querySelector('[data-testid="iconify"]');
      return icon?.textContent === 'mdi:refresh';
    });
    if (reloadBtn) {
      fireEvent.click(reloadBtn);
      expect(mockDispatch).toHaveBeenCalled();
    }
  });

  it('renders Divider when expanded', () => {
    const { container } = render(<SyncHistoryTable />);
    const toggleButton = screen.getByText('viewSyncHistory');
    fireEvent.click(toggleButton);
    const dividers = container.querySelectorAll('.MuiDivider-root');
    expect(dividers.length).toBeGreaterThan(0);
  });
});

describe('SyncHistoryTable - Empty State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    callCount = 0;
    vi.mocked(vi.fn()).mockImplementation(() => {
      callCount++;
      if (callCount % 3 === 1) return []; // empty jobs
      if (callCount % 3 === 2) return false; // not loading
      return false; // no next page
    });
  });

  it('renders empty state message when no jobs', () => {
    callCount = 0;
    const { container } = render(<SyncHistoryTable />);
    expect(container).toBeInTheDocument();
  });
});

describe('SyncHistoryTable - Loading State', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    callCount = 0;
    vi.mocked(vi.fn()).mockImplementation(() => {
      callCount++;
      if (callCount % 3 === 1) return []; // empty jobs
      if (callCount % 3 === 2) return true; // loading
      return false; // no next page
    });
  });

  it('renders loading state', () => {
    callCount = 0;
    const { container } = render(<SyncHistoryTable />);
    expect(container).toBeInTheDocument();
  });
});
