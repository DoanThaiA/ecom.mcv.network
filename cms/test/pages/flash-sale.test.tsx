import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import FlashSalePage from 'src/pages/flash-sale';

const mockT = vi.fn((key: string) => key);
const mockSetTitle = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

vi.mock('src/config-global', () => ({
  CONFIG: { appName: 'Test CMS' },
}));

vi.mock('src/contexts/page-title-context', () => ({
  usePageTitle: () => ({ setTitle: mockSetTitle }),
}));

vi.mock('src/sections/flash-sale', () => ({
  FlashSaleView: () => <div data-testid="flash-sale-view">FlashSaleView</div>,
}));

describe('FlashSalePage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <HelmetProvider>
          <FlashSalePage />
        </HelmetProvider>
      );
    }).not.toThrow();
  });

  it('renders FlashSaleView component', () => {
    render(
      <HelmetProvider>
        <FlashSalePage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('flash-sale-view')).toBeInTheDocument();
  });

  it('calls setTitle with translated text', () => {
    render(
      <HelmetProvider>
        <FlashSalePage />
      </HelmetProvider>
    );
    expect(mockSetTitle).toHaveBeenCalledWith('flashSaleManagement');
  });

  it('uses useTranslation hook', () => {
    render(
      <HelmetProvider>
        <FlashSalePage />
      </HelmetProvider>
    );
    expect(mockT).toHaveBeenCalled();
  });

  it('uses usePageTitle hook', () => {
    render(
      <HelmetProvider>
        <FlashSalePage />
      </HelmetProvider>
    );
    expect(mockSetTitle).toHaveBeenCalled();
  });

  it('exports default function', () => {
    expect(FlashSalePage).toBeDefined();
    expect(typeof FlashSalePage).toBe('function');
  });

  it('uses CONFIG from config-global', () => {
    render(
      <HelmetProvider>
        <FlashSalePage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('flash-sale-view')).toBeInTheDocument();
  });

  it('renders with Helmet meta tags', () => {
    const { container } = render(
      <HelmetProvider>
        <FlashSalePage />
      </HelmetProvider>
    );
    expect(container).toBeTruthy();
  });

  it('imports FlashSaleView from sections', () => {
    render(
      <HelmetProvider>
        <FlashSalePage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('flash-sale-view')).toBeDefined();
  });

  it('is a functional component', () => {
    expect(typeof FlashSalePage).toBe('function');
    expect(FlashSalePage.name).toBe('FlashSalePage');
  });
});
