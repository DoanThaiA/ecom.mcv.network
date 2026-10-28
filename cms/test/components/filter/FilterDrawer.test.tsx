import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FilterDrawer } from 'src/components/filter/FilterDrawer';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/components/filter/FilterActions', () => ({
  FilterActions: ({ onClear, onApply, loading }: any) => (
    <div data-testid="filter-actions">
      <button onClick={onClear} disabled={loading}>
        Clear
      </button>
      <button onClick={onApply} disabled={loading}>
        Apply
      </button>
    </div>
  ),
}));

describe('FilterDrawer', () => {
  it('renders when open', () => {
    render(
      <FilterDrawer open onClose={vi.fn()} onApply={vi.fn()} onClear={vi.fn()}>
        <div>Filter Content</div>
      </FilterDrawer>
    );
    expect(screen.getByText('Filter Content')).toBeInTheDocument();
  });

  it('does not render when closed', () => {
    render(
      <FilterDrawer open={false} onClose={vi.fn()} onApply={vi.fn()} onClear={vi.fn()}>
        <div>Filter Content</div>
      </FilterDrawer>
    );
    expect(screen.queryByText('Filter Content')).not.toBeInTheDocument();
  });

  it('renders default title', () => {
    render(
      <FilterDrawer open onClose={vi.fn()} onApply={vi.fn()} onClear={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );
    expect(screen.getByText('filterTitle')).toBeInTheDocument();
  });

  it('renders custom title', () => {
    render(
      <FilterDrawer open onClose={vi.fn()} onApply={vi.fn()} onClear={vi.fn()} title="customTitle">
        <div>Content</div>
      </FilterDrawer>
    );
    expect(screen.getByText('customTitle')).toBeInTheDocument();
  });

  it('calls onClose when close button clicked', async () => {
    const onClose = vi.fn();
    render(
      <FilterDrawer open onClose={onClose} onApply={vi.fn()} onClear={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );

    const closeButton = screen.getByRole('button', { name: '' }).closest('button');
    await userEvent.click(closeButton!);

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('renders children in body', () => {
    render(
      <FilterDrawer open onClose={vi.fn()} onApply={vi.fn()} onClear={vi.fn()}>
        <div data-testid="custom-content">Custom Filter Fields</div>
      </FilterDrawer>
    );
    expect(screen.getByTestId('custom-content')).toBeInTheDocument();
  });

  it('renders FilterActions in footer', () => {
    render(
      <FilterDrawer open onClose={vi.fn()} onApply={vi.fn()} onClear={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );
    expect(screen.getByTestId('filter-actions')).toBeInTheDocument();
  });

  it('passes onApply to FilterActions', async () => {
    const onApply = vi.fn();
    render(
      <FilterDrawer open onClose={vi.fn()} onApply={onApply} onClear={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );

    await userEvent.click(screen.getByText('Apply'));
    expect(onApply).toHaveBeenCalledTimes(1);
  });

  it('passes onClear to FilterActions', async () => {
    const onClear = vi.fn();
    render(
      <FilterDrawer open onClose={vi.fn()} onApply={vi.fn()} onClear={onClear}>
        <div>Content</div>
      </FilterDrawer>
    );

    await userEvent.click(screen.getByText('Clear'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('passes loading state to FilterActions', () => {
    render(
      <FilterDrawer open onClose={vi.fn()} onApply={vi.fn()} onClear={vi.fn()} loading>
        <div>Content</div>
      </FilterDrawer>
    );

    expect(screen.getByText('Clear')).toBeDisabled();
    expect(screen.getByText('Apply')).toBeDisabled();
  });

  it('renders with custom width', () => {
    render(
      <FilterDrawer open onClose={vi.fn()} onApply={vi.fn()} onClear={vi.fn()} width={500}>
        <div>Content</div>
      </FilterDrawer>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with default width', () => {
    render(
      <FilterDrawer open onClose={vi.fn()} onApply={vi.fn()} onClear={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with loading false by default', () => {
    render(
      <FilterDrawer open onClose={vi.fn()} onApply={vi.fn()} onClear={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );

    expect(screen.getByText('Clear')).not.toBeDisabled();
    expect(screen.getByText('Apply')).not.toBeDisabled();
  });

  it('renders close icon', () => {
    render(
      <FilterDrawer open onClose={vi.fn()} onApply={vi.fn()} onClear={vi.fn()}>
        <div>Content</div>
      </FilterDrawer>
    );
    const closeButton = screen.getByRole('button', { name: '' });
    expect(closeButton).toBeInTheDocument();
  });
});
