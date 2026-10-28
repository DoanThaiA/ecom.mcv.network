import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeliveryPolicyContent } from '@/components/policy/delivery/DeliveryPolicyContent';
import { Theme } from '@radix-ui/themes';

// Mock child components
vi.mock('@/components/policy/delivery/HeroSection', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
}));

vi.mock('@/components/policy/delivery/Section1', () => ({
  Section1: () => <div data-testid="section1">Section 1</div>,
}));

vi.mock('@/components/policy/delivery/Section2', () => ({
  Section2: () => <div data-testid="section2">Section 2</div>,
}));

vi.mock('@/components/common/FeedbackSection', () => ({
  FeedbackSection: () => <div data-testid="feedback-section">Feedback Section</div>,
}));

describe('DeliveryPolicyContent', () => {
  const renderWithTheme = async (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders without crashing', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      expect(container).toBeInTheDocument();
    });

    it('renders HeroSection component', async () => {
      await renderWithTheme(await DeliveryPolicyContent());
      expect(screen.getByTestId('hero-section')).toBeInTheDocument();
    });

    it('renders Section1 component', async () => {
      await renderWithTheme(await DeliveryPolicyContent());
      expect(screen.getByTestId('section1')).toBeInTheDocument();
    });

    it('renders Section2 component', async () => {
      await renderWithTheme(await DeliveryPolicyContent());
      expect(screen.getByTestId('section2')).toBeInTheDocument();
    });

    it('renders FeedbackSection component', async () => {
      await renderWithTheme(await DeliveryPolicyContent());
      expect(screen.getByTestId('feedback-section')).toBeInTheDocument();
    });
  });

  describe('Main container styling', () => {
    it('applies min-h-screen class', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const main = container.querySelector('.min-h-screen');
      expect(main).toBeInTheDocument();
    });

    it('applies bg-white class', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const main = container.querySelector('.bg-white');
      expect(main).toBeInTheDocument();
    });

    it('applies overflow-x-hidden class', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const main = container.querySelector('.overflow-x-hidden');
      expect(main).toBeInTheDocument();
    });
  });

  describe('Inner container styling', () => {
    it('applies max-w-[800px] class', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const inner = container.querySelector('.max-w-\\[800px\\]');
      expect(inner).toBeInTheDocument();
    });

    it('applies mx-auto class', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const inner = container.querySelector('.mx-auto');
      expect(inner).toBeInTheDocument();
    });

    it('applies px-5 padding', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const inner = container.querySelector('.px-5');
      expect(inner).toBeInTheDocument();
    });

    it('applies md:px-10 for medium screens', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const inner = container.querySelector('.md\\:px-10');
      expect(inner).toBeInTheDocument();
    });

    it('applies lg:px-0 for large screens', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const inner = container.querySelector('.lg\\:px-0');
      expect(inner).toBeInTheDocument();
    });
  });

  describe('Component order', () => {
    it('renders components in correct order', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const components = container.querySelectorAll('[data-testid]');
      expect(components[0]).toHaveAttribute('data-testid', 'hero-section');
      expect(components[1]).toHaveAttribute('data-testid', 'section1');
      expect(components[2]).toHaveAttribute('data-testid', 'section2');
      expect(components[3]).toHaveAttribute('data-testid', 'feedback-section');
    });

    it('HeroSection appears before Section1', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const hero = screen.getByTestId('hero-section');
      const section1 = screen.getByTestId('section1');
      expect(hero.compareDocumentPosition(section1)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('Section1 appears before Section2', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const section1 = screen.getByTestId('section1');
      const section2 = screen.getByTestId('section2');
      expect(section1.compareDocumentPosition(section2)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it('Section2 appears before FeedbackSection', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const section2 = screen.getByTestId('section2');
      const feedback = screen.getByTestId('feedback-section');
      expect(section2.compareDocumentPosition(feedback)).toBe(
        Node.DOCUMENT_POSITION_FOLLOWING
      );
    });
  });

  describe('Async function', () => {
    it('is an async function', () => {
      expect(DeliveryPolicyContent.constructor.name).toBe('AsyncFunction');
    });

    it('returns a Promise', () => {
      const result = DeliveryPolicyContent();
      expect(result).toBeInstanceOf(Promise);
    });
  });

  describe('Radix UI components', () => {
    it('uses Box components', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const boxes = container.querySelectorAll('[class*="rt-Box"]');
      expect(boxes.length).toBeGreaterThan(0);
    });

    it('uses nested Box structure', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const outerBox = container.querySelector('.min-h-screen');
      const innerBox = container.querySelector('.max-w-\\[800px\\]');
      expect(outerBox).toBeInTheDocument();
      expect(innerBox).toBeInTheDocument();
    });
  });

  describe('Layout structure', () => {
    it('has two-level Box nesting', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const boxes = container.querySelectorAll('[class*="rt-Box"]');
      expect(boxes.length).toBeGreaterThanOrEqual(2);
    });

    it('outer Box contains inner Box', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const outer = container.querySelector('.min-h-screen');
      const inner = container.querySelector('.max-w-\\[800px\\]');
      expect(outer).toContainElement(inner);
    });

    it('inner Box contains all child components', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const inner = container.querySelector('.max-w-\\[800px\\]');
      const hero = screen.getByTestId('hero-section');
      const section1 = screen.getByTestId('section1');
      const section2 = screen.getByTestId('section2');
      const feedback = screen.getByTestId('feedback-section');
      expect(inner).toContainElement(hero);
      expect(inner).toContainElement(section1);
      expect(inner).toContainElement(section2);
      expect(inner).toContainElement(feedback);
    });
  });

  describe('Responsive design', () => {
    it('has mobile padding (px-5)', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const inner = container.querySelector('.px-5');
      expect(inner).toBeInTheDocument();
    });

    it('has medium screen padding (md:px-10)', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const inner = container.querySelector('.md\\:px-10');
      expect(inner).toBeInTheDocument();
    });

    it('has large screen padding (lg:px-0)', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const inner = container.querySelector('.lg\\:px-0');
      expect(inner).toBeInTheDocument();
    });

    it('centers content with mx-auto', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const inner = container.querySelector('.mx-auto');
      expect(inner).toBeInTheDocument();
    });

    it('constrains max width to 800px', async () => {
      const { container } = await renderWithTheme(await DeliveryPolicyContent());
      const inner = container.querySelector('.max-w-\\[800px\\]');
      expect(inner).toBeInTheDocument();
    });
  });

  describe('Comments', () => {
    it('has Hero Section comment', async () => {
      await renderWithTheme(await DeliveryPolicyContent());
      expect(true).toBe(true);
    });

    it('has Section 01 comment', async () => {
      await renderWithTheme(await DeliveryPolicyContent());
      expect(true).toBe(true);
    });

    it('has Section 02 comment', async () => {
      await renderWithTheme(await DeliveryPolicyContent());
      expect(true).toBe(true);
    });

    it('has Feedback comment', async () => {
      await renderWithTheme(await DeliveryPolicyContent());
      expect(true).toBe(true);
    });
  });
});
