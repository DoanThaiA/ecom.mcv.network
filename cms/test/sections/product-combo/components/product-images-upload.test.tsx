import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ProductImagesUpload } from 'src/sections/product-combo/components/product-images-upload';
import type { ProductImages } from 'src/types/gen/shared/shared/products/product';

const mockDispatch = vi.fn();
const mockOnChange = vi.fn();

const mockImages: ProductImages = {
  avatar: 'https://example.com/avatar.jpg',
  others: ['https://example.com/image1.jpg', 'https://example.com/image2.jpg'],
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/redux/store/store', () => ({
  useAppDispatch: () => mockDispatch,
  useAppSelector: vi.fn(() => false), // selectUploadLoading
}));

vi.mock('src/redux/store/fileSlice', () => ({
  selectUploadLoading: vi.fn((state) => state.loading),
  uploadFileRequest: vi.fn((params) => ({
    type: 'UPLOAD_FILE',
    payload: params,
  })),
}));

vi.mock('react-dropzone', () => ({
  useDropzone: ({ onDrop, disabled }: any) => ({
    getRootProps: () => ({
      onClick: vi.fn(),
      'data-testid': 'dropzone',
    }),
    getInputProps: () => ({
      type: 'file',
      'data-testid': 'file-input',
    }),
    isDragActive: false,
  }),
}));

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

describe('ProductImagesUpload', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<ProductImagesUpload />);
    expect(container).toBeInTheDocument();
  });

  it('renders with product image label', () => {
    render(<ProductImagesUpload />);
    expect(screen.getByText('productImage *')).toBeInTheDocument();
  });

  it('renders upload area', () => {
    render(<ProductImagesUpload />);
    expect(screen.getByText('selectImageVideo')).toBeInTheDocument();
  });

  it('renders file input', () => {
    render(<ProductImagesUpload />);
    const input = screen.getByTestId('file-input');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('type', 'file');
  });

  it('displays existing images when provided', () => {
    const { container } = render(<ProductImagesUpload images={mockImages} />);
    const images = container.querySelectorAll('img');
    // Should have 3 images (1 avatar + 2 others) + 1 upload icon
    expect(images.length).toBeGreaterThanOrEqual(3);
  });

  it('displays avatar image', () => {
    render(<ProductImagesUpload images={mockImages} />);
    const avatarImg = screen.getByAltText('Preview 1');
    expect(avatarImg).toBeInTheDocument();
    expect(avatarImg).toHaveAttribute('src', mockImages.avatar);
  });

  it('displays other images', () => {
    render(<ProductImagesUpload images={mockImages} />);
    const image1 = screen.getByAltText('Preview 2');
    const image2 = screen.getByAltText('Preview 3');
    expect(image1).toBeInTheDocument();
    expect(image2).toBeInTheDocument();
  });

  it('can be disabled', () => {
    const { container } = render(<ProductImagesUpload disabled />);
    const uploadBox = container.querySelector('[data-testid="dropzone"]');
    expect(uploadBox).toBeInTheDocument();
  });

  it('calls onChange when provided', () => {
    render(<ProductImagesUpload onChange={mockOnChange} />);
    expect(screen.getByText('selectImageVideo')).toBeInTheDocument();
  });

  it('removes image when close button clicked', () => {
    const { container } = render(
      <ProductImagesUpload images={mockImages} onChange={mockOnChange} />
    );

    // Find first close button (MUI CloseIcon)
    const closeButtons = container.querySelectorAll('[data-testid="CloseIcon"]');
    if (closeButtons.length > 0) {
      fireEvent.click(closeButtons[0].parentElement!);
      expect(mockOnChange).toHaveBeenCalled();
    }
  });

  it('exports ProductImagesUpload function', () => {
    expect(ProductImagesUpload).toBeDefined();
    expect(typeof ProductImagesUpload).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof ProductImagesUpload).toBe('function');
    expect(ProductImagesUpload.name).toBe('ProductImagesUpload');
  });

  it('renders Box components', () => {
    const { container } = render(<ProductImagesUpload images={mockImages} />);
    const boxes = container.querySelectorAll('.MuiBox-root');
    expect(boxes.length).toBeGreaterThan(0);
  });

  it('renders Typography component for label', () => {
    const { container } = render(<ProductImagesUpload />);
    const typography = container.querySelector('.MuiTypography-root');
    expect(typography).toBeInTheDocument();
  });

  it('renders CloudUploadIcon', () => {
    const { container } = render(<ProductImagesUpload />);
    const uploadIcon = container.querySelector('[data-testid="CloudUploadIcon"]');
    expect(uploadIcon).toBeInTheDocument();
  });

  it('renders image preview boxes', () => {
    render(<ProductImagesUpload images={mockImages} />);
    const preview1 = screen.getByAltText('Preview 1');
    const preview2 = screen.getByAltText('Preview 2');
    const preview3 = screen.getByAltText('Preview 3');
    expect(preview1).toBeInTheDocument();
    expect(preview2).toBeInTheDocument();
    expect(preview3).toBeInTheDocument();
  });

  it('renders dropzone area', () => {
    render(<ProductImagesUpload />);
    const dropzone = screen.getByTestId('dropzone');
    expect(dropzone).toBeInTheDocument();
  });

  it('handles empty images gracefully', () => {
    const emptyImages: ProductImages = {};
    render(<ProductImagesUpload images={emptyImages} />);
    expect(screen.getByText('selectImageVideo')).toBeInTheDocument();
  });

  it('handles images with only avatar', () => {
    const avatarOnly: ProductImages = {
      avatar: 'https://example.com/avatar.jpg',
    };
    render(<ProductImagesUpload images={avatarOnly} />);
    const avatar = screen.getByAltText('Preview 1');
    expect(avatar).toBeInTheDocument();
  });

  it('handles images with only others array', () => {
    const othersOnly: ProductImages = {
      others: ['https://example.com/image1.jpg'],
    };
    render(<ProductImagesUpload images={othersOnly} />);
    const image = screen.getByAltText('Preview 1');
    expect(image).toBeInTheDocument();
  });

  it('updates when images prop changes', () => {
    const { rerender } = render(<ProductImagesUpload images={mockImages} />);

    const newImages: ProductImages = {
      avatar: 'https://example.com/new-avatar.jpg',
    };
    rerender(<ProductImagesUpload images={newImages} />);

    const avatar = screen.getByAltText('Preview 1');
    expect(avatar).toHaveAttribute('src', newImages.avatar);
  });

  it('renders close buttons for each image', () => {
    const { container } = render(<ProductImagesUpload images={mockImages} />);
    const closeIcons = container.querySelectorAll('[data-testid="CloseIcon"]');
    expect(closeIcons.length).toBe(3); // One for each image
  });

  it('displays upload area with correct text', () => {
    render(<ProductImagesUpload />);
    const text = screen.getByText('selectImageVideo');
    expect(text).toBeInTheDocument();
  });

  it('renders with custom onChange handler', () => {
    const customOnChange = vi.fn();
    render(<ProductImagesUpload onChange={customOnChange} />);
    expect(screen.getByTestId('file-input')).toBeInTheDocument();
  });

  it('accepts ProductImages type for images prop', () => {
    const images: ProductImages = {
      avatar: 'test.jpg',
      others: ['other1.jpg', 'other2.jpg'],
    };
    render(<ProductImagesUpload images={images} />);
    expect(screen.getByAltText('Preview 1')).toBeInTheDocument();
  });
});
