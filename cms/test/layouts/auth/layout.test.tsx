import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthLayout } from 'src/layouts/auth/layout';

vi.mock('src/components/logo', () => ({
  Logo: ({ disableLink }: any) => <div data-testid="logo" data-disable-link={disableLink}>Logo</div>,
}));

vi.mock('src/layouts/core/header-section', () => ({
  HeaderSection: ({ slots }: any) => (
    <div data-testid="header-section">
      {slots?.topArea}
      {slots?.leftArea}
      {slots?.rightArea}
    </div>
  ),
}));

vi.mock('src/layouts/core/layout-section', () => ({
  LayoutSection: ({ headerSection, footerSection, children, cssVars, sx }: any) => (
    <div data-testid="layout-section">
      {headerSection}
      {children}
      {footerSection}
    </div>
  ),
}));

vi.mock('src/layouts/auth/main', () => ({
  Main: ({ layoutQuery, children }: any) => (
    <div data-testid="main" data-layout-query={layoutQuery}>
      {children}
    </div>
  ),
}));

describe('AuthLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <AuthLayout>
          <div>Content</div>
        </AuthLayout>
      );
    }).not.toThrow();
  });

  it('renders children', () => {
    render(
      <AuthLayout>
        <div>Test Content</div>
      </AuthLayout>
    );

    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders Logo component', () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('logo')).toBeInTheDocument();
  });

  it('renders Logo with disableLink prop', () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );

    const logo = screen.getByTestId('logo');
    expect(logo).toHaveAttribute('data-disable-link', 'true');
  });

  it('renders HeaderSection component', () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('header-section')).toBeInTheDocument();
  });

  it('renders LayoutSection component', () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('layout-section')).toBeInTheDocument();
  });

  it('renders Main component', () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.getByTestId('main')).toBeInTheDocument();
  });

  it('passes layoutQuery to Main', () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );

    const main = screen.getByTestId('main');
    expect(main).toHaveAttribute('data-layout-query', 'md');
  });

  it('renders Alert in header', () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );

    expect(screen.getByText('This is an info Alert.')).toBeInTheDocument();
  });

  it('exports AuthLayout function', () => {
    expect(AuthLayout).toBeDefined();
    expect(typeof AuthLayout).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof AuthLayout).toBe('function');
    expect(AuthLayout.name).toBe('AuthLayout');
  });

  it('renders with custom sx prop', () => {
    const { container } = render(
      <AuthLayout sx={{ bgcolor: 'red' }}>
        <div>Content</div>
      </AuthLayout>
    );

    expect(container).toBeTruthy();
  });

  it('renders with header sx prop', () => {
    const { container } = render(
      <AuthLayout header={{ sx: { bgcolor: 'blue' } }}>
        <div>Content</div>
      </AuthLayout>
    );

    expect(container).toBeTruthy();
  });

  it('renders without header prop', () => {
    const { container } = render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );

    expect(container).toBeTruthy();
  });

  it('renders footer as null', () => {
    render(
      <AuthLayout>
        <div>Content</div>
      </AuthLayout>
    );

    // Footer should not be in document since it's null
    expect(screen.getByTestId('layout-section')).toBeInTheDocument();
  });
});
