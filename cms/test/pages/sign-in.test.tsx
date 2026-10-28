import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Page from 'src/pages/sign-in';

// Mock CONFIG
vi.mock('src/config-global', () => ({
  CONFIG: {
    appName: 'Test App',
  },
}));

// Mock the SignInView component
vi.mock('src/sections/auth', () => ({
  SignInView: () => <div data-testid="sign-in-view">Sign In View</div>,
}));

describe('SignInPage', () => {
  const renderComponent = () => {
    return render(
      <HelmetProvider>
        <Page />
      </HelmetProvider>
    );
  };

  it('renders without crashing', () => {
    const { container } = renderComponent();
    expect(container).toBeInTheDocument();
  });

  it('renders SignInView component', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('sign-in-view')).toBeInTheDocument();
  });

  it('renders Fragment wrapper', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    const { container } = renderComponent();
    expect(container.querySelector('[data-testid="sign-in-view"]')).toBeInTheDocument();
  });

  it('renders with HelmetProvider', () => {
    const { container } = renderComponent();
    expect(container).toBeTruthy();
  });
});
