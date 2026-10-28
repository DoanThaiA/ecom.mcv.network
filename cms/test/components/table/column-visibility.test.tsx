import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ColumnVisibility } from 'src/components/table/column-visibility';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => (key === 'showColumns' ? 'Show Columns' : key) }),
}));

describe('ColumnVisibility', () => {
  const mockColumn = (id: string, visible: boolean, meta?: { title?: string }, header?: string) => ({
    id,
    columnDef: { meta, header },
    getIsVisible: vi.fn(() => visible),
    getToggleVisibilityHandler: vi.fn(() => vi.fn()),
  });

  const mockTable = (columns: any[]) => ({
    getAllLeafColumns: vi.fn(() => columns),
  });

  it('renders visibility button', () => {
    const table = mockTable([mockColumn('id', true)]);
    render(<ColumnVisibility table={table as any} />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
  });

  it('opens popover on button click', async () => {
    const table = mockTable([mockColumn('id', true)]);
    render(<ColumnVisibility table={table as any} />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(screen.getByText('Show Columns')).toBeInTheDocument();
  });

  it('displays title when popover is open', async () => {
    const table = mockTable([mockColumn('id', true)]);
    render(<ColumnVisibility table={table as any} />);
    const button = screen.getByRole('button');
    await userEvent.click(button);
    expect(screen.getByText('Show Columns')).toBeInTheDocument();
  });

  it('displays column with meta title', async () => {
    const table = mockTable([mockColumn('id', true, { title: 'ID Column' })]);
    render(<ColumnVisibility table={table as any} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('ID Column')).toBeInTheDocument();
  });

  it('displays column with header string', async () => {
    const table = mockTable([mockColumn('name', true, undefined, 'Name Header')]);
    render(<ColumnVisibility table={table as any} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Name Header')).toBeInTheDocument();
  });

  it('displays column id when no meta or header', async () => {
    const table = mockTable([mockColumn('status', true)]);
    render(<ColumnVisibility table={table as any} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('status')).toBeInTheDocument();
  });

  it('prioritizes meta title over header string', async () => {
    const table = mockTable([mockColumn('id', true, { title: 'Meta Title' }, 'Header String')]);
    render(<ColumnVisibility table={table as any} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Meta Title')).toBeInTheDocument();
    expect(screen.queryByText('Header String')).not.toBeInTheDocument();
  });

  it('renders checkbox for each column', async () => {
    const table = mockTable([
      mockColumn('id', true),
      mockColumn('name', true),
      mockColumn('status', true),
    ]);
    render(<ColumnVisibility table={table as any} />);
    await userEvent.click(screen.getByRole('button'));
    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes).toHaveLength(3);
  });

  it('shows checked checkbox for visible column', async () => {
    const table = mockTable([mockColumn('id', true)]);
    render(<ColumnVisibility table={table as any} />);
    await userEvent.click(screen.getByRole('button'));
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeChecked();
  });

  it('shows unchecked checkbox for hidden column', async () => {
    const table = mockTable([mockColumn('id', false)]);
    render(<ColumnVisibility table={table as any} />);
    await userEvent.click(screen.getByRole('button'));
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).not.toBeChecked();
  });

  it('calls toggle handler on checkbox click', async () => {
    const toggleHandler = vi.fn();
    const column = mockColumn('id', true);
    column.getToggleVisibilityHandler = vi.fn(() => toggleHandler);
    const table = mockTable([column]);

    render(<ColumnVisibility table={table as any} />);
    await userEvent.click(screen.getByRole('button'));
    const checkbox = screen.getByRole('checkbox');
    await userEvent.click(checkbox);

    expect(toggleHandler).toHaveBeenCalled();
  });

  it('renders multiple columns with mixed visibility', async () => {
    const table = mockTable([
      mockColumn('id', true, { title: 'ID' }),
      mockColumn('name', false, { title: 'Name' }),
      mockColumn('status', true, { title: 'Status' }),
    ]);
    render(<ColumnVisibility table={table as any} />);
    await userEvent.click(screen.getByRole('button'));

    expect(screen.getByText('ID')).toBeInTheDocument();
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Status')).toBeInTheDocument();

    const checkboxes = screen.getAllByRole('checkbox');
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });

  it('renders visibility icon', () => {
    const table = mockTable([mockColumn('id', true)]);
    const { container } = render(<ColumnVisibility table={table as any} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('handles empty columns list', async () => {
    const table = mockTable([]);
    render(<ColumnVisibility table={table as any} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByText('Show Columns')).toBeInTheDocument();
    const checkboxes = screen.queryAllByRole('checkbox');
    expect(checkboxes).toHaveLength(0);
  });

  it('handles column with empty string title', async () => {
    const table = mockTable([mockColumn('id', true, { title: '' })]);
    render(<ColumnVisibility table={table as any} />);
    await userEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });
});
