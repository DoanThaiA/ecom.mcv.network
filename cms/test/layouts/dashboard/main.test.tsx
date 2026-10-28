import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Main, DashboardContent } from 'src/layouts/dashboard/main';

vi.mock('src/layouts/classes', () => ({
  layoutClasses: {
    main: 'layout__main',
    content: 'layout__content',
  },
}));

describe('Main', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<Main>Content</Main>);
    }).not.toThrow();
  });

  it('renders children', () => {
    render(<Main>Test Content</Main>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders as main element', () => {
    const { container } = render(<Main>Content</Main>);
    expect(container.querySelector('main')).toBeInTheDocument();
  });

  it('applies layout class', () => {
    const { container } = render(<Main>Content</Main>);
    const main = container.querySelector('main');
    expect(main).toHaveClass('layout__main');
  });

  it('accepts sx prop', () => {
    render(<Main sx={{ bgcolor: 'red' }}>Content</Main>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('spreads other props to Box', () => {
    render(<Main data-testid="main-box">Content</Main>);
    expect(screen.getByTestId('main-box')).toBeInTheDocument();
  });

  it('exports Main function', () => {
    expect(Main).toBeDefined();
    expect(typeof Main).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof Main).toBe('function');
    expect(Main.name).toBe('Main');
  });
});

describe('DashboardContent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<DashboardContent>Content</DashboardContent>);
    }).not.toThrow();
  });

  it('renders children', () => {
    render(<DashboardContent>Dashboard Content</DashboardContent>);
    expect(screen.getByText('Dashboard Content')).toBeInTheDocument();
  });

  it('applies layout content class', () => {
    const { container } = render(<DashboardContent>Content</DashboardContent>);
    const content = container.querySelector('.layout__content');
    expect(content).toBeInTheDocument();
  });

  it('uses default maxWidth xl', () => {
    const { container } = render(<DashboardContent>Content</DashboardContent>);
    expect(container.querySelector('.MuiContainer-maxWidthXl')).toBeInTheDocument();
  });

  it('accepts custom maxWidth', () => {
    const { container } = render(<DashboardContent maxWidth="lg">Content</DashboardContent>);
    expect(container.querySelector('.MuiContainer-maxWidthLg')).toBeInTheDocument();
  });

  it('accepts disablePadding prop', () => {
    render(<DashboardContent disablePadding>Content</DashboardContent>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('accepts sx prop', () => {
    render(<DashboardContent sx={{ bgcolor: 'blue' }}>Content</DashboardContent>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('spreads other props to Container', () => {
    render(<DashboardContent data-testid="dashboard-content">Content</DashboardContent>);
    expect(screen.getByTestId('dashboard-content')).toBeInTheDocument();
  });

  it('uses theme hook', () => {
    render(<DashboardContent>Content</DashboardContent>);
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('exports DashboardContent function', () => {
    expect(DashboardContent).toBeDefined();
    expect(typeof DashboardContent).toBe('function');
  });

  it('renders Container component', () => {
    const { container } = render(<DashboardContent>Content</DashboardContent>);
    expect(container.querySelector('.MuiContainer-root')).toBeInTheDocument();
  });

  it('is a functional component', () => {
    expect(typeof DashboardContent).toBe('function');
    expect(DashboardContent.name).toBe('DashboardContent');
  });
});
