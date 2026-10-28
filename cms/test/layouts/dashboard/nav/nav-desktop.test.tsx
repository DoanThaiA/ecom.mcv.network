import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NavDesktop } from 'src/layouts/dashboard/nav/nav-desktop';

const mockTheme = {
  breakpoints: {
    up: () => '@media (min-width:900px)',
  },
};

const mockT = vi.fn((key: string) => key);

vi.mock('@mui/material/styles', () => ({
  useTheme: () => mockTheme,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

vi.mock('src/layouts/dashboard/nav/nav-content', () => ({
  NavContent: ({ data, workspaces, isMiniWidth }: any) => (
    <div data-testid="nav-content" data-mini-width={isMiniWidth}>
      Nav Content
    </div>
  ),
}));

vi.mock('src/layouts/dashboard/nav/nav-colors', () => ({
  NAV_COLORS: {
    bg: '#1a1a1a',
    border: '#333',
    text: '#fff',
    textActive: '#00ff00',
  },
}));

vi.mock('../../../../version.json', () => ({
  default: {
    version: '1.2.3',
  },
}));

vi.mock('src/components/logo', () => ({
  Logo: ({ isMiniWidth }: any) => (
    <div data-testid="logo" data-mini-width={isMiniWidth}>
      Logo
    </div>
  ),
}));

describe('NavDesktop', () => {
  const mockOnClickExpand = vi.fn();
  const mockData = [];
  const mockWorkspaces = [];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <NavDesktop
          data={mockData}
          workspaces={mockWorkspaces}
          layoutQuery="md"
          widthNavDesktop="280px"
          onClickExpand={mockOnClickExpand}
        />
      );
    }).not.toThrow();
  });

  it('renders NavContent component', () => {
    render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="md"
        widthNavDesktop="280px"
        onClickExpand={mockOnClickExpand}
      />
    );
    expect(screen.getByTestId('nav-content')).toBeInTheDocument();
  });

  it('renders version text in expanded mode', () => {
    render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="md"
        widthNavDesktop="280px"
        onClickExpand={mockOnClickExpand}
      />
    );
    expect(screen.getByText('v1.2.3')).toBeInTheDocument();
  });

  it('does not render version text in mini mode', () => {
    render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="md"
        widthNavDesktop="var(--layout-nav-mini-width)"
        onClickExpand={mockOnClickExpand}
      />
    );
    expect(screen.queryByText('v1.2.3')).not.toBeInTheDocument();
  });

  it('renders expand button', () => {
    render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="md"
        widthNavDesktop="280px"
        onClickExpand={mockOnClickExpand}
      />
    );
    expect(screen.getByRole('button', { hidden: true })).toBeInTheDocument();
  });

  it('calls onClickExpand when button is clicked', () => {
    render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="md"
        widthNavDesktop="280px"
        onClickExpand={mockOnClickExpand}
      />
    );

    const button = screen.getByRole('button', { hidden: true });
    fireEvent.click(button);

    expect(mockOnClickExpand).toHaveBeenCalledTimes(1);
  });

  it('renders compact text in expanded mode', () => {
    render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="md"
        widthNavDesktop="280px"
        onClickExpand={mockOnClickExpand}
      />
    );
    expect(screen.getByText('compact')).toBeInTheDocument();
  });

  it('does not render compact text in mini mode', () => {
    render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="md"
        widthNavDesktop="var(--layout-nav-mini-width)"
        onClickExpand={mockOnClickExpand}
      />
    );
    expect(screen.queryByText('compact')).not.toBeInTheDocument();
  });

  it('passes isMiniWidth=false to NavContent in expanded mode', () => {
    render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="md"
        widthNavDesktop="280px"
        onClickExpand={mockOnClickExpand}
      />
    );
    const navContent = screen.getByTestId('nav-content');
    expect(navContent).toHaveAttribute('data-mini-width', 'false');
  });

  it('passes isMiniWidth=true to NavContent in mini mode', () => {
    render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="md"
        widthNavDesktop="var(--layout-nav-mini-width)"
        onClickExpand={mockOnClickExpand}
      />
    );
    const navContent = screen.getByTestId('nav-content');
    expect(navContent).toHaveAttribute('data-mini-width', 'true');
  });

  it('uses theme hook', () => {
    render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="md"
        widthNavDesktop="280px"
        onClickExpand={mockOnClickExpand}
      />
    );
    expect(mockTheme).toBeDefined();
  });

  it('uses translation hook', () => {
    render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="md"
        widthNavDesktop="280px"
        onClickExpand={mockOnClickExpand}
      />
    );
    expect(mockT).toHaveBeenCalled();
  });

  it('exports NavDesktop function', () => {
    expect(NavDesktop).toBeDefined();
    expect(typeof NavDesktop).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof NavDesktop).toBe('function');
    expect(NavDesktop.name).toBe('NavDesktop');
  });

  it('renders Box component', () => {
    const { container } = render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="md"
        widthNavDesktop="280px"
        onClickExpand={mockOnClickExpand}
      />
    );
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('renders IconButton component', () => {
    const { container } = render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="md"
        widthNavDesktop="280px"
        onClickExpand={mockOnClickExpand}
      />
    );
    expect(container.querySelector('.MuiIconButton-root')).toBeInTheDocument();
  });

  it('renders with custom sx prop', () => {
    const { container } = render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="md"
        widthNavDesktop="280px"
        onClickExpand={mockOnClickExpand}
        sx={{ bgcolor: 'red' }}
      />
    );
    expect(container).toBeTruthy();
  });

  it('renders with different layoutQuery', () => {
    const { container } = render(
      <NavDesktop
        data={mockData}
        workspaces={mockWorkspaces}
        layoutQuery="lg"
        widthNavDesktop="280px"
        onClickExpand={mockOnClickExpand}
      />
    );
    expect(container).toBeTruthy();
  });
});
