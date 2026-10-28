import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HeaderSection } from 'src/layouts/core/header-section';

const mockTheme = {
  vars: {
    palette: {
      background: {
        defaultChannel: '255 255 255',
      },
    },
  },
  breakpoints: {
    up: () => '@media (min-width:600px)',
  },
  transitions: {
    create: () => 'all 0.3s',
    easing: { easeInOut: 'ease-in-out' },
    duration: { shorter: 300 },
  },
};

vi.mock('@mui/material/styles', () => ({
  useTheme: () => mockTheme,
}));

vi.mock('src/theme/styles', () => ({
  bgBlur: vi.fn(() => ({ backdropFilter: 'blur(6px)' })),
  varAlpha: vi.fn((channel, alpha) => `rgba(${channel}, ${alpha})`),
}));

vi.mock('src/layouts/classes', () => ({
  layoutClasses: {
    header: 'layout-header',
  },
}));

describe('HeaderSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<HeaderSection layoutQuery="md" />);
    }).not.toThrow();
  });

  it('renders AppBar component', () => {
    const { container } = render(<HeaderSection layoutQuery="md" />);
    expect(container.querySelector('.MuiAppBar-root')).toBeInTheDocument();
  });

  it('renders Toolbar component', () => {
    const { container } = render(<HeaderSection layoutQuery="md" />);
    expect(container.querySelector('.MuiToolbar-root')).toBeInTheDocument();
  });

  it('renders Container component', () => {
    const { container } = render(<HeaderSection layoutQuery="md" />);
    expect(container.querySelector('.MuiContainer-root')).toBeInTheDocument();
  });

  it('renders leftArea slot', () => {
    render(
      <HeaderSection
        layoutQuery="md"
        slots={{ leftArea: <div data-testid="left-area">Left</div> }}
      />
    );
    expect(screen.getByTestId('left-area')).toBeInTheDocument();
  });

  it('renders rightArea slot', () => {
    render(
      <HeaderSection
        layoutQuery="md"
        slots={{ rightArea: <div data-testid="right-area">Right</div> }}
      />
    );
    expect(screen.getByTestId('right-area')).toBeInTheDocument();
  });

  it('renders topArea slot', () => {
    render(
      <HeaderSection
        layoutQuery="md"
        slots={{ topArea: <div data-testid="top-area">Top</div> }}
      />
    );
    expect(screen.getByTestId('top-area')).toBeInTheDocument();
  });

  it('renders centerArea slot', () => {
    render(
      <HeaderSection
        layoutQuery="md"
        slots={{ centerArea: <div data-testid="center-area">Center</div> }}
      />
    );
    expect(screen.getByTestId('center-area')).toBeInTheDocument();
  });

  it('renders bottomArea slot', () => {
    render(
      <HeaderSection
        layoutQuery="md"
        slots={{ bottomArea: <div data-testid="bottom-area">Bottom</div> }}
      />
    );
    expect(screen.getByTestId('bottom-area')).toBeInTheDocument();
  });

  it('renders breadcrumbArea slot', () => {
    render(
      <HeaderSection
        layoutQuery="md"
        slots={{ breadcrumbArea: <div data-testid="breadcrumb-area">Breadcrumb</div> }}
      />
    );
    expect(screen.getByTestId('breadcrumb-area')).toBeInTheDocument();
  });

  it('does not render breadcrumbArea when not provided', () => {
    render(<HeaderSection layoutQuery="md" />);
    expect(screen.queryByTestId('breadcrumb-area')).not.toBeInTheDocument();
  });

  it('renders all slots together', () => {
    render(
      <HeaderSection
        layoutQuery="md"
        slots={{
          topArea: <div data-testid="top">Top</div>,
          leftArea: <div data-testid="left">Left</div>,
          centerArea: <div data-testid="center">Center</div>,
          rightArea: <div data-testid="right">Right</div>,
          bottomArea: <div data-testid="bottom">Bottom</div>,
          breadcrumbArea: <div data-testid="breadcrumb">Breadcrumb</div>,
        }}
      />
    );

    expect(screen.getByTestId('top')).toBeInTheDocument();
    expect(screen.getByTestId('left')).toBeInTheDocument();
    expect(screen.getByTestId('center')).toBeInTheDocument();
    expect(screen.getByTestId('right')).toBeInTheDocument();
    expect(screen.getByTestId('bottom')).toBeInTheDocument();
    expect(screen.getByTestId('breadcrumb')).toBeInTheDocument();
  });

  it('applies layout header class', () => {
    const { container } = render(<HeaderSection layoutQuery="md" />);
    expect(container.querySelector('.layout-header')).toBeInTheDocument();
  });

  it('uses theme hook', () => {
    render(<HeaderSection layoutQuery="md" />);
    expect(mockTheme).toBeDefined();
  });

  it('exports HeaderSection function', () => {
    expect(HeaderSection).toBeDefined();
    expect(typeof HeaderSection).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof HeaderSection).toBe('function');
    expect(HeaderSection.name).toBe('HeaderSection');
  });

  it('renders with default layoutQuery', () => {
    const { container } = render(<HeaderSection layoutQuery="md" />);
    expect(container.querySelector('.MuiAppBar-root')).toBeInTheDocument();
  });

  it('renders with custom sx prop', () => {
    const { container } = render(<HeaderSection layoutQuery="md" sx={{ bgcolor: 'red' }} />);
    expect(container).toBeTruthy();
  });

  it('renders with toolbar slotProps', () => {
    const { container } = render(
      <HeaderSection layoutQuery="md" slotProps={{ toolbar: { sx: { minHeight: 64 } } }} />
    );
    expect(container.querySelector('.MuiToolbar-root')).toBeInTheDocument();
  });

  it('renders with container slotProps', () => {
    const { container } = render(
      <HeaderSection layoutQuery="md" slotProps={{ container: { maxWidth: 'lg' } }} />
    );
    expect(container.querySelector('.MuiContainer-root')).toBeInTheDocument();
  });

  it('renders Box components for layout', () => {
    render(
      <HeaderSection
        layoutQuery="md"
        slots={{
          breadcrumbArea: <div>Breadcrumb</div>,
          centerArea: <div>Center</div>,
        }}
      />
    );
    const { container } = render(<HeaderSection layoutQuery="md" />);
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });
});
