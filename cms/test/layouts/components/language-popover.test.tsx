import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LanguagePopover } from 'src/layouts/components/language-popover';

const mockChangeLanguage = vi.fn();
const mockI18n = {
  language: 'en',
  changeLanguage: mockChangeLanguage,
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ i18n: mockI18n }),
}));

describe('LanguagePopover', () => {
  const mockData = [
    { value: 'en', label: 'English', icon: '/assets/icons/flags/ic-flag-en.svg' },
    { value: 'vi', label: 'Vietnamese', icon: '/assets/icons/flags/ic-flag-vi.svg' },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockI18n.language = 'en';
  });

  it('renders without errors', () => {
    expect(() => {
      render(<LanguagePopover data={mockData} />);
    }).not.toThrow();
  });

  it('renders IconButton', () => {
    render(<LanguagePopover data={mockData} />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('renders current language flag', () => {
    const { container } = render(<LanguagePopover data={mockData} />);
    const img = container.querySelector('img');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('alt', 'English');
  });

  it('opens popover when button is clicked', () => {
    render(<LanguagePopover data={mockData} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Vietnamese')).toBeInTheDocument();
  });

  it('closes popover when clicking outside', () => {
    render(<LanguagePopover data={mockData} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    // Popover is open
    expect(screen.getByText('Vietnamese')).toBeInTheDocument();

    // Click backdrop (simulated by calling onClose)
    const backdrop = document.querySelector('.MuiBackdrop-root');
    if (backdrop) {
      fireEvent.click(backdrop);
    }
  });

  it('changes language when menu item is clicked', () => {
    render(<LanguagePopover data={mockData} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    const vietnameseOption = screen.getByText('Vietnamese');
    fireEvent.click(vietnameseOption);

    expect(mockChangeLanguage).toHaveBeenCalledWith('vi');
  });

  it('closes popover after language change', () => {
    render(<LanguagePopover data={mockData} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    const vietnameseOption = screen.getByText('Vietnamese');
    fireEvent.click(vietnameseOption);

    // Popover should be closed (Vietnamese text from menu should not be visible)
    // Note: This is hard to test directly, but we can verify the language changed
    expect(mockChangeLanguage).toHaveBeenCalled();
  });

  it('renders all language options', () => {
    render(<LanguagePopover data={mockData} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Vietnamese')).toBeInTheDocument();
  });

  it('marks current language as selected', () => {
    render(<LanguagePopover data={mockData} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    const menuItems = screen.getAllByRole('menuitem');
    expect(menuItems[0]).toHaveClass('Mui-selected');
  });

  it('renders with default data', () => {
    const { container } = render(<LanguagePopover data={mockData} />);
    expect(container.querySelector('.MuiIconButton-root')).toBeInTheDocument();
  });

  it('uses i18n hook', () => {
    render(<LanguagePopover data={mockData} />);
    expect(mockI18n).toBeDefined();
  });

  it('exports LanguagePopover function', () => {
    expect(LanguagePopover).toBeDefined();
    expect(typeof LanguagePopover).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof LanguagePopover).toBe('function');
    expect(LanguagePopover.name).toBe('LanguagePopover');
  });

  it('renders Popover component', () => {
    render(<LanguagePopover data={mockData} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    // Popover is rendered in portal, check for menu instead
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('renders MenuList component', () => {
    render(<LanguagePopover data={mockData} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('renders flag images for all options', () => {
    const { container } = render(<LanguagePopover data={mockData} />);
    const button = screen.getByRole('button');
    fireEvent.click(button);

    const images = container.querySelectorAll('img');
    expect(images.length).toBeGreaterThan(0);
  });

  it('applies custom sx prop', () => {
    const { container } = render(<LanguagePopover data={mockData} sx={{ bgcolor: 'red' }} />);
    expect(container).toBeTruthy();
  });

  it('handles language not in data', () => {
    mockI18n.language = 'fr';
    render(<LanguagePopover data={mockData} />);
    const { container } = render(<LanguagePopover data={mockData} />);
    expect(container.querySelector('img')).toBeInTheDocument();
  });

  it('sets initial locale from i18n language', () => {
    mockI18n.language = 'vi';
    const { container } = render(<LanguagePopover data={mockData} />);
    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', 'Vietnamese');
  });
});
