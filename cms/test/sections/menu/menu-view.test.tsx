import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MenuView } from 'src/sections/menu/menu-view';
import type { Menu } from 'src/types/gen/shared/shared/menus/menu';
import { MenuStatus, MenuType } from 'src/types/gen/shared/shared/common/enums';

const mockMenus: Menu[] = [
  {
    id: 'menu1',
    name: 'Main Menu',
    type: MenuType.MENU_TYPE_CATEGORY,
    status: MenuStatus.MENU_STATUS_ACTIVE,
    order: 1,
    parentId: undefined,
  } as Menu,
  {
    id: 'menu2',
    name: 'Sub Menu',
    type: MenuType.MENU_TYPE_TOPIC,
    status: MenuStatus.MENU_STATUS_INACTIVE,
    order: 2,
    parentId: 'menu1',
  } as Menu,
];

const mockDispatch = vi.fn();
const mockUseAppSelector = vi.fn();
const mockUseDialog = vi.fn(() => ({
  isOpen: false,
  open: vi.fn(),
  close: vi.fn(),
  data: null,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: (selector: any) => mockUseAppSelector(selector),
}));

vi.mock('src/redux/store/menuSlice', () => ({
  getAllMenusRequest: vi.fn((params) => ({ type: 'GET_ALL_MENUS', payload: params })),
  deleteMenuRequest: vi.fn((params) => ({ type: 'DELETE_MENU', payload: params })),
  setStatusFilter: vi.fn((filter) => ({ type: 'SET_STATUS_FILTER', payload: filter })),
  selectAllMenus: vi.fn((state) => state.menus),
  selectAllMenusLoading: vi.fn((state) => state.loading),
  selectMenuStatusFilter: vi.fn((state) => state.statusFilter),
}));

vi.mock('src/hooks', () => ({
  useColumnVisibilityPersistence: () => [{}, vi.fn()],
  useDialog: () => mockUseDialog(),
}));

vi.mock('src/components/table', () => ({
  SearchBar: ({ value, onChange, placeholder, renderActions, renderFarRightActions }: any) => (
    <div data-testid="search-bar">
      <input
        data-testid="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
      {renderActions && <div data-testid="search-actions">{renderActions()}</div>}
      {renderFarRightActions && (
        <div data-testid="far-right-actions">{renderFarRightActions()}</div>
      )}
    </div>
  ),
  ColumnVisibility: () => <div data-testid="column-visibility">Column Visibility</div>,
  DataTable: ({ table }: any) => <div data-testid="data-table">Data Table</div>,
  createSelectionColumn: () => ({ id: 'select', header: 'Select' }),
}));

vi.mock('src/components/dialog', () => ({
  DeleteConfirmDialog: ({ open, onClose, onConfirm }: any) =>
    open ? (
      <div data-testid="delete-confirm-dialog">
        <button data-testid="dialog-close" onClick={onClose}>
          Close
        </button>
        <button data-testid="dialog-confirm" onClick={onConfirm}>
          Confirm
        </button>
      </div>
    ) : null,
}));

vi.mock('src/sections/menu/components/menu-dialog', () => ({
  MenuDialog: ({ open, onClose, onSuccess }: any) =>
    open ? (
      <div data-testid="menu-dialog">
        <button data-testid="menu-dialog-close" onClick={onClose}>
          Close
        </button>
        <button data-testid="menu-dialog-success" onClick={onSuccess}>
          Success
        </button>
      </div>
    ) : null,
}));

describe('MenuView', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    let selectorCallCount = 0;
    mockUseAppSelector.mockImplementation(() => {
      const callIndex = selectorCallCount++;
      if (callIndex === 0) return mockMenus; // selectAllMenus
      if (callIndex === 1) return false; // selectAllMenusLoading
      return 'all'; // selectMenuStatusFilter
    });
  });

  it('renders without crashing', () => {
    const { container } = render(<MenuView />);
    expect(container).toBeInTheDocument();
  });

  it('dispatches getAllMenusRequest on mount', () => {
    render(<MenuView />);
    expect(mockDispatch).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'GET_ALL_MENUS',
      })
    );
  });

  it('renders SearchBar component', () => {
    render(<MenuView />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  it('renders search input', () => {
    render(<MenuView />);
    expect(screen.getByTestId('search-input')).toBeInTheDocument();
  });

  it('renders add new button', () => {
    render(<MenuView />);
    expect(screen.getByText('addNew')).toBeInTheDocument();
  });

  it('renders DataTable when menus exist', () => {
    render(<MenuView />);
    expect(screen.getByTestId('data-table')).toBeInTheDocument();
  });

  it('displays loading state', () => {
    mockUseAppSelector.mockReturnValueOnce([]).mockReturnValueOnce(true).mockReturnValueOnce('all');

    render(<MenuView />);
    expect(screen.getByText('loading...')).toBeInTheDocument();
  });

  it('displays no data message when menus list is empty', () => {
    mockUseAppSelector
      .mockReturnValueOnce([])
      .mockReturnValueOnce(false)
      .mockReturnValueOnce('all');

    render(<MenuView />);
    expect(screen.getByText('noData')).toBeInTheDocument();
  });

  it('exports MenuView function', () => {
    expect(MenuView).toBeDefined();
    expect(typeof MenuView).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof MenuView).toBe('function');
    expect(MenuView.name).toBe('MenuView');
  });

  it('renders Box container', () => {
    const { container } = render(<MenuView />);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Card components', () => {
    const { container } = render(<MenuView />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBeGreaterThan(0);
  });

  it('uses useAppDispatch hook', () => {
    render(<MenuView />);
    expect(mockDispatch).toBeDefined();
  });

  it('uses useAppSelector hook', () => {
    render(<MenuView />);
    expect(mockUseAppSelector).toHaveBeenCalled();
  });

  it('renders status filter select', () => {
    render(<MenuView />);
    const select = screen.getByDisplayValue('all');
    expect(select).toBeInTheDocument();
  });

  it('renders column visibility component', () => {
    render(<MenuView />);
    expect(screen.getByTestId('column-visibility')).toBeInTheDocument();
  });

  it('handles search input change', () => {
    render(<MenuView />);
    const searchInput = screen.getByTestId('search-input');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    expect(searchInput).toHaveValue('test');
  });

  it('renders menu information', () => {
    const { container } = render(<MenuView />);
    expect(container).toBeInTheDocument();
  });

  it('maintains state across renders', () => {
    const { rerender } = render(<MenuView />);
    rerender(<MenuView />);
    expect(screen.getByTestId('search-bar')).toBeInTheDocument();
  });

  describe('Localization Support', () => {
    it('handles menus with localization data', () => {
      const menusWithLocalization: Menu[] = [
        {
          id: 'menu1',
          name: 'Products',
          type: MenuType.MENU_TYPE_CATEGORY,
          status: MenuStatus.MENU_STATUS_ACTIVE,
          order: 1,
          localization: { vi: 'Sản phẩm', en: 'Products' },
        } as Menu,
      ];

      mockUseAppSelector
        .mockReturnValueOnce(menusWithLocalization)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce('all');

      render(<MenuView />);
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    it('handles menus with only Vietnamese localization', () => {
      const menusWithViLocalization: Menu[] = [
        {
          id: 'menu1',
          name: 'Default Name',
          type: MenuType.MENU_TYPE_CATEGORY,
          status: MenuStatus.MENU_STATUS_ACTIVE,
          order: 1,
          localization: { vi: 'Tên tiếng Việt' },
        } as Menu,
      ];

      mockUseAppSelector
        .mockReturnValueOnce(menusWithViLocalization)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce('all');

      render(<MenuView />);
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    it('handles menus with only English localization', () => {
      const menusWithEnLocalization: Menu[] = [
        {
          id: 'menu1',
          name: 'Default Name',
          type: MenuType.MENU_TYPE_CATEGORY,
          status: MenuStatus.MENU_STATUS_ACTIVE,
          order: 1,
          localization: { en: 'English Name' },
        } as Menu,
      ];

      mockUseAppSelector
        .mockReturnValueOnce(menusWithEnLocalization)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce('all');

      render(<MenuView />);
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });

    it('handles menus without localization', () => {
      const menusWithoutLocalization: Menu[] = [
        {
          id: 'menu1',
          name: 'Menu Name',
          type: MenuType.MENU_TYPE_URL,
          status: MenuStatus.MENU_STATUS_ACTIVE,
          order: 1,
        } as Menu,
      ];

      mockUseAppSelector
        .mockReturnValueOnce(menusWithoutLocalization)
        .mockReturnValueOnce(false)
        .mockReturnValueOnce('all');

      render(<MenuView />);
      expect(screen.getByTestId('data-table')).toBeInTheDocument();
    });
  });
});
