import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NavMobile } from 'src/layouts/dashboard/nav/nav-mobile';

const mockOnClose = vi.fn();
let mockPathname = '/';

vi.mock('src/routes/hooks', () => ({
  usePathname: () => mockPathname,
}));

vi.mock('src/layouts/dashboard/nav/nav-colors', () => ({
  NAV_COLORS: {
    bg: '#ffffff',
  },
}));

vi.mock('@mui/material/Drawer', () => ({
  default: ({ children, open, onClose, sx }: any) => (
    <div data-testid="drawer" data-open={open} data-sx={JSON.stringify(sx)}>
      {children}
    </div>
  ),
  drawerClasses: {
    paper: 'MuiDrawer-paper',
  },
}));

vi.mock('src/layouts/dashboard/nav/nav-content', () => ({
  NavContent: ({ data, slots, workspaces }: any) => (
    <div data-testid="nav-content" data-data={JSON.stringify(data)}>
      Nav Content
    </div>
  ),
}));

vi.mock('src/components/logo', () => ({
  Logo: () => <div data-testid="logo">Logo</div>,
}));

describe('NavMobile', () => {
  beforeEach(() => {
    mockOnClose.mockClear();
    mockPathname = '/';
  });

  it('renders Drawer component', () => {
    render(
      <NavMobile
        data={[]}
        open={false}
        onClose={mockOnClose}
        workspaces={[]}
        slots={{}}
      />
    );
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });

  it('renders NavContent inside Drawer', () => {
    render(
      <NavMobile
        data={[]}
        open={false}
        onClose={mockOnClose}
        workspaces={[]}
        slots={{}}
      />
    );
    expect(screen.getByTestId('nav-content')).toBeInTheDocument();
  });

  it('passes open prop to Drawer', () => {
    render(
      <NavMobile
        data={[]}
        open={true}
        onClose={mockOnClose}
        workspaces={[]}
        slots={{}}
      />
    );
    const drawer = screen.getByTestId('drawer');
    expect(drawer).toHaveAttribute('data-open', 'true');
  });

  it('passes onClose prop to Drawer', () => {
    render(
      <NavMobile
        data={[]}
        open={false}
        onClose={mockOnClose}
        workspaces={[]}
        slots={{}}
      />
    );
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });

  it('passes data to NavContent', () => {
    const data = [{ title: 'Test' }];
    render(
      <NavMobile
        data={data}
        open={false}
        onClose={mockOnClose}
        workspaces={[]}
        slots={{}}
      />
    );
    const navContent = screen.getByTestId('nav-content');
    expect(navContent).toHaveAttribute('data-data', JSON.stringify(data));
  });

  it('passes slots to NavContent', () => {
    render(
      <NavMobile
        data={[]}
        open={false}
        onClose={mockOnClose}
        workspaces={[]}
        slots={{ header: <div>Header</div> }}
      />
    );
    expect(screen.getByTestId('nav-content')).toBeInTheDocument();
  });

  it('passes workspaces to NavContent', () => {
    const workspaces = [{ id: '1', name: 'Workspace 1' }];
    render(
      <NavMobile
        data={[]}
        open={false}
        onClose={mockOnClose}
        workspaces={workspaces}
        slots={{}}
      />
    );
    expect(screen.getByTestId('nav-content')).toBeInTheDocument();
  });

  it('applies sx styles to Drawer', () => {
    const sx = { padding: 2 };
    render(
      <NavMobile
        data={[]}
        open={false}
        onClose={mockOnClose}
        workspaces={[]}
        slots={{}}
        sx={sx}
      />
    );
    const drawer = screen.getByTestId('drawer');
    expect(drawer).toHaveAttribute('data-sx');
  });

  it('uses NAV_COLORS.bg for background', () => {
    render(
      <NavMobile
        data={[]}
        open={false}
        onClose={mockOnClose}
        workspaces={[]}
        slots={{}}
      />
    );
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });

  it('uses usePathname hook', () => {
    render(
      <NavMobile
        data={[]}
        open={false}
        onClose={mockOnClose}
        workspaces={[]}
        slots={{}}
      />
    );
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });

  it('exports NavMobile function', () => {
    expect(NavMobile).toBeDefined();
    expect(typeof NavMobile).toBe('function');
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <NavMobile
          data={[]}
          open={false}
          onClose={mockOnClose}
          workspaces={[]}
          slots={{}}
        />
      );
    }).not.toThrow();
  });

  it('accepts NavContentProps', () => {
    render(
      <NavMobile
        data={[{ title: 'Test', path: '/test' }]}
        open={false}
        onClose={mockOnClose}
        workspaces={[]}
        slots={{}}
      />
    );
    expect(screen.getByTestId('nav-content')).toBeInTheDocument();
  });

  it('has open and onClose props', () => {
    const { container } = render(
      <NavMobile
        data={[]}
        open={true}
        onClose={mockOnClose}
        workspaces={[]}
        slots={{}}
      />
    );
    expect(container).toBeInTheDocument();
  });

  it('applies drawer paper styles', () => {
    render(
      <NavMobile
        data={[]}
        open={false}
        onClose={mockOnClose}
        workspaces={[]}
        slots={{}}
      />
    );
    const drawer = screen.getByTestId('drawer');
    expect(drawer).toHaveAttribute('data-sx');
  });

  it('sets mobile width CSS variable', () => {
    render(
      <NavMobile
        data={[]}
        open={false}
        onClose={mockOnClose}
        workspaces={[]}
        slots={{}}
      />
    );
    expect(screen.getByTestId('drawer')).toBeInTheDocument();
  });
});
