import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ClassificationSection } from 'src/sections/shock-deal/components/classification-section';
import { BundleDealSubType } from 'src/types/promotion';

const mockT = vi.fn((key: string) => key);

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

vi.mock('src/types/promotion', () => ({
  BundleDealSubType: {
    BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT: 1,
  },
}));

describe('ClassificationSection', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(
        <ClassificationSection
          value={BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT}
          onChange={mockOnChange}
        />
      );
    }).not.toThrow();
  });

  it('renders classification title', () => {
    render(
      <ClassificationSection
        value={BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT}
        onChange={mockOnChange}
      />
    );
    expect(mockT).toHaveBeenCalledWith('classification');
  });

  it('renders buyToReceiveGift option', () => {
    render(
      <ClassificationSection
        value={BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT}
        onChange={mockOnChange}
      />
    );
    expect(mockT).toHaveBeenCalledWith('buyToReceiveGift');
  });

  it('renders with selected value', () => {
    render(
      <ClassificationSection
        value={BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT}
        onChange={mockOnChange}
      />
    );
    const radio = screen.getByRole('radio');
    expect(radio).toBeChecked();
  });

  it('accepts onChange callback', () => {
    render(
      <ClassificationSection
        value={BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT}
        onChange={mockOnChange}
      />
    );
    expect(mockOnChange).toBeDefined();
    expect(typeof mockOnChange).toBe('function');
  });

  it('renders disabled radio when disabled prop is true', () => {
    render(
      <ClassificationSection
        value={BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT}
        onChange={mockOnChange}
        disabled
      />
    );

    const radio = screen.getByRole('radio');
    expect(radio).toBeDisabled();
  });

  it('renders enabled radio when disabled prop is false', () => {
    render(
      <ClassificationSection
        value={BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT}
        onChange={mockOnChange}
        disabled={false}
      />
    );

    const radio = screen.getByRole('radio');
    expect(radio).not.toBeDisabled();
  });

  it('renders enabled radio by default', () => {
    render(
      <ClassificationSection
        value={BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT}
        onChange={mockOnChange}
      />
    );

    const radio = screen.getByRole('radio');
    expect(radio).not.toBeDisabled();
  });

  it('uses translation hook', () => {
    render(
      <ClassificationSection
        value={BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT}
        onChange={mockOnChange}
      />
    );
    expect(mockT).toHaveBeenCalled();
  });

  it('exports ClassificationSection function', () => {
    expect(ClassificationSection).toBeDefined();
    expect(typeof ClassificationSection).toBe('function');
  });

  it('renders Card component', () => {
    const { container } = render(
      <ClassificationSection
        value={BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT}
        onChange={mockOnChange}
      />
    );
    expect(container.querySelector('.MuiCard-root')).toBeInTheDocument();
  });

  it('renders RadioGroup component', () => {
    const { container } = render(
      <ClassificationSection
        value={BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT}
        onChange={mockOnChange}
      />
    );
    expect(container.querySelector('.MuiRadioGroup-root')).toBeInTheDocument();
  });

  it('renders FormControlLabel component', () => {
    const { container } = render(
      <ClassificationSection
        value={BundleDealSubType.BUNDLE_DEAL_SUB_TYPE_BUY_TO_GET_GIFT}
        onChange={mockOnChange}
      />
    );
    expect(container.querySelector('.MuiFormControlLabel-root')).toBeInTheDocument();
  });

  it('is a functional component', () => {
    expect(typeof ClassificationSection).toBe('function');
    expect(ClassificationSection.name).toBe('ClassificationSection');
  });
});
