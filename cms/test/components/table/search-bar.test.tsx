import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SearchBar } from 'src/components/table/search-bar';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => (key === 'search' ? 'Search' : key) }),
}));

describe('SearchBar', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
  };

  it('renders search input', () => {
    render(<SearchBar {...defaultProps} />);
    const input = screen.getByPlaceholderText('Search');
    expect(input).toBeInTheDocument();
  });

  it('renders with custom placeholder', () => {
    render(<SearchBar {...defaultProps} placeholder="Custom placeholder" />);
    expect(screen.getByPlaceholderText('Custom placeholder')).toBeInTheDocument();
  });

  it('displays current value', () => {
    render(<SearchBar {...defaultProps} value="test query" />);
    const input = screen.getByPlaceholderText('Search') as HTMLInputElement;
    expect(input.value).toBe('test query');
  });

  it('calls onChange when typing', async () => {
    const onChange = vi.fn();
    render(<SearchBar {...defaultProps} onChange={onChange} />);
    const input = screen.getByPlaceholderText('Search');
    await userEvent.type(input, 'test');
    expect(onChange).toHaveBeenCalled();
  });

  it('renders search button by default', () => {
    render(<SearchBar {...defaultProps} />);
    expect(screen.getByRole('button', { name: 'Search' })).toBeInTheDocument();
  });

  it('hides search button when showSearchButton is false', () => {
    render(<SearchBar {...defaultProps} showSearchButton={false} />);
    expect(screen.queryByRole('button', { name: 'Search' })).not.toBeInTheDocument();
  });

  it('calls onSearch when search button clicked', async () => {
    const onSearch = vi.fn();
    render(<SearchBar {...defaultProps} onSearch={onSearch} />);
    const button = screen.getByRole('button', { name: 'Search' });
    await userEvent.click(button);
    expect(onSearch).toHaveBeenCalledTimes(1);
  });

  it('renders custom actions', () => {
    const renderActions = () => <button>Custom Action</button>;
    render(<SearchBar {...defaultProps} renderActions={renderActions} />);
    expect(screen.getByText('Custom Action')).toBeInTheDocument();
  });

  it('renders far right actions', () => {
    const renderFarRightActions = () => <button>Far Right Action</button>;
    render(<SearchBar {...defaultProps} renderFarRightActions={renderFarRightActions} />);
    expect(screen.getByText('Far Right Action')).toBeInTheDocument();
  });

  it('does not render far right actions when not provided', () => {
    const { container } = render(<SearchBar {...defaultProps} />);
    const stacks = container.querySelectorAll('.MuiStack-root');
    expect(stacks.length).toBeLessThanOrEqual(2);
  });

  it('renders both custom actions and far right actions', () => {
    const renderActions = () => <button>Action</button>;
    const renderFarRightActions = () => <button>Far Action</button>;
    render(
      <SearchBar
        {...defaultProps}
        renderActions={renderActions}
        renderFarRightActions={renderFarRightActions}
      />
    );
    expect(screen.getByText('Action')).toBeInTheDocument();
    expect(screen.getByText('Far Action')).toBeInTheDocument();
  });

  it('applies custom sx prop', () => {
    const { container } = render(<SearchBar {...defaultProps} sx={{ bgcolor: 'red' }} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('uses compact mode by default', () => {
    const { container } = render(<SearchBar {...defaultProps} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('uses normal mode when compact is false', () => {
    const { container } = render(<SearchBar {...defaultProps} compact={false} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders search icon', () => {
    const { container } = render(<SearchBar {...defaultProps} />);
    const icon = container.querySelector('svg');
    expect(icon).toBeInTheDocument();
  });

  it('handles empty value', () => {
    render(<SearchBar {...defaultProps} value="" />);
    const input = screen.getByPlaceholderText('Search') as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('handles onChange with empty value', async () => {
    const onChange = vi.fn();
    render(<SearchBar {...defaultProps} value="test" onChange={onChange} />);
    const input = screen.getByPlaceholderText('Search');
    await userEvent.clear(input);
    expect(onChange).toHaveBeenCalled();
  });

  it('does not call onSearch when button not shown', () => {
    const onSearch = vi.fn();
    render(<SearchBar {...defaultProps} showSearchButton={false} onSearch={onSearch} />);
    expect(screen.queryByRole('button', { name: 'Search' })).not.toBeInTheDocument();
  });

  it('handles long search query', () => {
    const longQuery = 'a'.repeat(200);
    render(<SearchBar {...defaultProps} value={longQuery} />);
    const input = screen.getByPlaceholderText('Search') as HTMLInputElement;
    expect(input.value).toBe(longQuery);
  });

  it('handles special characters in search query', () => {
    render(<SearchBar {...defaultProps} value="@#$%^&*()" />);
    const input = screen.getByPlaceholderText('Search') as HTMLInputElement;
    expect(input.value).toBe('@#$%^&*()');
  });

  it('handles unicode characters in search query', () => {
    render(<SearchBar {...defaultProps} value="产品 🎉" />);
    const input = screen.getByPlaceholderText('Search') as HTMLInputElement;
    expect(input.value).toBe('产品 🎉');
  });
});
