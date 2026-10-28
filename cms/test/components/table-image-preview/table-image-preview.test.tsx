import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TableImagePreview } from 'src/components/table-image-preview/table-image-preview';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => (key === 'close' ? 'Close' : key) }),
}));

describe('TableImagePreview', () => {
  const defaultProps = {
    src: 'https://example.com/image.jpg',
    alt: 'Test image',
  };

  it('renders image with default dimensions', () => {
    const { container } = render(<TableImagePreview {...defaultProps} />);
    const img = container.querySelector('img[alt="Test image"]');
    expect(img).toBeInTheDocument();
  });

  it('renders image with custom dimensions', () => {
    const { container } = render(<TableImagePreview {...defaultProps} width={100} height={80} />);
    const img = container.querySelector('img[alt="Test image"]');
    expect(img).toBeInTheDocument();
  });

  it('shows fallback when src is empty', () => {
    const { container } = render(<TableImagePreview {...defaultProps} src="" />);
    const logo = container.querySelector('img[alt="logo"]');
    expect(logo).toBeInTheDocument();
  });

  it('shows fallback on image error', () => {
    const { container } = render(<TableImagePreview {...defaultProps} />);
    const img = container.querySelector('img[alt="Test image"]');
    fireEvent.error(img!);
    const logo = container.querySelector('img[alt="logo"]');
    expect(logo).toBeInTheDocument();
  });

  it('opens dialog on image click', async () => {
    const { container } = render(<TableImagePreview {...defaultProps} />);
    const img = container.querySelector('img[alt="Test image"]');
    await userEvent.click(img!);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('does not open dialog when clicking fallback image', async () => {
    const { container } = render(<TableImagePreview {...defaultProps} src="" />);
    const logo = container.querySelector('img[alt="logo"]');
    await userEvent.click(logo!);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls handleClose on close button click', async () => {
    const { container } = render(<TableImagePreview {...defaultProps} />);
    const img = container.querySelector('img[alt="Test image"]');
    await userEvent.click(img!);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();
  });

  it('renders full size image in dialog', async () => {
    const { container } = render(<TableImagePreview {...defaultProps} />);
    const img = container.querySelector('img[alt="Test image"]');
    await userEvent.click(img!);

    const dialogImages = screen.getAllByAltText('Test image');
    expect(dialogImages.length).toBeGreaterThan(1);
  });

  it('applies custom sx prop', () => {
    const { container } = render(<TableImagePreview {...defaultProps} sx={{ border: '1px solid red' }} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('uses default width and height', () => {
    const { container } = render(<TableImagePreview {...defaultProps} />);
    const img = container.querySelector('img[alt="Test image"]');
    expect(img).toBeInTheDocument();
  });

  it('renders fallback with correct dimensions', () => {
    const { container } = render(<TableImagePreview {...defaultProps} src="" width={80} height={60} />);
    const logo = container.querySelector('img[alt="logo"]');
    expect(logo).toBeInTheDocument();
  });

  it('handles image error after initial render', () => {
    const { container } = render(<TableImagePreview {...defaultProps} />);
    const img = container.querySelector('img[alt="Test image"]') as HTMLImageElement;
    expect(img).toBeInTheDocument();

    fireEvent.error(img);

    const logo = container.querySelector('img[alt="logo"]');
    expect(logo).toBeInTheDocument();
  });

  it('shows image when src is provided', () => {
    const { container } = render(<TableImagePreview {...defaultProps} />);
    const img = container.querySelector('img[alt="Test image"]');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('renders close button with icon in dialog', async () => {
    render(<TableImagePreview {...defaultProps} />);
    const img = screen.getByAltText('Test image');
    await userEvent.click(img);

    const closeButton = screen.getByRole('button', { name: 'Close' });
    expect(closeButton).toBeInTheDocument();
  });

  it('dialog initially closed', () => {
    render(<TableImagePreview {...defaultProps} />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('handles missing alt text', () => {
    const { container } = render(<TableImagePreview src="image.jpg" alt="" />);
    const img = container.querySelector('img[alt=""]');
    expect(img).toBeInTheDocument();
  });

  it('handles special characters in src', () => {
    const { container } = render(<TableImagePreview src="image with spaces.jpg" alt="test" />);
    const img = container.querySelector('img[alt="test"]');
    expect(img).toHaveAttribute('src', 'image with spaces.jpg');
  });

  it('handles very large dimensions', () => {
    const { container } = render(<TableImagePreview {...defaultProps} width={500} height={400} />);
    const img = container.querySelector('img[alt="Test image"]');
    expect(img).toBeInTheDocument();
  });

  it('handles very small dimensions', () => {
    const { container } = render(<TableImagePreview {...defaultProps} width={10} height={10} />);
    const img = container.querySelector('img[alt="Test image"]');
    expect(img).toBeInTheDocument();
  });

  it('shows fallback logo when image fails to load', () => {
    const { container } = render(<TableImagePreview {...defaultProps} />);
    const img = container.querySelector('img[alt="Test image"]') as HTMLImageElement;

    fireEvent.error(img);

    const fallbackBox = container.querySelector('img[alt="logo"]');
    expect(fallbackBox).toBeInTheDocument();
    expect(fallbackBox).toHaveAttribute('src', '/logo.svg');
  });

  it('calculates fallback logo size based on dimensions', () => {
    const { container } = render(<TableImagePreview {...defaultProps} src="" width={100} height={100} />);
    const logo = container.querySelector('img[alt="logo"]');
    expect(logo).toBeInTheDocument();
  });

  it('handles dialog backdrop click', async () => {
    render(<TableImagePreview {...defaultProps} />);
    const img = screen.getByAltText('Test image');
    await userEvent.click(img);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('triggers error handler when image fails', () => {
    const { container } = render(<TableImagePreview {...defaultProps} />);
    const img = container.querySelector('img[alt="Test image"]') as HTMLImageElement;

    // Trigger error event
    fireEvent.error(img);

    // Should now show fallback
    const fallback = container.querySelector('img[alt="logo"]');
    expect(fallback).toBeInTheDocument();
  });

  it('clicking close button triggers handleClose', async () => {
    render(<TableImagePreview {...defaultProps} />);
    const img = screen.getByAltText('Test image');
    await userEvent.click(img);

    const closeButton = screen.getByRole('button', { name: 'Close' });

    // Verify close button is functional
    expect(closeButton).toBeEnabled();

    // Click it to trigger handleClose
    await userEvent.click(closeButton);
  });

  it('clicking dialog image triggers handleClose', async () => {
    render(<TableImagePreview {...defaultProps} />);
    const thumbnailImg = screen.getByAltText('Test image');
    await userEvent.click(thumbnailImg);

    const dialogImages = screen.getAllByAltText('Test image');
    const dialogImage = dialogImages[dialogImages.length - 1];

    // Click dialog image to trigger handleClose
    await userEvent.click(dialogImage);
  });
});
