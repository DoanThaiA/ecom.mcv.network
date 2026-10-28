import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TablePagination } from 'src/components/table/table-pagination';

const mockOnPageSizeChange = vi.fn();
const mockOnPageChange = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('TablePagination', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders total items text', () => {
    render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    expect(screen.getByText(/total.*100/)).toBeInTheDocument();
  });

  it('renders page size selector', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const select = container.querySelector('.MuiSelect-select');
    expect(select).toBeInTheDocument();
  });

  it('renders previous button', () => {
    render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    expect(screen.getByText('<')).toBeInTheDocument();
  });

  it('renders next button', () => {
    render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    expect(screen.getByText('>')).toBeInTheDocument();
  });

  it('disables previous button on first page', () => {
    render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const prevButton = screen.getByText('<').closest('button');
    expect(prevButton).toBeDisabled();
  });

  it('disables next button on last page', () => {
    render(
      <TablePagination
        totalItems={100}
        currentPage={10}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const nextButton = screen.getByText('>').closest('button');
    expect(nextButton).toBeDisabled();
  });

  it('enables previous button when not on first page', () => {
    render(
      <TablePagination
        totalItems={100}
        currentPage={2}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const prevButton = screen.getByText('<').closest('button');
    expect(prevButton).not.toBeDisabled();
  });

  it('enables next button when not on last page', () => {
    render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const nextButton = screen.getByText('>').closest('button');
    expect(nextButton).not.toBeDisabled();
  });

  it('calls onPageChange when previous button clicked', () => {
    render(
      <TablePagination
        totalItems={100}
        currentPage={2}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const prevButton = screen.getByText('<').closest('button');
    fireEvent.click(prevButton!);
    expect(mockOnPageChange).toHaveBeenCalledWith(1);
  });

  it('calls onPageChange when next button clicked', () => {
    render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const nextButton = screen.getByText('>').closest('button');
    fireEvent.click(nextButton!);
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('calls onPageSizeChange when page size changed', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const select = container.querySelector('.MuiSelect-select') as HTMLElement;
    fireEvent.mouseDown(select);
    const option20 = screen.getByText('20/page');
    fireEvent.click(option20);
    expect(mockOnPageSizeChange).toHaveBeenCalledWith(20);
  });

  it('renders jump to page input', () => {
    render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    expect(screen.getByText('jumpTo')).toBeInTheDocument();
  });

  it('handles jump to page input change', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const input = container.querySelector('.MuiTextField-root input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5' } });
    expect(input.value).toBe('5');
  });

  it('handles jump to page on Enter key', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const input = container.querySelector('.MuiTextField-root input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.keyPress(input, { key: 'Enter', code: 'Enter', charCode: 13 });
    expect(mockOnPageChange).toHaveBeenCalledWith(5);
  });

  it('handles jump to page on blur', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const input = container.querySelector('.MuiTextField-root input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '3' } });
    fireEvent.blur(input);
    expect(mockOnPageChange).toHaveBeenCalledWith(3);
  });

  it('renders page numbers', () => {
    render(
      <TablePagination
        totalItems={50}
        currentPage={1}
        pageSize={10}
        totalPages={5}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('calls onPageChange when page number clicked', () => {
    render(
      <TablePagination
        totalItems={50}
        currentPage={1}
        pageSize={10}
        totalPages={5}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const page2Button = screen.getByText('2').closest('button');
    fireEvent.click(page2Button!);
    expect(mockOnPageChange).toHaveBeenCalledWith(2);
  });

  it('renders with default page size options', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const select = container.querySelector('.MuiSelect-select');
    fireEvent.mouseDown(select!);
    const options = screen.getAllByText(/10.*page/);
    expect(options.length).toBeGreaterThan(0);
  });

  it('renders with custom page size options', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={5}
        totalPages={20}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        pageSizeOptions={[5, 15, 25]}
      />
    );
    const select = container.querySelector('.MuiSelect-select');
    fireEvent.mouseDown(select!);
    const options = screen.getAllByText(/5.*page/);
    expect(options.length).toBeGreaterThan(0);
  });

  it('exports TablePagination function', () => {
    expect(TablePagination).toBeDefined();
    expect(typeof TablePagination).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof TablePagination).toBe('function');
    expect(TablePagination.name).toBe('TablePagination');
  });

  it('renders Stack components', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const stacks = container.querySelectorAll('.MuiStack-root');
    expect(stacks.length).toBeGreaterThan(0);
  });

  it('renders Typography component', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const typography = container.querySelectorAll('.MuiTypography-root');
    expect(typography.length).toBeGreaterThan(0);
  });

  it('renders FormControl component', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const formControl = container.querySelector('.MuiFormControl-root');
    expect(formControl).toBeInTheDocument();
  });

  it('renders Select component', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const select = container.querySelector('.MuiSelect-select');
    expect(select).toBeInTheDocument();
  });

  it('renders TextField component', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const textField = container.querySelector('.MuiTextField-root');
    expect(textField).toBeInTheDocument();
  });

  it('renders Button components', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const buttons = container.querySelectorAll('.MuiButton-root');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles single page', () => {
    render(
      <TablePagination
        totalItems={5}
        currentPage={1}
        pageSize={10}
        totalPages={1}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const prevButton = screen.getByText('<').closest('button');
    const nextButton = screen.getByText('>').closest('button');
    expect(prevButton).toBeDisabled();
    expect(nextButton).toBeDisabled();
  });

  it('does not call onPageChange for invalid jump page', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const input = container.querySelector('.MuiTextField-root input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '999' } });
    fireEvent.blur(input);
    expect(mockOnPageChange).not.toHaveBeenCalled();
  });

  it('clears jump page input after successful jump', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const input = container.querySelector('.MuiTextField-root input') as HTMLInputElement;
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.blur(input);
    expect(input.value).toBe('');
  });

  it('shows ellipsis for many pages', () => {
    render(
      <TablePagination
        totalItems={1000}
        currentPage={5}
        pageSize={10}
        totalPages={100}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const ellipsis = screen.getAllByText('...');
    expect(ellipsis.length).toBeGreaterThan(0);
  });

  it('renders with custom sx prop', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
        sx={{ mt: 2 }}
      />
    );
    expect(container.firstChild).toBeInTheDocument();
  });

  it('handles zero total items', () => {
    render(
      <TablePagination
        totalItems={0}
        currentPage={1}
        pageSize={10}
        totalPages={1}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    expect(screen.getByText(/total.*0/)).toBeInTheDocument();
  });

  it('renders MenuItem components', () => {
    const { container } = render(
      <TablePagination
        totalItems={100}
        currentPage={1}
        pageSize={10}
        totalPages={10}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const select = container.querySelector('.MuiSelect-select');
    fireEvent.mouseDown(select!);
    const menuItems = document.querySelectorAll('.MuiMenuItem-root');
    expect(menuItems.length).toBeGreaterThan(0);
  });

  it('highlights current page', () => {
    render(
      <TablePagination
        totalItems={50}
        currentPage={3}
        pageSize={10}
        totalPages={5}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders Box components for ellipsis', () => {
    const { container } = render(
      <TablePagination
        totalItems={1000}
        currentPage={5}
        pageSize={10}
        totalPages={100}
        onPageChange={mockOnPageChange}
        onPageSizeChange={mockOnPageSizeChange}
      />
    );
    const boxes = container.querySelectorAll('.MuiBox-root');
    expect(boxes.length).toBeGreaterThan(0);
  });
});
