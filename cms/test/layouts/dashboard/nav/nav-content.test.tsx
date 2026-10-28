import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavContent } from 'src/layouts/dashboard/nav/nav-content';
import type { NavItem } from 'src/layouts/config-nav-dashboard';

vi.mock('src/components/logo', () => ({
  Logo: ({ width, height }: { width: number; height: number }) => (
    <div data-testid="logo" data-width={width} data-height={height}>
      Logo
    </div>
  ),
}));

vi.mock('src/components/scrollbar', () => ({
  Scrollbar: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="scrollbar">{children}</div>
  ),
}));

vi.mock('src/layouts/dashboard/nav/nav-content-item', () => ({
  NavContentItem: ({ item }: { item: NavItem }) => (
    <div data-testid="nav-item">{item.title}</div>
  ),
}));

vi.mock('src/layouts/dashboard/nav/nav-colors', () => ({
  NAV_COLORS: {
    border: '#E0E0E0',
  },
}));

describe('NavContent', () => {
  const mockNavItems: NavItem[] = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: null,
    },
    {
      title: 'Products',
      path: '/products',
      icon: null,
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<NavContent data={mockNavItems} workspaces={[]} />);
    }).not.toThrow();
  });

  it('renders Logo component', () => {
    render(<NavContent data={mockNavItems} workspaces={[]} />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders Scrollbar component', () => {
    render(<NavContent data={mockNavItems} workspaces={[]} />);
    expect(screen.getByTestId('scrollbar')).toBeInTheDocument();
  });

  it('renders nav items', () => {
    render(<NavContent data={mockNavItems} workspaces={[]} />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('renders correct number of nav items', () => {
    render(<NavContent data={mockNavItems} workspaces={[]} />);
    const navItems = screen.getAllByTestId('nav-item');
    expect(navItems).toHaveLength(2);
  });

  it('renders Logo with default width when isMiniWidth is false', () => {
    render(<NavContent data={mockNavItems} workspaces={[]} isMiniWidth={false} />);
    const logo = screen.getByTestId('logo');
    expect(logo).toHaveAttribute('data-width', '150');
  });

  it('renders Logo with mini width when isMiniWidth is true', () => {
    render(<NavContent data={mockNavItems} workspaces={[]} isMiniWidth />);
    const logo = screen.getByTestId('logo');
    expect(logo).toHaveAttribute('data-width', '40');
  });

  it('renders topArea slot when provided', () => {
    render(
      <NavContent
        data={mockNavItems}
        workspaces={[]}
        slots={{ topArea: <div>Top Area</div> }}
      />
    );
    expect(screen.getByText('Top Area')).toBeInTheDocument();
  });

  it('renders bottomArea slot when provided', () => {
    render(
      <NavContent
        data={mockNavItems}
        workspaces={[]}
        slots={{ bottomArea: <div>Bottom Area</div> }}
      />
    );
    expect(screen.getByText('Bottom Area')).toBeInTheDocument();
  });

  it('renders both top and bottom slots', () => {
    render(
      <NavContent
        data={mockNavItems}
        workspaces={[]}
        slots={{
          topArea: <div>Top Area</div>,
          bottomArea: <div>Bottom Area</div>,
        }}
      />
    );
    expect(screen.getByText('Top Area')).toBeInTheDocument();
    expect(screen.getByText('Bottom Area')).toBeInTheDocument();
  });

  it('accepts sx prop', () => {
    render(<NavContent data={mockNavItems} workspaces={[]} sx={{ bgcolor: 'red' }} />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('renders with empty nav items', () => {
    render(<NavContent data={[]} workspaces={[]} />);
    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('exports NavContent function', () => {
    expect(NavContent).toBeDefined();
    expect(typeof NavContent).toBe('function');
  });

  it('renders nav element', () => {
    const { container } = render(<NavContent data={mockNavItems} workspaces={[]} />);
    expect(container.querySelector('nav')).toBeInTheDocument();
  });

  it('renders ul element', () => {
    const { container } = render(<NavContent data={mockNavItems} workspaces={[]} />);
    expect(container.querySelector('ul')).toBeInTheDocument();
  });

  it('is a functional component', () => {
    expect(typeof NavContent).toBe('function');
    expect(NavContent.name).toBe('NavContent');
  });
});
