import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Page from 'src/pages/zalo-auth-callback';

// Mock CONFIG
vi.mock('src/config-global', () => ({
  CONFIG: {
    appName: 'Test App',
  },
}));

// Mock the ZaloAuthCallbackView component
vi.mock('src/sections/auth', () => ({
  ZaloAuthCallbackView: () => <div data-testid="zalo-auth-callback-view">Zalo Auth Callback View</div>,
}));

describe('ZaloAuthCallbackPage', () => {
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

  it('renders ZaloAuthCallbackView component', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('zalo-auth-callback-view')).toBeInTheDocument();
  });

  it('renders Fragment wrapper', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    const { container } = renderComponent();
    expect(container.querySelector('[data-testid="zalo-auth-callback-view"]')).toBeInTheDocument();
  });

  it('renders with HelmetProvider', () => {
    const { container } = renderComponent();
    expect(container).toBeTruthy();
  });
});
