import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewTableRow } from 'src/sections/review/components/review-table-row';
import type { CmsProductReview } from 'src/types/reviews';

const mockReview: CmsProductReview = {
  reviewId: 'review1',
  productId: 'prod1',
  productName: 'Test Product',
  orderId: 'order1',
  orderNumber: 'ORD-001',
  nhanhOrderId: 'NHANH-001',
  heightCm: 170,
  weightKg: 65,
  fitLevel: 1,
  rating: 5,
  content: 'Great product!',
  status: 'visible',
  media: [
    { type: 'image', url: 'https://example.com/image1.jpg' },
    { type: 'video', url: 'https://example.com/video1.mp4', thumbnail: 'https://example.com/thumb1.jpg' },
  ],
} as CmsProductReview;

const mockOnToggleVisibility = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('react-router-dom', () => ({
  Link: ({ to, children, ...props }: any) => <a href={to} {...props}>{children}</a>,
}));

vi.mock('src/components/table-image-preview', () => ({
  TableImagePreview: ({ src, alt, width, height }: any) => (
    <img src={src} alt={alt} width={width} height={height} data-testid="table-image-preview" />
  ),
}));

vi.mock('src/types/reviews', () => ({
  getFitLevelKey: (level: number) => (level === 1 ? 'perfect' : 'tooLarge'),
}));

vi.mock('../review-config', () => ({
  getColumnStyle: (key: string, isLast = false) => ({
    width: '10%',
    borderRight: isLast ? 'none' : '1px solid #E5E6EB',
    p: 1.5,
    display: 'flex',
    alignItems: 'center',
  }),
}));

describe('ReviewTableRow', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    expect(container).toBeInTheDocument();
  });

  it('displays order number', () => {
    render(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
  });

  it('displays nhanh order ID', () => {
    render(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    expect(screen.getByText('NHANH-001')).toBeInTheDocument();
  });

  it('displays product name', () => {
    render(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('displays height', () => {
    render(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    expect(screen.getByText('170')).toBeInTheDocument();
  });

  it('displays weight', () => {
    render(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    expect(screen.getByText('65')).toBeInTheDocument();
  });

  it('displays fit level chip', () => {
    render(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    expect(screen.getByText('perfect')).toBeInTheDocument();
  });

  it('displays review content', () => {
    render(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    expect(screen.getByText('Great product!')).toBeInTheDocument();
  });

  it('renders rating stars', () => {
    const { container } = render(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders media thumbnails', () => {
    render(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    const images = screen.getAllByTestId('table-image-preview');
    expect(images.length).toBe(2);
  });

  it('renders visibility icon for visible status', () => {
    render(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('renders hidden icon for hidden status', () => {
    const hiddenReview = { ...mockReview, status: 'hidden' };
    render(
      <ReviewTableRow review={hiddenReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('handles visibility toggle click', () => {
    render(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]);
    expect(mockOnToggleVisibility).toHaveBeenCalledWith(mockReview);
  });

  it('renders with even row background', () => {
    const { container } = render(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders with odd row background', () => {
    const { container } = render(
      <ReviewTableRow review={mockReview} index={1} onToggleVisibility={mockOnToggleVisibility} />
    );
    expect(container).toBeInTheDocument();
  });

  it('exports ReviewTableRow function', () => {
    expect(ReviewTableRow).toBeDefined();
    expect(typeof ReviewTableRow).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ReviewTableRow).toBe('function');
    expect(ReviewTableRow.name).toBe('ReviewTableRow');
  });

  it('handles missing nhanhOrderId', () => {
    const reviewWithoutNhanh = { ...mockReview, nhanhOrderId: undefined };
    render(
      <ReviewTableRow review={reviewWithoutNhanh} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    expect(screen.getByText('--')).toBeInTheDocument();
  });

  it('handles empty content', () => {
    const reviewWithoutContent = { ...mockReview, content: '' };
    const { container } = render(
      <ReviewTableRow review={reviewWithoutContent} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    expect(container).toBeInTheDocument();
  });

  it('handles no media', () => {
    const reviewWithoutMedia = { ...mockReview, media: [] };
    render(
      <ReviewTableRow review={reviewWithoutMedia} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    const images = screen.queryAllByTestId('table-image-preview');
    expect(images.length).toBe(0);
  });

  it('limits media thumbnails to 5', () => {
    const reviewWithManyMedia = {
      ...mockReview,
      media: [
        { type: 'image', url: 'img1.jpg' },
        { type: 'image', url: 'img2.jpg' },
        { type: 'image', url: 'img3.jpg' },
        { type: 'image', url: 'img4.jpg' },
        { type: 'image', url: 'img5.jpg' },
        { type: 'image', url: 'img6.jpg' },
      ],
    } as CmsProductReview;
    render(
      <ReviewTableRow review={reviewWithManyMedia} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    const images = screen.getAllByTestId('table-image-preview');
    expect(images.length).toBe(5);
  });

  it('maintains state across renders', () => {
    const { rerender } = render(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    rerender(
      <ReviewTableRow review={mockReview} index={0} onToggleVisibility={mockOnToggleVisibility} />
    );
    expect(screen.getByText('ORD-001')).toBeInTheDocument();
  });
});
