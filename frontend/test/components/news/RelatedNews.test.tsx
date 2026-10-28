import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RelatedNews } from '@/components/news/RelatedNews';
import type { NewsArticle } from '@/types/news';
import { Theme } from '@radix-ui/themes';

// Mock NewsGrid component
vi.mock('@/components/news/NewsGrid', () => ({
  NewsGrid: ({ articles, locale, columns }: any) => (
    <div data-testid="news-grid" data-locale={locale} data-columns={columns}>
      {articles.map((article: NewsArticle) => (
        <div key={article.id} data-testid="news-article">
          {article.title}
        </div>
      ))}
    </div>
  ),
}));

describe('RelatedNews', () => {
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
  ];

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  it('renders default title when title prop is not provided', () => {
    renderWithTheme(<RelatedNews articles={mockArticles} />);
    expect(screen.getByText('BÀI VIẾT LIÊN QUAN')).toBeInTheDocument();
  });

  it('renders custom title when title prop is provided', () => {
    renderWithTheme(
      <RelatedNews articles={mockArticles} title="Related Articles" />
    );
    expect(screen.getByText('Related Articles')).toBeInTheDocument();
  });

  it('renders NewsGrid component with articles', () => {
    renderWithTheme(<RelatedNews articles={mockArticles} />);
    expect(screen.getByTestId('news-grid')).toBeInTheDocument();
  });

  it('passes articles to NewsGrid', () => {
    renderWithTheme(<RelatedNews articles={mockArticles} />);
    const articles = screen.getAllByTestId('news-article');
    expect(articles).toHaveLength(2);
  });

  it('passes default locale to NewsGrid', () => {
    renderWithTheme(<RelatedNews articles={mockArticles} />);
    const newsGrid = screen.getByTestId('news-grid');
    expect(newsGrid).toHaveAttribute('data-locale', 'vi');
  });

  it('passes custom locale to NewsGrid', () => {
    renderWithTheme(<RelatedNews articles={mockArticles} locale="en" />);
    const newsGrid = screen.getByTestId('news-grid');
    expect(newsGrid).toHaveAttribute('data-locale', 'en');
  });

  it('passes columns=3 to NewsGrid', () => {
    renderWithTheme(<RelatedNews articles={mockArticles} />);
    const newsGrid = screen.getByTestId('news-grid');
    expect(newsGrid).toHaveAttribute('data-columns', '3');
  });

  it('returns null when articles array is empty', () => {
    const { container } = renderWithTheme(<RelatedNews articles={[]} />);
    expect(container.firstChild).toBeEmptyDOMElement();
  });

  it('renders with single article', () => {
    renderWithTheme(<RelatedNews articles={[mockArticles[0]]} />);
    const articles = screen.getAllByTestId('news-article');
    expect(articles).toHaveLength(1);
  });

  it('renders with multiple articles', () => {
    const manyArticles = Array.from({ length: 6 }, (_, index) => ({
      ...mockArticles[index % mockArticles.length],
      id: `${index + 1}`,
    }));
    renderWithTheme(<RelatedNews articles={manyArticles} />);
    const articles = screen.getAllByTestId('news-article');
    expect(articles).toHaveLength(6);
  });

  it('applies correct margin top class', () => {
    const { container } = renderWithTheme(<RelatedNews articles={mockArticles} />);
    const box = container.querySelector('.mt-10');
    expect(box).toBeInTheDocument();
  });

  it('applies responsive margin top class', () => {
    const { container } = renderWithTheme(<RelatedNews articles={mockArticles} />);
    const box = container.querySelector('.sm\\:mt-14');
    expect(box).toBeInTheDocument();
  });

  it('applies correct font size to title', () => {
    const { container } = renderWithTheme(<RelatedNews articles={mockArticles} />);
    const title = container.querySelector('.text-lg');
    expect(title).toBeInTheDocument();
  });

  it('applies responsive font size to title', () => {
    const { container } = renderWithTheme(<RelatedNews articles={mockArticles} />);
    const title = container.querySelector('.sm\\:text-xl');
    expect(title).toBeInTheDocument();
  });

  it('applies bold font weight to title', () => {
    const { container } = renderWithTheme(<RelatedNews articles={mockArticles} />);
    const title = container.querySelector('.font-bold');
    expect(title).toBeInTheDocument();
  });

  it('applies black text color to title', () => {
    const { container } = renderWithTheme(<RelatedNews articles={mockArticles} />);
    const title = container.querySelector('.text-black');
    expect(title).toBeInTheDocument();
  });

  it('applies correct margin bottom to title', () => {
    const { container } = renderWithTheme(<RelatedNews articles={mockArticles} />);
    const title = container.querySelector('.mb-6');
    expect(title).toBeInTheDocument();
  });

  it('applies responsive margin bottom to title', () => {
    const { container } = renderWithTheme(<RelatedNews articles={mockArticles} />);
    const title = container.querySelector('.sm\\:mb-8');
    expect(title).toBeInTheDocument();
  });
});
