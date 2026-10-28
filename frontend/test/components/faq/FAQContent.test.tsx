import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { FAQContent } from '@/components/faq/FAQContent';
import { Theme } from '@radix-ui/themes';

// Mock child components
vi.mock('@/components/faq/HeroSection', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
}));

vi.mock('@/components/faq/FAQAccordion', () => ({
  FAQAccordion: () => <div data-testid="faq-accordion">FAQ Accordion</div>,
}));

vi.mock('@/components/faq/ContactSection', () => ({
  ContactSection: () => <div data-testid="contact-section">Contact Section</div>,
}));

describe('FAQContent', () => {
  const renderWithTheme = async (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Component rendering', () => {
    it('renders without crashing', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      expect(container).toBeInTheDocument();
    });

    it('renders HeroSection', async () => {
      const { getByTestId } = await renderWithTheme(await FAQContent());
      expect(getByTestId('hero-section')).toBeInTheDocument();
    });

    it('renders FAQAccordion', async () => {
      const { getByTestId } = await renderWithTheme(await FAQContent());
      expect(getByTestId('faq-accordion')).toBeInTheDocument();
    });

    it('renders ContactSection', async () => {
      const { getByTestId } = await renderWithTheme(await FAQContent());
      expect(getByTestId('contact-section')).toBeInTheDocument();
    });
  });

  describe('Layout structure', () => {
    it('applies min-h-screen to outer container', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const outerBox = container.querySelector('.min-h-screen');
      expect(outerBox).toBeInTheDocument();
    });

    it('applies bg-white to outer container', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const outerBox = container.querySelector('.bg-white');
      expect(outerBox).toBeInTheDocument();
    });

    it('applies overflow-x-hidden to outer container', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const outerBox = container.querySelector('.overflow-x-hidden');
      expect(outerBox).toBeInTheDocument();
    });

    it('applies max-w-[800px] to inner container', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const innerBox = container.querySelector('.max-w-\\[800px\\]');
      expect(innerBox).toBeInTheDocument();
    });

    it('applies mx-auto to inner container', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const innerBox = container.querySelector('.mx-auto');
      expect(innerBox).toBeInTheDocument();
    });

    it('applies px-5 to inner container', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const innerBox = container.querySelector('.px-5');
      expect(innerBox).toBeInTheDocument();
    });

    it('applies md:px-10 to inner container', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const innerBox = container.querySelector('.md\\:px-10');
      expect(innerBox).toBeInTheDocument();
    });

    it('applies lg:px-0 to inner container', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const innerBox = container.querySelector('.lg\\:px-0');
      expect(innerBox).toBeInTheDocument();
    });
  });

  describe('Component order', () => {
    it('renders sections in correct order', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const sections = container.querySelectorAll('[data-testid]');
      expect(sections[0]).toHaveAttribute('data-testid', 'hero-section');
      expect(sections[1]).toHaveAttribute('data-testid', 'faq-accordion');
      expect(sections[2]).toHaveAttribute('data-testid', 'contact-section');
    });
  });

  describe('Async function', () => {
    it('is an async function', () => {
      expect(FAQContent.constructor.name).toBe('AsyncFunction');
    });

    it('returns a Promise', () => {
      const result = FAQContent();
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
