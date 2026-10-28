import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import ShockDealEditPage from 'src/pages/shock-deal-edit';

vi.mock('src/config-global', () => ({ CONFIG: { appName: 'Test App' } }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const mockSetTitle = vi.fn();
vi.mock('src/contexts/page-title-context', () => ({ usePageTitle: () => ({ setTitle: mockSetTitle }) }));
vi.mock('src/sections/shock-deal', () => ({ ShockDealEditView: () => <div data-testid="shock-deal-edit-view">View</div> }));

describe('ShockDealEditPage', () => {
  const renderComponent = () => render(<HelmetProvider><ShockDealEditPage /></HelmetProvider>);

  it('renders without crashing', () => {
    expect(renderComponent().container).toBeInTheDocument();
  });

  it('renders ShockDealEditView component', () => {
    expect(renderComponent().getByTestId('shock-deal-edit-view')).toBeInTheDocument();
  });

  it('calls setTitle with editShockDeal', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalledWith('editShockDeal');
  });

  it('renders Fragment wrapper', () => {
    expect(renderComponent().container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    expect(renderComponent().container.querySelector('[data-testid="shock-deal-edit-view"]')).toBeInTheDocument();
  });

  it('renders with HelmetProvider', () => {
    expect(renderComponent().container).toBeTruthy();
  });

  it('uses useTranslation hook', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalled();
  });
});
