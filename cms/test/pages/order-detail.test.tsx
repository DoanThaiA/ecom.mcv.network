import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Page from 'src/pages/order-detail';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('src/config-global', () => ({ CONFIG: { appName: 'CCHAT CMS' } }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => ({ order_detail: 'Order Detail' }[k] || k) }) }));
const mockSetTitle = vi.fn();
vi.mock('src/contexts/page-title-context', () => ({ usePageTitle: () => ({ setTitle: mockSetTitle }) }));
vi.mock('src/sections/order', () => ({ OrderDetailView: () => <div data-testid="view">View</div> }));

describe('OrderDetailPage', () => {
  it('renders', () => expect(render(<MemoryRouter initialEntries={['/order/123456']}><Routes><Route path="/order/:id" element={<HelmetProvider><Page /></HelmetProvider>} /></Routes></MemoryRouter>).getByTestId('view')).toBeInTheDocument());
  it('calls setTitle with ID', () => { render(<MemoryRouter initialEntries={['/order/123456']}><Routes><Route path="/order/:id" element={<HelmetProvider><Page /></HelmetProvider>} /></Routes></MemoryRouter>); expect(mockSetTitle).toHaveBeenCalledWith('Order Detail #3456'); });
});
