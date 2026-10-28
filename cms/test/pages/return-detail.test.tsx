import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Page from 'src/pages/return-detail';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

vi.mock('src/config-global', () => ({ CONFIG: { appName: 'CCHAT CMS' } }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (k: string) => ({ returnDetail: 'Return Detail' }[k] || k) }) }));
const mockSetTitle = vi.fn();
vi.mock('src/contexts/page-title-context', () => ({ usePageTitle: () => ({ setTitle: mockSetTitle }) }));
vi.mock('src/sections/return', () => ({ ReturnDetailView: () => <div data-testid="view">View</div> }));

describe('ReturnDetailPage', () => {
  it('renders', () => expect(render(<MemoryRouter initialEntries={['/return/123456']}><Routes><Route path="/return/:id" element={<HelmetProvider><Page /></HelmetProvider>} /></Routes></MemoryRouter>).getByTestId('view')).toBeInTheDocument());
  it('calls setTitle with ID', () => { render(<MemoryRouter initialEntries={['/return/123456']}><Routes><Route path="/return/:id" element={<HelmetProvider><Page /></HelmetProvider>} /></Routes></MemoryRouter>); expect(mockSetTitle).toHaveBeenCalledWith('Return Detail #3456'); });
});
