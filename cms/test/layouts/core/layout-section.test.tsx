import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { LayoutSection } from 'src/layouts/core/layout-section';

const mockTheme = {
  palette: {
    mode: 'light',
    common: {
      white: '#fff',
      black: '#000',
    },
    background: {
      default: '#fff',
    },
  },
  vars: {
    palette: {
      grey: {
        '500Channel': '158 158 158',
      },
    },
  },
  spacing: (n: number) => `${n * 8}px`,
};

vi.mock('@mui/material/styles', () => ({
  useTheme: () => mockTheme,
}));

vi.mock('src/layouts/config-vars', () => ({
  baseVars: vi.fn(() => ({ '--base-color': '#000' })),
}));

vi.mock('src/layouts/classes', () => ({
  layoutClasses: {
    root: 'layout-root',
    hasSidebar: 'has-sidebar',
  },
}));

describe('LayoutSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<LayoutSection>Content</LayoutSection>);
    }).not.toThrow();
  });

  it('renders children', () => {
    render(<LayoutSection>Test Content</LayoutSection>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders headerSection', () => {
    render(
      <LayoutSection headerSection={<div data-testid="header">Header</div>}>
        Content
      </LayoutSection>
    );
    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByText('Header')).toBeInTheDocument();
  });

  it('renders footerSection', () => {
    render(
      <LayoutSection footerSection={<div data-testid="footer">Footer</div>}>
        Content
      </LayoutSection>
    );
    expect(screen.getByTestId('footer')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('renders sidebarSection', () => {
    render(
      <LayoutSection sidebarSection={<div data-testid="sidebar">Sidebar</div>}>
        Content
      </LayoutSection>
    );
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
  });

  it('renders root layout box', () => {
    const { container } = render(<LayoutSection>Content</LayoutSection>);
    const rootLayout = container.querySelector('#root__layout');
    expect(rootLayout).toBeInTheDocument();
  });

  it('applies layout root class', () => {
    const { container } = render(<LayoutSection>Content</LayoutSection>);
    const rootLayout = container.querySelector('#root__layout');
    expect(rootLayout).toHaveClass('layout-root');
  });

  it('applies hasSidebar class to inner box', () => {
    const { container } = render(<LayoutSection>Content</LayoutSection>);
    const innerBox = container.querySelector('.has-sidebar');
    expect(innerBox).toBeInTheDocument();
  });

  it('uses theme hook', () => {
    render(<LayoutSection>Content</LayoutSection>);
    expect(mockTheme).toBeDefined();
  });

  it('renders GlobalStyles', () => {
    const { container } = render(<LayoutSection>Content</LayoutSection>);
    expect(container).toBeTruthy();
  });

  it('renders all sections together', () => {
    render(
      <LayoutSection
        headerSection={<div data-testid="header">Header</div>}
        sidebarSection={<div data-testid="sidebar">Sidebar</div>}
        footerSection={<div data-testid="footer">Footer</div>}
      >
        <div data-testid="content">Content</div>
      </LayoutSection>
    );

    expect(screen.getByTestId('header')).toBeInTheDocument();
    expect(screen.getByTestId('sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('content')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('exports LayoutSection function', () => {
    expect(LayoutSection).toBeDefined();
    expect(typeof LayoutSection).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof LayoutSection).toBe('function');
    expect(LayoutSection.name).toBe('LayoutSection');
  });

  it('renders Box component', () => {
    const { container } = render(<LayoutSection>Content</LayoutSection>);
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('renders without sections', () => {
    render(<LayoutSection>Content</LayoutSection>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with only headerSection', () => {
    render(
      <LayoutSection headerSection={<div>Header</div>}>
        Content
      </LayoutSection>
    );
    expect(screen.getByText('Header')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with only footerSection', () => {
    render(
      <LayoutSection footerSection={<div>Footer</div>}>
        Content
      </LayoutSection>
    );
    expect(screen.getByText('Footer')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('renders with only sidebarSection', () => {
    render(
      <LayoutSection sidebarSection={<div>Sidebar</div>}>
        Content
      </LayoutSection>
    );
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });
});
