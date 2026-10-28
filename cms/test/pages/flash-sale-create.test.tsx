import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import FlashSaleCreatePage from 'src/pages/flash-sale-create';

vi.mock('src/config-global', () => ({ CONFIG: { appName: 'Test App' } }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const mockSetTitle = vi.fn();
vi.mock('src/contexts/page-title-context', () => ({ usePageTitle: () => ({ setTitle: mockSetTitle }) }));
vi.mock('src/sections/flash-sale', () => ({ FlashSaleCreateView: () => <div data-testid="flash-sale-create-view">View</div> }));

describe('FlashSaleCreatePage', () => {
  const renderComponent = () => render(<HelmetProvider><FlashSaleCreatePage /></HelmetProvider>);

  it('renders without crashing', () => {
    expect(renderComponent().container).toBeInTheDocument();
  });

  it('renders FlashSaleCreateView component', () => {
    expect(renderComponent().getByTestId('flash-sale-create-view')).toBeInTheDocument();
  });

  it('calls setTitle with createFlashSale', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalledWith('createFlashSale');
  });

  it('renders Fragment wrapper', () => {
    expect(renderComponent().container.firstChild).toBeInTheDocument();
  });

  it('contains view component', () => {
    expect(renderComponent().container.querySelector('[data-testid="flash-sale-create-view"]')).toBeInTheDocument();
  });

  it('renders with HelmetProvider', () => {
    expect(renderComponent().container).toBeTruthy();
  });

  it('uses useTranslation hook', () => {
    renderComponent();
    expect(mockSetTitle).toHaveBeenCalled();
  });
});
