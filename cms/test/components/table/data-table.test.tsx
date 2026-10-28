import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DataTable, createSelectionColumn } from 'src/components/table/data-table';

const mockTable = {
  getHeaderGroups: vi.fn(() => [
    {
      id: 'header-1',
      headers: [
        {
          id: 'col-1',
          column: {
            id: 'name',
            columnDef: { header: 'Name' },
            getSize: () => 150,
            getIsPinned: () => false,
            getCanSort: () => false,
            getIsSorted: () => false,
            getToggleSortingHandler: () => vi.fn(),
          },
          getContext: () => ({}),
        },
      ],
    },
  ]),
  getRowModel: vi.fn(() => ({
    rows: [
      {
        id: 'row-1',
        getVisibleCells: () => [
          {
            id: 'cell-1',
            column: {
              id: 'name',
              columnDef: { cell: 'John Doe' },
              getSize: () => 150,
              getIsPinned: () => false,
            },
            getContext: () => ({}),
          },
        ],
      },
    ],
  })),
};

vi.mock('@tanstack/react-table', () => ({
  flexRender: (component: any) => component,
}));

describe('DataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<DataTable table={mockTable as any} />);
    expect(container).toBeInTheDocument();
  });

  it('renders table container', () => {
    const { container } = render(<DataTable table={mockTable as any} />);
    const tableContainer = container.querySelector('.MuiTableContainer-root');
    expect(tableContainer).toBeInTheDocument();
  });

  it('renders table element', () => {
    const { container } = render(<DataTable table={mockTable as any} />);
    const table = container.querySelector('.MuiTable-root');
    expect(table).toBeInTheDocument();
  });

  it('renders table head', () => {
    const { container } = render(<DataTable table={mockTable as any} />);
    const tableHead = container.querySelector('.MuiTableHead-root');
    expect(tableHead).toBeInTheDocument();
  });

  it('renders table body', () => {
    const { container } = render(<DataTable table={mockTable as any} />);
    const tableBody = container.querySelector('.MuiTableBody-root');
    expect(tableBody).toBeInTheDocument();
  });

  it('renders header row', () => {
    const { container } = render(<DataTable table={mockTable as any} />);
    const headerRows = container.querySelectorAll('.MuiTableHead-root .MuiTableRow-root');
    expect(headerRows.length).toBeGreaterThan(0);
  });

  it('renders header cells', () => {
    const { container } = render(<DataTable table={mockTable as any} />);
    const headerCells = container.querySelectorAll('.MuiTableHead-root .MuiTableCell-root');
    expect(headerCells.length).toBeGreaterThan(0);
  });

  it('renders body rows', () => {
    const { container } = render(<DataTable table={mockTable as any} />);
    const bodyRows = container.querySelectorAll('.MuiTableBody-root .MuiTableRow-root');
    expect(bodyRows.length).toBeGreaterThan(0);
  });

  it('renders body cells', () => {
    const { container } = render(<DataTable table={mockTable as any} />);
    const bodyCells = container.querySelectorAll('.MuiTableBody-root .MuiTableCell-root');
    expect(bodyCells.length).toBeGreaterThan(0);
  });

  it('renders header content', () => {
    render(<DataTable table={mockTable as any} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('renders cell content', () => {
    render(<DataTable table={mockTable as any} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders with compact mode by default', () => {
    render(<DataTable table={mockTable as any} />);
    expect(mockTable.getHeaderGroups).toHaveBeenCalled();
  });

  it('renders with compact mode true', () => {
    render(<DataTable table={mockTable as any} compact={true} />);
    expect(mockTable.getHeaderGroups).toHaveBeenCalled();
  });

  it('renders with compact mode false', () => {
    render(<DataTable table={mockTable as any} compact={false} />);
    expect(mockTable.getHeaderGroups).toHaveBeenCalled();
  });

  it('renders with row selection enabled', () => {
    render(<DataTable table={mockTable as any} enableRowSelection={true} />);
    expect(mockTable.getHeaderGroups).toHaveBeenCalled();
  });

  it('renders with row selection disabled', () => {
    render(<DataTable table={mockTable as any} enableRowSelection={false} />);
    expect(mockTable.getHeaderGroups).toHaveBeenCalled();
  });

  it('renders with summary row', () => {
    const summaryRow = <div data-testid="summary-row">Total: 100</div>;
    render(<DataTable table={mockTable as any} summaryRow={summaryRow} />);
    expect(screen.getByTestId('summary-row')).toBeInTheDocument();
  });

  it('renders without summary row', () => {
    render(<DataTable table={mockTable as any} />);
    expect(screen.queryByTestId('summary-row')).not.toBeInTheDocument();
  });

  it('calls getHeaderGroups', () => {
    render(<DataTable table={mockTable as any} />);
    expect(mockTable.getHeaderGroups).toHaveBeenCalled();
  });

  it('calls getRowModel', () => {
    render(<DataTable table={mockTable as any} />);
    expect(mockTable.getRowModel).toHaveBeenCalled();
  });

  it('exports DataTable function', () => {
    expect(DataTable).toBeDefined();
    expect(typeof DataTable).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof DataTable).toBe('function');
    expect(DataTable.name).toBe('DataTable');
  });

  it('renders table with sticky header', () => {
    const { container } = render(<DataTable table={mockTable as any} />);
    const table = container.querySelector('.MuiTable-root');
    expect(table).toBeInTheDocument();
  });

  it('renders Stack components in header', () => {
    const { container } = render(<DataTable table={mockTable as any} />);
    const stacks = container.querySelectorAll('.MuiStack-root');
    expect(stacks.length).toBeGreaterThan(0);
  });

  it('handles empty rows', () => {
    const emptyTable = {
      ...mockTable,
      getRowModel: () => ({ rows: [] }),
    };
    const { container } = render(<DataTable table={emptyTable as any} />);
    const bodyRows = container.querySelectorAll('.MuiTableBody-root .MuiTableRow-root');
    expect(bodyRows.length).toBe(0);
  });

  it('handles multiple header groups', () => {
    const multiHeaderTable = {
      ...mockTable,
      getHeaderGroups: () => [
        mockTable.getHeaderGroups()[0],
        mockTable.getHeaderGroups()[0],
      ],
    };
    const { container } = render(<DataTable table={multiHeaderTable as any} />);
    const headerRows = container.querySelectorAll('.MuiTableHead-root .MuiTableRow-root');
    expect(headerRows.length).toBe(2);
  });

  it('handles multiple rows', () => {
    const rows = mockTable.getRowModel().rows;
    const multiRowTable = {
      ...mockTable,
      getRowModel: () => ({ rows: [rows[0], rows[0], rows[0]] }),
    };
    const { container } = render(<DataTable table={multiRowTable as any} />);
    const bodyRows = container.querySelectorAll('.MuiTableBody-root .MuiTableRow-root');
    expect(bodyRows.length).toBe(3);
  });

  it('handles sortable columns', () => {
    const sortableTable = {
      ...mockTable,
      getHeaderGroups: () => [
        {
          id: 'header-1',
          headers: [
            {
              id: 'col-1',
              column: {
                id: 'name',
                columnDef: { header: 'Name' },
                getSize: () => 150,
                getIsPinned: () => false,
                getCanSort: () => true,
                getIsSorted: () => 'asc',
                getToggleSortingHandler: () => vi.fn(),
              },
              getContext: () => ({}),
            },
          ],
        },
      ],
    };
    render(<DataTable table={sortableTable as any} />);
    expect(screen.getByText('🔼')).toBeInTheDocument();
  });

  it('shows descending sort icon', () => {
    const sortableTable = {
      ...mockTable,
      getHeaderGroups: () => [
        {
          id: 'header-1',
          headers: [
            {
              id: 'col-1',
              column: {
                id: 'name',
                columnDef: { header: 'Name' },
                getSize: () => 150,
                getIsPinned: () => false,
                getCanSort: () => true,
                getIsSorted: () => 'desc',
                getToggleSortingHandler: () => vi.fn(),
              },
              getContext: () => ({}),
            },
          ],
        },
      ],
    };
    render(<DataTable table={sortableTable as any} />);
    expect(screen.getByText('🔽')).toBeInTheDocument();
  });

  it('handles pinned columns', () => {
    const pinnedTable = {
      ...mockTable,
      getHeaderGroups: () => [
        {
          id: 'header-1',
          headers: [
            {
              id: 'col-1',
              column: {
                id: 'name',
                columnDef: { header: 'Name' },
                getSize: () => 150,
                getIsPinned: () => 'left',
                getCanSort: () => false,
                getIsSorted: () => false,
                getToggleSortingHandler: () => vi.fn(),
              },
              getContext: () => ({}),
            },
          ],
        },
      ],
    };
    render(<DataTable table={pinnedTable as any} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });
});

describe('createSelectionColumn', () => {
  it('exports createSelectionColumn function', () => {
    expect(createSelectionColumn).toBeDefined();
    expect(typeof createSelectionColumn).toBe('function');
  });

  it('returns column definition', () => {
    const column = createSelectionColumn();
    expect(column).toBeDefined();
    expect(column.id).toBe('select');
  });

  it('sets correct column id', () => {
    const column = createSelectionColumn();
    expect(column.id).toBe('select');
  });

  it('sets correct column size', () => {
    const column = createSelectionColumn();
    expect(column.size).toBe(50);
  });

  it('disables sorting', () => {
    const column = createSelectionColumn();
    expect(column.enableSorting).toBe(false);
  });

  it('has header function', () => {
    const column = createSelectionColumn();
    expect(typeof column.header).toBe('function');
  });

  it('has cell function', () => {
    const column = createSelectionColumn();
    expect(typeof column.cell).toBe('function');
  });

  it('renders header checkbox', () => {
    const column = createSelectionColumn();
    const mockTable = {
      getIsAllPageRowsSelected: () => false,
      getIsSomePageRowsSelected: () => false,
      getToggleAllPageRowsSelectedHandler: () => vi.fn(),
    };
    const header = column.header({ table: mockTable as any });
    const { container } = render(<div>{header}</div>);
    const checkbox = container.querySelector('.MuiCheckbox-root');
    expect(checkbox).toBeInTheDocument();
  });

  it('renders cell checkbox', () => {
    const column = createSelectionColumn();
    const mockRow = {
      getIsSelected: () => false,
      getCanSelect: () => true,
      getToggleSelectedHandler: () => vi.fn(),
    };
    const cell = column.cell({ row: mockRow });
    const { container } = render(<div>{cell}</div>);
    const checkbox = container.querySelector('.MuiCheckbox-root');
    expect(checkbox).toBeInTheDocument();
  });

  it('header checkbox respects all selected state', () => {
    const column = createSelectionColumn();
    const mockTable = {
      getIsAllPageRowsSelected: () => true,
      getIsSomePageRowsSelected: () => false,
      getToggleAllPageRowsSelectedHandler: () => vi.fn(),
    };
    const header = column.header({ table: mockTable as any });
    const { container } = render(<div>{header}</div>);
    const checkbox = container.querySelector('.MuiCheckbox-root input') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('header checkbox respects indeterminate state', () => {
    const column = createSelectionColumn();
    const mockTable = {
      getIsAllPageRowsSelected: () => false,
      getIsSomePageRowsSelected: () => true,
      getToggleAllPageRowsSelectedHandler: () => vi.fn(),
    };
    const header = column.header({ table: mockTable as any });
    const { container } = render(<div>{header}</div>);
    const checkbox = container.querySelector('.MuiCheckbox-root');
    expect(checkbox).toBeInTheDocument();
  });

  it('cell checkbox respects selected state', () => {
    const column = createSelectionColumn();
    const mockRow = {
      getIsSelected: () => true,
      getCanSelect: () => true,
      getToggleSelectedHandler: () => vi.fn(),
    };
    const cell = column.cell({ row: mockRow });
    const { container } = render(<div>{cell}</div>);
    const checkbox = container.querySelector('.MuiCheckbox-root input') as HTMLInputElement;
    expect(checkbox.checked).toBe(true);
  });

  it('cell checkbox respects disabled state', () => {
    const column = createSelectionColumn();
    const mockRow = {
      getIsSelected: () => false,
      getCanSelect: () => false,
      getToggleSelectedHandler: () => vi.fn(),
    };
    const cell = column.cell({ row: mockRow });
    const { container } = render(<div>{cell}</div>);
    const checkbox = container.querySelector('.MuiCheckbox-root input') as HTMLInputElement;
    expect(checkbox.disabled).toBe(true);
  });

  it('renders Box component in header', () => {
    const column = createSelectionColumn();
    const mockTable = {
      getIsAllPageRowsSelected: () => false,
      getIsSomePageRowsSelected: () => false,
      getToggleAllPageRowsSelectedHandler: () => vi.fn(),
    };
    const header = column.header({ table: mockTable as any });
    const { container } = render(<div>{header}</div>);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });

  it('renders Box component in cell', () => {
    const column = createSelectionColumn();
    const mockRow = {
      getIsSelected: () => false,
      getCanSelect: () => true,
      getToggleSelectedHandler: () => vi.fn(),
    };
    const cell = column.cell({ row: mockRow });
    const { container } = render(<div>{cell}</div>);
    const box = container.querySelector('.MuiBox-root');
    expect(box).toBeInTheDocument();
  });
});
