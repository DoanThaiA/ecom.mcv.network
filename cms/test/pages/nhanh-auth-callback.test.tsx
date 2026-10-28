import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Page from 'src/pages/nhanh-auth-callback';

// Mock CONFIG
vi.mock('src/config-global', () => ({
  CONFIG: {
    appName: 'Test App',
  },
}));

// Mock the NhanhAuthCallbackView component
vi.mock('src/sections/auth', () => ({
  NhanhAuthCallbackView: () => <div data-testid="nhanh-auth-callback-view">Nhanh Auth Callback View</div>,
}));

describe('NhanhAuthCallbackPage', () => {
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

  it('renders NhanhAuthCallbackView component', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('nhanh-auth-callback-view')).toBeInTheDocument();
  });

  it('renders Fragment wrapper', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    const { container } = renderComponent();
    expect(container.querySelector('[data-testid="nhanh-auth-callback-view"]')).toBeInTheDocument();
  });

  it('renders with HelmetProvider', () => {
    const { container } = renderComponent();
    expect(container).toBeTruthy();
  });
});
