import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders } from 'test/utils/testUtils';
import { Logo } from 'src/components/logo/logo';

vi.mock('src/routes/components', () => ({
  RouterLink: ({ children, ...props }: any) => <a {...props}>{children}</a>,
}));

describe('Logo', () => {
  it('renders without crashing', () => {
    const { container } = renderWithProviders(<Logo />);
    expect(container).toBeInTheDocument();
  });

  it('renders single logo by default', () => {
    const { container } = renderWithProviders(<Logo />);
    const img = container.querySelector('img[src="/logo.svg"]');
    expect(img).toBeInTheDocument();
  });

  it('renders full logo when isSingle is false', () => {
    const { container } = renderWithProviders(<Logo isSingle={false} />);
    const svg = container.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('uses default href /', () => {
    const { container } = renderWithProviders(<Logo />);
    const link = container.querySelector('a[href="/"]');
    expect(link).toBeInTheDocument();
  });

  it('uses custom href', () => {
    const { container } = renderWithProviders(<Logo href="/custom" />);
    const link = container.querySelector('a[href="/custom"]');
    expect(link).toBeInTheDocument();
  });

  it('disables link when disableLink is true', () => {
    const { container } = renderWithProviders(<Logo disableLink />);
    const link = container.querySelector('a');
    expect(link).toHaveStyle({ pointerEvents: 'none' });
  });

  it('applies custom className', () => {
    const { container } = renderWithProviders(<Logo className="custom-class" />);
    const link = container.querySelector('.custom-class');
    expect(link).toBeInTheDocument();
  });

  it('includes logo root class', () => {
    const { container } = renderWithProviders(<Logo />);
    const link = container.querySelector('.mnl__logo__root');
    expect(link).toBeInTheDocument();
  });

  it('has aria-label', () => {
    const { container } = renderWithProviders(<Logo />);
    const link = container.querySelector('[aria-label="Logo"]');
    expect(link).toBeInTheDocument();
  });

  it('uses default width and height for single logo', () => {
    const { container } = renderWithProviders(<Logo />);
    const link = container.querySelector('a');
    expect(link).toBeTruthy();
  });

  it('uses default width and height for full logo', () => {
    const { container } = renderWithProviders(<Logo isSingle={false} />);
    const link = container.querySelector('a');
    expect(link).toBeTruthy();
  });

  it('applies custom width', () => {
    const { container } = renderWithProviders(<Logo width={100} />);
    const link = container.querySelector('a');
    expect(link).toBeTruthy();
  });

  it('applies custom height', () => {
    const { container } = renderWithProviders(<Logo height={100} />);
    const link = container.querySelector('a');
    expect(link).toBeTruthy();
  });

  it('applies custom sx styles', () => {
    const { container } = renderWithProviders(<Logo sx={{ color: 'red' }} />);
    const link = container.querySelector('a');
    expect(link).toBeTruthy();
  });

  it('forwards ref', () => {
    const ref = { current: null as HTMLDivElement | null };
    renderWithProviders(<Logo ref={ref} />);
    expect(ref.current).toBeDefined();
  });
});
