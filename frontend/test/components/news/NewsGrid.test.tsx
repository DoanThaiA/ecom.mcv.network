import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NewsGrid } from '@/components/news/NewsGrid';
import type { NewsArticle } from '@/types/news';
import { Theme } from '@radix-ui/themes';

// Mock NewsCard component
vi.mock('@/components/news/NewsCard', () => ({
  NewsCard: ({ article, locale, variant }: any) => (
    <div data-testid="news-card" data-locale={locale} data-variant={variant}>
      {article.title}
    </div>
  ),
}));

describe('NewsGrid', () => {
  const mockArticles: NewsArticle[] = [
    {
      id: '1',
      title: 'Article 1',
      slug: 'article-1',
      excerpt: 'Excerpt 1',
      content: 'Content 1',
      coverImage: '/images/1.jpg',
      author: 'Author 1',
      publishedAt: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      views: 100,
      category: 'news',
      tags: ['tag1'],
    },
    {
      id: '2',
      title: 'Article 2',
      slug: 'article-2',
      excerpt: 'Excerpt 2',
      content: 'Content 2',
      coverImage: '/images/2.jpg',
      author: 'Author 2',
      publishedAt: new Date('2024-01-02'),
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-02'),
      views: 200,
      category: 'news',
      tags: ['tag2'],
    },
    {
      id: '3',
      title: 'Article 3',
      slug: 'article-3',
      excerpt: 'Excerpt 3',
      content: 'Content 3',
      coverImage: '/images/3.jpg',
      author: 'Author 3',
      publishedAt: new Date('2024-01-03'),
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-03'),
      views: 300,
      category: 'news',
      tags: ['tag3'],
    },
  ];

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders all articles as NewsCard components', () => {
      renderWithTheme(<NewsGrid articles={mockArticles} />);
      const cards = screen.getAllByTestId('news-card');
      expect(cards).toHaveLength(3);
    });

    it('passes correct article data to NewsCard', () => {
      renderWithTheme(<NewsGrid articles={mockArticles} />);
      expect(screen.getByText('Article 1')).toBeInTheDocument();
      expect(screen.getByText('Article 2')).toBeInTheDocument();
      expect(screen.getByText('Article 3')).toBeInTheDocument();
    });

    it('renders with empty articles array', () => {
      const { container } = renderWithTheme(<NewsGrid articles={[]} />);
      const cards = screen.queryAllByTestId('news-card');
      expect(cards).toHaveLength(0);
    });
  });

  describe('Locale prop', () => {
    it('uses default locale "vi" when locale prop not provided', () => {
      renderWithTheme(<NewsGrid articles={mockArticles} />);
      const cards = screen.getAllByTestId('news-card');
      cards.forEach((card) => {
        expect(card).toHaveAttribute('data-locale', 'vi');
      });
    });

    it('passes custom locale to NewsCard', () => {
      renderWithTheme(<NewsGrid articles={mockArticles} locale="en" />);
      const cards = screen.getAllByTestId('news-card');
      cards.forEach((card) => {
        expect(card).toHaveAttribute('data-locale', 'en');
      });
    });
  });

  describe('Variant prop', () => {
    it('always passes variant="small" to NewsCard', () => {
      renderWithTheme(<NewsGrid articles={mockArticles} />);
      const cards = screen.getAllByTestId('news-card');
      cards.forEach((card) => {
        expect(card).toHaveAttribute('data-variant', 'small');
      });
    });
  });

  describe('Column layout', () => {
    it('applies 3 columns layout by default', () => {
      const { container } = renderWithTheme(<NewsGrid articles={mockArticles} />);
      const grid = container.querySelector('.sm\\:grid-cols-2.lg\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('applies 2 columns layout when columns=2', () => {
      const { container } = renderWithTheme(<NewsGrid articles={mockArticles} columns={2} />);
      const grid = container.querySelector('.sm\\:grid-cols-2');
      expect(grid).toBeInTheDocument();
      // Should not have lg:grid-cols-3 or lg:grid-cols-4
      const lgGrid3 = container.querySelector('.lg\\:grid-cols-3');
      const lgGrid4 = container.querySelector('.lg\\:grid-cols-4');
      expect(lgGrid3).not.toBeInTheDocument();
      expect(lgGrid4).not.toBeInTheDocument();
    });

    it('applies 3 columns layout when columns=3', () => {
      const { container } = renderWithTheme(<NewsGrid articles={mockArticles} columns={3} />);
      const grid = container.querySelector('.sm\\:grid-cols-2.lg\\:grid-cols-3');
      expect(grid).toBeInTheDocument();
    });

    it('applies 4 columns layout when columns=4', () => {
      const { container } = renderWithTheme(<NewsGrid articles={mockArticles} columns={4} />);
      const grid = container.querySelector('.sm\\:grid-cols-2.lg\\:grid-cols-4');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Grid classes', () => {
    it('applies grid display', () => {
      const { container } = renderWithTheme(<NewsGrid articles={mockArticles} />);
      const grid = container.querySelector('.grid');
      expect(grid).toBeInTheDocument();
    });

    it('applies grid-cols-1 for mobile', () => {
      const { container } = renderWithTheme(<NewsGrid articles={mockArticles} />);
      const grid = container.querySelector('.grid-cols-1');
      expect(grid).toBeInTheDocument();
    });

    it('applies gap-4 for mobile', () => {
      const { container } = renderWithTheme(<NewsGrid articles={mockArticles} />);
      const grid = container.querySelector('.gap-4');
      expect(grid).toBeInTheDocument();
    });

    it('applies sm:gap-6 for larger screens', () => {
      const { container } = renderWithTheme(<NewsGrid articles={mockArticles} />);
      const grid = container.querySelector('.sm\\:gap-6');
      expect(grid).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles single article', () => {
      renderWithTheme(<NewsGrid articles={[mockArticles[0]]} />);
      const cards = screen.getAllByTestId('news-card');
      expect(cards).toHaveLength(1);
    });

    it('handles many articles', () => {
      const manyArticles = Array.from({ length: 10 }, (_, i) => ({
        ...mockArticles[0],
        id: String(i + 1),
        title: `Article ${i + 1}`,
      }));
      renderWithTheme(<NewsGrid articles={manyArticles} />);
      const cards = screen.getAllByTestId('news-card');
      expect(cards).toHaveLength(10);
    });
  });
});
