import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Theme } from '@radix-ui/themes';
import { AdSection } from '@/components/ads/AdSection';

const { extractSamePageHashMock, scrollToHashMock } = vi.hoisted(() => ({
  extractSamePageHashMock: vi.fn(),
  scrollToHashMock: vi.fn(),
}));

vi.mock('@/lib/utils/dom', () => ({
  extractSamePageHash: extractSamePageHashMock,
  scrollToHash: scrollToHashMock,
}));

describe('AdSection', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  const decodedSrc = (image: HTMLElement) =>
    decodeURIComponent(image.getAttribute('src') ?? '');

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('image rendering', () => {
    it('renders a transformed Next Image URL containing the relative source', () => {
      renderWithTheme(<AdSection imageUrl="/ads/test-ad.jpg" />);

      expect(decodedSrc(screen.getByRole('img'))).toContain('/ads/test-ad.jpg');
    });

    it('renders a transformed Next Image URL containing the absolute source', () => {
      renderWithTheme(
        <AdSection imageUrl="https://example.com/banner.jpg" />
      );

      expect(decodedSrc(screen.getByRole('img'))).toContain(
        'https://example.com/banner.jpg'
      );
    });

    it('retains data URLs without transformation', () => {
      const dataUrl =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      renderWithTheme(<AdSection imageUrl={dataUrl} />);

      expect(screen.getByRole('img')).toHaveAttribute('src', dataUrl);
    });

    it('uses the default alt text', () => {
      renderWithTheme(<AdSection imageUrl="/ads/test-ad.jpg" />);

      expect(screen.getByAltText('Advertisement')).toBeInTheDocument();
    });

    it('uses custom alt text', () => {
      renderWithTheme(
        <AdSection imageUrl="/ads/test-ad.jpg" alt="Special Offer" />
      );

      expect(screen.getByAltText('Special Offer')).toBeInTheDocument();
    });

    it('falls back to Advertisement when alt text is empty', () => {
      renderWithTheme(<AdSection imageUrl="/ads/test-ad.jpg" alt="" />);

      expect(screen.getByAltText('Advertisement')).toBeInTheDocument();
    });

    it('uses zero intrinsic dimensions and responsive sizing classes', () => {
      renderWithTheme(<AdSection imageUrl="/ads/test-ad.jpg" />);
      const image = screen.getByRole('img');

      expect(image).toHaveAttribute('width', '0');
      expect(image).toHaveAttribute('height', '0');
      expect(image).toHaveClass('w-full', 'h-auto');
    });
  });

  describe('single-ad container', () => {
    it('renders the media inside a full-width content container', () => {
      const { container } = renderWithTheme(
        <AdSection imageUrl="/ads/test-ad.jpg" />
      );

      expect(container.querySelector('.w-full')).toContainElement(
        screen.getByRole('img')
      );
    });

    it('does not render an anchor when href is absent', () => {
      renderWithTheme(<AdSection imageUrl="/ads/test-ad.jpg" />);

      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('uses the current clickable Box wrapper when href is provided', () => {
      const { container } = renderWithTheme(
        <AdSection imageUrl="/ads/test-ad.jpg" href="/promo" />
      );
      const wrapper = container.querySelector('.cursor-pointer');

      expect(wrapper).toHaveClass('block', 'no-underline');
      expect(wrapper).toContainElement(screen.getByRole('img'));
      expect(screen.queryByRole('link')).not.toBeInTheDocument();
    });

    it('scrolls to a same-page hash when the clickable Box is clicked', () => {
      extractSamePageHashMock.mockReturnValue('#promo');
      const { container } = renderWithTheme(
        <AdSection imageUrl="/ads/test-ad.jpg" href="/offers#promo" />
      );

      fireEvent.click(container.querySelector('.cursor-pointer')!);

      expect(extractSamePageHashMock).toHaveBeenCalledWith('/offers#promo');
      expect(scrollToHashMock).toHaveBeenCalledWith('#promo');
    });
  });

  describe('empty media', () => {
    it('renders null for an empty imageUrl without responsive media', () => {
      const { container } = renderWithTheme(<AdSection imageUrl="" />);

      expect(container.firstChild).toBeEmptyDOMElement();
    });
  });
});
