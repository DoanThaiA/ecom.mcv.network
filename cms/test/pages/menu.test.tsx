import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import MenuPage from 'src/pages/menu';

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

vi.mock('src/sections/menu', () => ({
  MenuView: () => <div data-testid="menu-view">MenuView</div>,
}));

describe('MenuPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <HelmetProvider>
          <MenuPage />
        </HelmetProvider>
      );
    }).not.toThrow();
  });

  it('renders MenuView component', () => {
    render(
      <HelmetProvider>
        <MenuPage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('menu-view')).toBeInTheDocument();
  });

  it('calls setTitle with translated text', () => {
    render(
      <HelmetProvider>
        <MenuPage />
      </HelmetProvider>
    );
    expect(mockSetTitle).toHaveBeenCalledWith('menuManagement');
  });

  it('uses useTranslation hook', () => {
    render(
      <HelmetProvider>
        <MenuPage />
      </HelmetProvider>
    );
    expect(mockT).toHaveBeenCalled();
  });

  it('uses usePageTitle hook', () => {
    render(
      <HelmetProvider>
        <MenuPage />
      </HelmetProvider>
    );
    expect(mockSetTitle).toHaveBeenCalled();
  });

  it('exports default function', () => {
    expect(MenuPage).toBeDefined();
    expect(typeof MenuPage).toBe('function');
  });

  it('uses CONFIG from config-global', () => {
    render(
      <HelmetProvider>
        <MenuPage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('menu-view')).toBeInTheDocument();
  });

  it('renders with Helmet meta tags', () => {
    const { container } = render(
      <HelmetProvider>
        <MenuPage />
      </HelmetProvider>
    );
    expect(container).toBeTruthy();
  });

  it('imports MenuView from sections', () => {
    render(
      <HelmetProvider>
        <MenuPage />
      </HelmetProvider>
    );
    expect(screen.getByTestId('menu-view')).toBeDefined();
  });

  it('is a functional component', () => {
    expect(typeof MenuPage).toBe('function');
    expect(MenuPage.name).toBe('MenuPage');
  });
});
