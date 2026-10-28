import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Page from 'src/pages/product-detail';
import { HelmetProvider } from 'react-helmet-async';

vi.mock('src/config-global', () => ({ CONFIG: { appName: 'CCHAT CMS' } }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => ({ product_detail: 'Product Detail' }[k] || k) }) }));
const mockSetTitle = vi.fn();
vi.mock('src/contexts/page-title-context', () => ({ usePageTitle: () => ({ setTitle: mockSetTitle }) }));
vi.mock('src/redux/store/productSlice', () => ({ selectCurrentProduct: vi.fn() }));
vi.mock('src/redux/store/store', () => ({ useAppSelector: () => null }));
vi.mock('src/sections/product-detail', () => ({ ProductDetailView: () => <div data-testid="view">View</div> }));

describe('ProductDetailPage', () => {
  it('renders', () => expect(render(<HelmetProvider><Page /></HelmetProvider>).getByTestId('view')).toBeInTheDocument());
  it('calls setTitle', () => { render(<HelmetProvider><Page /></HelmetProvider>); expect(mockSetTitle).toHaveBeenCalledWith('Product Detail'); });
});
