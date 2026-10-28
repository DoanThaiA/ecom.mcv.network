import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import Page from 'src/pages/forgot-password';

// Mock the ForgotPasswordView component
vi.mock('src/sections/auth/forgot-password-view', () => ({
  ForgotPasswordView: () => <div data-testid="forgot-password-view">Forgot Password View</div>,
}));

describe('ForgotPasswordPage', () => {
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

  it('renders ForgotPasswordView component', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('forgot-password-view')).toBeInTheDocument();
  });

  it('renders Fragment wrapper', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    const { container } = renderComponent();
    expect(container.querySelector('[data-testid="forgot-password-view"]')).toBeInTheDocument();
  });

  it('renders with HelmetProvider', () => {
    const { container } = renderComponent();
    expect(container).toBeTruthy();
  });
});
