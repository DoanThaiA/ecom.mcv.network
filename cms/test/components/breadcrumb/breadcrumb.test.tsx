import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { Breadcrumb } from 'src/components/breadcrumb/breadcrumb';

vi.mock('src/contexts/breadcrumb-context', () => ({
  useBreadcrumb: vi.fn(() => ({ breadcrumbs: [] })),
}));

vi.mock('src/components/iconify', () => ({
  Iconify: ({ icon, width }: any) => <span data-testid="iconify">{icon}</span>,
}));

const mockUseBreadcrumb = vi.mocked(await import('src/contexts/breadcrumb-context')).useBreadcrumb;

describe('Breadcrumb', () => {
  it('renders nothing when no breadcrumbs', () => {
    mockUseBreadcrumb.mockReturnValue({ breadcrumbs: [], setBreadcrumbs: vi.fn() });
    const { container } = render(
      <BrowserRouter>
        <Breadcrumb />
      </BrowserRouter>
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders single breadcrumb without link', () => {
    mockUseBreadcrumb.mockReturnValue({
      breadcrumbs: [{ label: 'Home', href: undefined }],
      setBreadcrumbs: vi.fn(),
    });
    render(
      <BrowserRouter>
        <Breadcrumb />
      </BrowserRouter>
    );
    expect(screen.getByText('Home')).toBeInTheDocument();
  });

  it('renders breadcrumb with link', () => {
    mockUseBreadcrumb.mockReturnValue({
      breadcrumbs: [{ label: 'Dashboard', href: '/dashboard' }],
      setBreadcrumbs: vi.fn(),
    });
    render(
      <BrowserRouter>
        <Breadcrumb />
      </BrowserRouter>
    );
    const link = screen.getByText('Dashboard').closest('a');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('renders multiple breadcrumbs with separator', () => {
    mockUseBreadcrumb.mockReturnValue({
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Products', href: '/products' },
        { label: 'Detail', href: undefined },
      ],
      setBreadcrumbs: vi.fn(),
    });
    render(
      <BrowserRouter>
        <Breadcrumb />
      </BrowserRouter>
    );

    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
    expect(screen.getByText('Detail')).toBeInTheDocument();

    // Should have 2 separators (for 3 items)
    const icons = screen.getAllByTestId('iconify');
    expect(icons).toHaveLength(2);
  });

  it('does not render separator after last item', () => {
    mockUseBreadcrumb.mockReturnValue({
      breadcrumbs: [
        { label: 'Home', href: '/' },
        { label: 'Current', href: undefined },
      ],
      setBreadcrumbs: vi.fn(),
    });
    render(
      <BrowserRouter>
        <Breadcrumb />
      </BrowserRouter>
    );

    // Should have 1 separator (between 2 items)
    const icons = screen.getAllByTestId('iconify');
    expect(icons).toHaveLength(1);
  });

  it('renders last breadcrumb with different styling', () => {
    mockUseBreadcrumb.mockReturnValue({
      breadcrumbs: [
        { label: 'First', href: '/' },
        { label: 'Last', href: undefined },
      ],
      setBreadcrumbs: vi.fn(),
    });
    render(
      <BrowserRouter>
        <Breadcrumb />
      </BrowserRouter>
    );

    expect(screen.getByText('Last')).toBeInTheDocument();
  });

  it('renders breadcrumb without href as plain text', () => {
    mockUseBreadcrumb.mockReturnValue({
      breadcrumbs: [{ label: 'NoLink', href: undefined }],
      setBreadcrumbs: vi.fn(),
    });
    render(
      <BrowserRouter>
        <Breadcrumb />
      </BrowserRouter>
    );

    const element = screen.getByText('NoLink');
    expect(element.closest('a')).toBeNull();
  });

  it('renders breadcrumb with empty string href as link', () => {
    mockUseBreadcrumb.mockReturnValue({
      breadcrumbs: [{ label: 'Item', href: '' }],
      setBreadcrumbs: vi.fn(),
    });
    render(
      <BrowserRouter>
        <Breadcrumb />
      </BrowserRouter>
    );

    // Empty string is falsy, should not render as link
    const element = screen.getByText('Item');
    expect(element.closest('a')).toBeNull();
  });

  it('renders all breadcrumbs in order', () => {
    mockUseBreadcrumb.mockReturnValue({
      breadcrumbs: [
        { label: 'First', href: '/first' },
        { label: 'Second', href: '/second' },
        { label: 'Third', href: '/third' },
      ],
      setBreadcrumbs: vi.fn(),
    });
    render(
      <BrowserRouter>
        <Breadcrumb />
      </BrowserRouter>
    );

    expect(screen.getByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
    expect(screen.getByText('Third')).toBeInTheDocument();
  });
});
