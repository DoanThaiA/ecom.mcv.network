import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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

  describe('Basic rendering', () => {
    it('renders without crashing', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      expect(container).toBeInTheDocument();
    });

    it('renders HeroSection component', async () => {
      await renderWithTheme(await FAQContent());
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });

    it('renders FAQAccordion component', async () => {
      await renderWithTheme(await FAQContent());
      expect(screen.getByTestId('faq-accordion')).toBeInTheDocument();
    });

    it('renders ContactSection component', async () => {
      await renderWithTheme(await FAQContent());
      expect(screen.getByTestId('contact-section')).toBeInTheDocument();
    });
  });

  describe('Main container styling', () => {
    it('applies min-h-screen class', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const main = container.querySelector('.min-h-screen');
      expect(main).toBeInTheDocument();
    });

    it('applies bg-white class', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const main = container.querySelector('.bg-white');
      expect(main).toBeInTheDocument();
    });

    it('applies overflow-x-hidden class', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const main = container.querySelector('.overflow-x-hidden');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Inner container styling', () => {
    it('applies max-w-[800px] class', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const inner = container.querySelector('.max-w-\\[800px\\]');
      expect(inner).toBeInTheDocument();
    });

    it('applies mx-auto class', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const inner = container.querySelector('.mx-auto');
      expect(inner).toBeInTheDocument();
    });

    it('applies px-5 padding', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const inner = container.querySelector('.px-5');
      expect(inner).toBeInTheDocument();
    });

    it('applies md:px-10 for medium screens', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const inner = container.querySelector('.md\\:px-10');
      expect(inner).toBeInTheDocument();
    });

    it('applies lg:px-0 for large screens', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const inner = container.querySelector('.lg\\:px-0');
      expect(inner).toBeInTheDocument();
    });
  });

  describe('Component order', () => {
    it('renders components in correct order', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const components = container.querySelectorAll('[data-testid]');
      expect(components[0]).toHaveAttribute('data-testid', 'hero-section');
      expect(components[1]).toHaveAttribute('data-testid', 'faq-accordion');
      expect(components[2]).toHaveAttribute('data-testid', 'contact-section');
    });

    it('HeroSection appears before FAQAccordion', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const hero = screen.getByTestId('hero-section');
      const accordion = screen.getByTestId('faq-accordion');
      expect(hero.compareDocumentPosition(accordion)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });

    it('FAQAccordion appears before ContactSection', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const accordion = screen.getByTestId('faq-accordion');
      const contact = screen.getByTestId('contact-section');
      expect(accordion.compareDocumentPosition(contact)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
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

  describe('Radix UI components', () => {
    it('uses Box components', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const boxes = container.querySelectorAll('[class*="rt-Box"]');
      expect(boxes.length).toBeGreaterThan(0);
    });

    it('uses nested Box structure', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const outerBox = container.querySelector('.min-h-screen');
      const innerBox = container.querySelector('.max-w-\\[800px\\]');
      expect(outerBox).toBeInTheDocument();
      expect(innerBox).toBeInTheDocument();
    });
  });

  describe('Layout structure', () => {
    it('has two-level Box nesting', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const boxes = container.querySelectorAll('[class*="rt-Box"]');
      expect(boxes.length).toBeGreaterThanOrEqual(2);
    });

    it('outer Box contains inner Box', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const outer = container.querySelector('.min-h-screen');
      const inner = container.querySelector('.max-w-\\[800px\\]');
      expect(outer).toContainElement(inner);
    });

    it('inner Box contains all child components', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const inner = container.querySelector('.max-w-\\[800px\\]');
      const hero = screen.getByTestId('hero-section');
      const accordion = screen.getByTestId('faq-accordion');
      const contact = screen.getByTestId('contact-section');
      expect(inner).toContainElement(hero);
      expect(inner).toContainElement(accordion);
      expect(inner).toContainElement(contact);
    });
  });

  describe('Responsive design', () => {
    it('has mobile padding (px-5)', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const inner = container.querySelector('.px-5');
      expect(inner).toBeInTheDocument();
    });

    it('has medium screen padding (md:px-10)', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const inner = container.querySelector('.md\\:px-10');
      expect(inner).toBeInTheDocument();
    });

    it('has large screen padding (lg:px-0)', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const inner = container.querySelector('.lg\\:px-0');
      expect(inner).toBeInTheDocument();
    });

    it('centers content with mx-auto', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const inner = container.querySelector('.mx-auto');
      expect(inner).toBeInTheDocument();
    });

    it('constrains max width to 800px', async () => {
      const { container } = await renderWithTheme(await FAQContent());
      const inner = container.querySelector('.max-w-\\[800px\\]');
      expect(inner).toBeInTheDocument();
    });
  });
});
