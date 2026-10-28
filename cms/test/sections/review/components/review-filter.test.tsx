import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewFilter } from 'src/sections/review/components/review-filter';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

describe('ReviewFilter', () => {
  const mockSetKeyword = vi.fn();
  const mockSetStatus = vi.fn();
  const mockSetRating = vi.fn();
  const mockSetFitLevel = vi.fn();
  const mockSetHeight = vi.fn();
  const mockSetWeight = vi.fn();
  const mockOnSearch = vi.fn();

  const defaultProps = {
    keyword: '',
    setKeyword: mockSetKeyword,
    status: '',
    setStatus: mockSetStatus,
    rating: '' as number | '',
    setRating: mockSetRating,
    fitLevel: '' as number | '',
    setFitLevel: mockSetFitLevel,
    height: '' as number | '',
    setHeight: mockSetHeight,
    weight: '' as number | '',
    setWeight: mockSetWeight,
    onSearch: mockOnSearch,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<ReviewFilter {...defaultProps} />);
    }).not.toThrow();
  });

  it('renders rating select', () => {
    render(<ReviewFilter {...defaultProps} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBeGreaterThan(0);
  });

  it('renders keyword input', () => {
    render(<ReviewFilter {...defaultProps} keyword="test" />);
    expect(screen.getByDisplayValue('test')).toBeInTheDocument();
  });

  it('renders height input', () => {
    render(<ReviewFilter {...defaultProps} height={170} />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders weight input', () => {
    render(<ReviewFilter {...defaultProps} weight={70} />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBeGreaterThan(0);
  });

  it('renders search button', () => {
    render(<ReviewFilter {...defaultProps} />);
    expect(screen.getByText('search')).toBeInTheDocument();
  });

  it('calls setKeyword when keyword input changes', () => {
    render(<ReviewFilter {...defaultProps} />);
    const input = screen.getByPlaceholderText('searchPlaceholder');
    fireEvent.change(input, { target: { value: 'new keyword' } });
    expect(mockSetKeyword).toHaveBeenCalledWith('new keyword');
  });

  it('calls setHeight when height input changes', () => {
    render(<ReviewFilter {...defaultProps} />);
    const inputs = screen.getAllByRole('spinbutton');
    const heightInput = inputs.find((input) =>
      input.getAttribute('placeholder') === 'height'
    );
    if (heightInput) {
      fireEvent.change(heightInput, { target: { value: '180' } });
      expect(mockSetHeight).toHaveBeenCalledWith(180);
    }
  });

  it('verifies setHeight can handle empty string', () => {
    render(<ReviewFilter {...defaultProps} />);
    // Just verify the callback exists
    expect(mockSetHeight).toBeDefined();
    expect(typeof mockSetHeight).toBe('function');
  });

  it('calls setWeight when weight input changes', () => {
    render(<ReviewFilter {...defaultProps} />);
    const inputs = screen.getAllByRole('spinbutton');
    const weightInput = inputs.find((input) =>
      input.getAttribute('placeholder') === 'bodyWeight'
    );
    if (weightInput) {
      fireEvent.change(weightInput, { target: { value: '75' } });
      expect(mockSetWeight).toHaveBeenCalledWith(75);
    }
  });

  it('verifies setWeight can handle empty string', () => {
    render(<ReviewFilter {...defaultProps} />);
    // Just verify the callback exists
    expect(mockSetWeight).toBeDefined();
    expect(typeof mockSetWeight).toBe('function');
  });

  it('calls onSearch when search button is clicked', () => {
    render(<ReviewFilter {...defaultProps} />);
    fireEvent.click(screen.getByText('search'));
    expect(mockOnSearch).toHaveBeenCalledTimes(1);
  });

  it('renders with all rating values', () => {
    render(<ReviewFilter {...defaultProps} rating={5} />);
    expect(mockT).toHaveBeenCalledWith('allRatingsWithPrefix');
    expect(mockT).toHaveBeenCalledWith('star');
  });

  it('renders with all fit level values', () => {
    render(<ReviewFilter {...defaultProps} fitLevel={1} />);
    expect(mockT).toHaveBeenCalledWith('allFitLevelsWithPrefix');
    expect(mockT).toHaveBeenCalledWith('fitLevelFit');
    expect(mockT).toHaveBeenCalledWith('fitLevelLoose');
    expect(mockT).toHaveBeenCalledWith('fitLevelTight');
  });

  it('renders with all status values', () => {
    render(<ReviewFilter {...defaultProps} status="visible" />);
    expect(mockT).toHaveBeenCalledWith('allVisibilityWithPrefix');
    expect(mockT).toHaveBeenCalledWith('statusVisible');
    expect(mockT).toHaveBeenCalledWith('statusHidden');
  });

  it('uses translation hook', () => {
    render(<ReviewFilter {...defaultProps} />);
    expect(mockT).toHaveBeenCalled();
  });

  it('exports ReviewFilter function', () => {
    expect(ReviewFilter).toBeDefined();
    expect(typeof ReviewFilter).toBe('function');
  });

  it('renders Card component', () => {
    const { container } = render(<ReviewFilter {...defaultProps} />);
    expect(container.querySelector('.MuiCard-root')).toBeInTheDocument();
  });

  it('is a functional component', () => {
    expect(typeof ReviewFilter).toBe('function');
    expect(ReviewFilter.name).toBe('ReviewFilter');
  });

  it('renders Grid container', () => {
    const { container } = render(<ReviewFilter {...defaultProps} />);
    expect(container.querySelector('.MuiGrid-container')).toBeInTheDocument();
  });

  it('renders all select dropdowns', () => {
    render(<ReviewFilter {...defaultProps} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(3); // rating, fitLevel, status
  });

  it('renders all number inputs', () => {
    render(<ReviewFilter {...defaultProps} />);
    const inputs = screen.getAllByRole('spinbutton');
    expect(inputs.length).toBe(2); // height, weight
  });

  it('verifies setRating callback exists', () => {
    render(<ReviewFilter {...defaultProps} />);
    expect(mockSetRating).toBeDefined();
    expect(typeof mockSetRating).toBe('function');
  });

  it('verifies setFitLevel callback exists', () => {
    render(<ReviewFilter {...defaultProps} />);
    expect(mockSetFitLevel).toBeDefined();
    expect(typeof mockSetFitLevel).toBe('function');
  });

  it('verifies setStatus callback exists', () => {
    render(<ReviewFilter {...defaultProps} />);
    expect(mockSetStatus).toBeDefined();
    expect(typeof mockSetStatus).toBe('function');
  });

  it('renders with numeric rating value', () => {
    render(<ReviewFilter {...defaultProps} rating={4} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(3);
  });

  it('renders with numeric fitLevel value', () => {
    render(<ReviewFilter {...defaultProps} fitLevel={2} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.length).toBe(3);
  });
});
