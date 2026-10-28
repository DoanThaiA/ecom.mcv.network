import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import ShockDealCreatePage from 'src/pages/shock-deal-create';

vi.mock('src/config-global', () => ({
  CONFIG: {
    appName: 'Test App',
  },
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const mockSetTitle = vi.fn();
vi.mock('src/contexts/page-title-context', () => ({
  usePageTitle: () => ({
    setTitle: mockSetTitle,
  }),
}));

vi.mock('src/sections/shock-deal', () => ({
  ShockDealCreateView: () => <div data-testid="shock-deal-create-view">Shock Deal Create View</div>,
}));

describe('ShockDealCreatePage', () => {
  const renderComponent = () => {
    return render(
      <HelmetProvider>
        <ShockDealCreatePage />
      </HelmetProvider>
    );
  };

  it('renders without crashing', () => {
    const { container } = renderComponent();
    expect(container).toBeInTheDocument();
  });

  it('renders ShockDealCreateView component', () => {
    const { getByTestId } = renderComponent();
    expect(getByTestId('shock-deal-create-view')).toBeInTheDocument();
  });

  it('calls setTitle with translated createShockDeal', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalledWith('createShockDeal');
  });

  it('renders Fragment wrapper', () => {
    const { container } = renderComponent();
    expect(container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    const { container } = renderComponent();
    expect(container.querySelector('[data-testid="shock-deal-create-view"]')).toBeInTheDocument();
  });

  it('renders with HelmetProvider', () => {
    const { container } = renderComponent();
    expect(container).toBeTruthy();
  });

  it('uses useTranslation hook', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalled();
  });
});
