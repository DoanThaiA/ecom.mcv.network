import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { TermsContent } from '@/components/policy/terms/TermsContent';
import { Theme } from '@radix-ui/themes';

// Mock child components
vi.mock('@/components/policy/terms/HeroSection', () => ({
  HeroSection: () => <div data-testid="hero-section">Hero Section</div>,
}));

vi.mock('@/components/policy/terms/Section1', () => ({
  Section1: () => <div data-testid="section-1">Section 1</div>,
}));

vi.mock('@/components/policy/terms/Section2', () => ({
  Section2: () => <div data-testid="section-2">Section 2</div>,
}));

vi.mock('@/components/policy/terms/Section3', () => ({
  Section3: () => <div data-testid="section-3">Section 3</div>,
}));

vi.mock('@/components/policy/terms/Section4', () => ({
  Section4: () => <div data-testid="section-4">Section 4</div>,
}));

vi.mock('@/components/policy/terms/Section5', () => ({
  Section5: () => <div data-testid="section-5">Section 5</div>,
}));

vi.mock('@/components/policy/terms/Section6', () => ({
  Section6: () => <div data-testid="section-6">Section 6</div>,
}));

vi.mock('@/components/common/FeedbackSection', () => ({
  FeedbackSection: () => <div data-testid="feedback-section">Feedback Section</div>,
}));

describe('TermsContent', () => {
  const renderWithTheme = async (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Component rendering', () => {
    it('renders without crashing', async () => {
      const { container } = await renderWithTheme(await TermsContent());
      expect(container).toBeInTheDocument();
    });

    it('renders HeroSection', async () => {
      const { getByTestId } = await renderWithTheme(await TermsContent());
      expect(getByTestId('hero-section')).toBeInTheDocument();
    });

    it('renders Section1', async () => {
      const { getByTestId } = await renderWithTheme(await TermsContent());
      expect(getByTestId('section-1')).toBeInTheDocument();
    });

    it('renders Section2', async () => {
      const { getByTestId } = await renderWithTheme(await TermsContent());
      expect(getByTestId('section-2')).toBeInTheDocument();
    });

    it('renders Section3', async () => {
      const { getByTestId } = await renderWithTheme(await TermsContent());
      expect(getByTestId('section-3')).toBeInTheDocument();
    });

    it('renders Section4', async () => {
      const { getByTestId } = await renderWithTheme(await TermsContent());
      expect(getByTestId('section-4')).toBeInTheDocument();
    });

    it('renders Section5', async () => {
      const { getByTestId } = await renderWithTheme(await TermsContent());
      expect(getByTestId('section-5')).toBeInTheDocument();
    });

    it('renders Section6', async () => {
      const { getByTestId } = await renderWithTheme(await TermsContent());
      expect(getByTestId('section-6')).toBeInTheDocument();
    });

    it('renders FeedbackSection', async () => {
      const { getByTestId } = await renderWithTheme(await TermsContent());
      expect(getByTestId('feedback-section')).toBeInTheDocument();
    });
  });

  describe('Layout structure', () => {
    it('applies min-h-screen to outer container', async () => {
      const { container } = await renderWithTheme(await TermsContent());
      const outerBox = container.querySelector('.min-h-screen');
      expect(outerBox).toBeInTheDocument();
    });

    it('applies bg-white to outer container', async () => {
      const { container } = await renderWithTheme(await TermsContent());
      const outerBox = container.querySelector('.bg-white');
      expect(outerBox).toBeInTheDocument();
    });

    it('applies overflow-x-hidden to outer container', async () => {
      const { container } = await renderWithTheme(await TermsContent());
      const outerBox = container.querySelector('.overflow-x-hidden');
      expect(outerBox).toBeInTheDocument();
    });

    it('applies max-w-[800px] to inner container', async () => {
      const { container } = await renderWithTheme(await TermsContent());
      const innerBox = container.querySelector('.max-w-\\[800px\\]');
      expect(innerBox).toBeInTheDocument();
    });

    it('applies mx-auto to inner container', async () => {
      const { container } = await renderWithTheme(await TermsContent());
      const innerBox = container.querySelector('.mx-auto');
      expect(innerBox).toBeInTheDocument();
    });

    it('applies px-5 to inner container', async () => {
      const { container } = await renderWithTheme(await TermsContent());
      const innerBox = container.querySelector('.px-5');
      expect(innerBox).toBeInTheDocument();
    });

    it('applies md:px-10 to inner container', async () => {
      const { container } = await renderWithTheme(await TermsContent());
      const innerBox = container.querySelector('.md\\:px-10');
      expect(innerBox).toBeInTheDocument();
    });

    it('applies lg:px-0 to inner container', async () => {
      const { container } = await renderWithTheme(await TermsContent());
      const innerBox = container.querySelector('.lg\\:px-0');
      expect(innerBox).toBeInTheDocument();
    });
  });

  describe('Component order', () => {
    it('renders sections in correct order', async () => {
      const { container } = await renderWithTheme(await TermsContent());
      const sections = container.querySelectorAll('[data-testid]');
      expect(sections[0]).toHaveAttribute('data-testid', 'hero-section');
      expect(sections[1]).toHaveAttribute('data-testid', 'section-1');
      expect(sections[2]).toHaveAttribute('data-testid', 'section-2');
      expect(sections[3]).toHaveAttribute('data-testid', 'section-3');
      expect(sections[4]).toHaveAttribute('data-testid', 'section-4');
      expect(sections[5]).toHaveAttribute('data-testid', 'section-5');
      expect(sections[6]).toHaveAttribute('data-testid', 'section-6');
      expect(sections[7]).toHaveAttribute('data-testid', 'feedback-section');
    });

    it('renders all 8 child components', async () => {
      const { container } = await renderWithTheme(await TermsContent());
      const sections = container.querySelectorAll('[data-testid]');
      expect(sections.length).toBe(8);
    });
  });

  describe('Async function', () => {
    it('is an async function', () => {
      expect(TermsContent.constructor.name).toBe('AsyncFunction');
    });

    it('returns a Promise', () => {
      const result = TermsContent();
      expect(result).toBeInstanceOf(Promise);
    });
  });
});
