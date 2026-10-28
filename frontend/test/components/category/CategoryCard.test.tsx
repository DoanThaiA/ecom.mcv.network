import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryCard } from '@/components/category/CategoryCard';
import type { ProductCategory } from '@/types/gen/shared/shared/product-categories/product-category';

describe('CategoryCard', () => {
  const mockCategory: ProductCategory = {
    id: 'cat-1',
    name: 'T-Shirts',
    image: 'https://example.com/tshirts.jpg',
    description: 'Comfortable t-shirts',
    slug: 't-shirts',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  };

  it('renders category name', () => {
    render(<CategoryCard category={mockCategory} />);

    expect(screen.getByText('T-Shirts')).toBeInTheDocument();
  });

  it('renders category image', () => {
    render(<CategoryCard category={mockCategory} />);

    const images = screen.getAllByRole('img', { name: 'T-Shirts' });
    const categoryImage = images.find(
      (img) =>
        decodeURIComponent(img.getAttribute('src') ?? '').includes(
          'tshirts.jpg'
        )
    );
    expect(categoryImage).toBeInTheDocument();
  });

  it('renders link with SEO-friendly href for default locale', () => {
    render(<CategoryCard category={mockCategory} />);

    const link = screen.getByRole('link');
    // Uses slug-id format for SEO
    expect(link).toHaveAttribute('href', '/vi/category/t-shirts-cat-1');
  });

  it('renders link with SEO-friendly href for custom locale', () => {
    render(<CategoryCard category={mockCategory} locale="en" />);

    const link = screen.getByRole('link');
    // Uses slug-id format for SEO
    expect(link).toHaveAttribute('href', '/en/category/t-shirts-cat-1');
  });

  it('displays fallback image when category has no image', () => {
    const categoryWithoutImage: ProductCategory = {
      ...mockCategory,
      image: undefined,
    };

    render(<CategoryCard category={categoryWithoutImage} />);

    const images = screen.getAllByRole('img');
    const fallbackImage = images.find((img) =>
      img.getAttribute('src')?.includes('logo.webp')
    );
    expect(fallbackImage).toBeInTheDocument();
  });

  it('displays fallback image on image load error', () => {
    render(<CategoryCard category={mockCategory} />);

    const images = screen.getAllByRole('img', { name: 'T-Shirts' });
    const categoryImage = images.find(
      (img) =>
        decodeURIComponent(img.getAttribute('src') ?? '').includes(
          'tshirts.jpg'
        )
    );

    // Trigger image error
    if (categoryImage) {
      fireEvent.error(categoryImage);
    }

    // After error, fallback image should be shown
    const fallbackImages = screen.getAllByRole('img');
    const fallbackImage = fallbackImages.find((img) =>
      img.getAttribute('src')?.includes('logo.webp')
    );
    expect(fallbackImage).toBeInTheDocument();
  });

  it('renders with aspect ratio container', () => {
    const { container } = render(<CategoryCard category={mockCategory} />);

    const imageContainer = container.querySelector('.aspect-\\[3\\/4\\]');
    expect(imageContainer).toBeInTheDocument();
  });

  it('renders category name centered', () => {
    render(<CategoryCard category={mockCategory} />);

    const nameElement = screen.getByText('T-Shirts');
    expect(nameElement).toHaveClass('text-center');
  });

  it('renders as clickable link', () => {
    const { container } = render(<CategoryCard category={mockCategory} />);

    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();

    // Check that Box inside has cursor-pointer
    const clickableBox = container.querySelector('.cursor-pointer');
    expect(clickableBox).toBeInTheDocument();
  });

  it('handles empty category name', () => {
    const categoryWithEmptyName: ProductCategory = {
      ...mockCategory,
      name: '',
    };

    render(<CategoryCard category={categoryWithEmptyName} />);

    // Component should still render even with empty name
    const link = screen.getByRole('link');
    expect(link).toBeInTheDocument();
  });

  it('handles long category names', () => {
    const categoryWithLongName: ProductCategory = {
      ...mockCategory,
      name: 'Very Long Category Name That Should Still Display Correctly',
    };

    render(<CategoryCard category={categoryWithLongName} />);

    expect(
      screen.getByText(
        'Very Long Category Name That Should Still Display Correctly'
      )
    ).toBeInTheDocument();
  });

  it('uses category slug and id in link href', () => {
    const customCategory: ProductCategory = {
      ...mockCategory,
      id: 'custom-id-123',
      slug: 'custom-slug',
    };

    render(<CategoryCard category={customCategory} />);

    const link = screen.getByRole('link');
    // Uses slug-id format for SEO
    expect(link).toHaveAttribute('href', '/vi/category/custom-slug-custom-id-123');
  });

  it('falls back to id-only format when no slug', () => {
    const categoryNoSlug: ProductCategory = {
      ...mockCategory,
      id: 'no-slug-id',
      slug: undefined,
    };

    render(<CategoryCard category={categoryNoSlug} />);

    const link = screen.getByRole('link');
    // Falls back to ID only when no slug
    expect(link).toHaveAttribute('href', '/vi/category/no-slug-id');
  });

  it('renders with rounded corners on image container', () => {
    const { container } = render(<CategoryCard category={mockCategory} />);

    const imageContainer = container.querySelector('.rounded-lg');
    expect(imageContainer).toBeInTheDocument();
  });
});
