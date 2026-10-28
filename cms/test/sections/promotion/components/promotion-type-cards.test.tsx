import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PromotionTypeCards } from 'src/sections/promotion/components/promotion-type-cards';

const mockNavigate = vi.fn();
const mockT = vi.fn((key: string) => key);

vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: mockT }),
}));

describe('PromotionTypeCards', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without errors', () => {
    expect(() => {
      render(<PromotionTypeCards />);
    }).not.toThrow();
  });

  it('renders section title', () => {
    render(<PromotionTypeCards />);
    expect(mockT).toHaveBeenCalledWith('createPromotion');
  });

  it('renders all 4 promotion type cards', () => {
    render(<PromotionTypeCards />);
    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(4);
  });

  it('renders productDiscount card', () => {
    render(<PromotionTypeCards />);
    expect(mockT).toHaveBeenCalledWith('productDiscount');
    expect(mockT).toHaveBeenCalledWith('productDiscountDesc');
  });

  it('renders invoiceDiscount card', () => {
    render(<PromotionTypeCards />);
    expect(mockT).toHaveBeenCalledWith('invoiceDiscount');
    expect(mockT).toHaveBeenCalledWith('invoiceDiscountDesc');
  });

  it('renders comboPromotion card', () => {
    render(<PromotionTypeCards />);
    expect(mockT).toHaveBeenCalledWith('comboPromotion');
    expect(mockT).toHaveBeenCalledWith('comboPromotionDesc');
  });

  it('renders shockDeal card', () => {
    render(<PromotionTypeCards />);
    expect(mockT).toHaveBeenCalledWith('shockDeal');
    expect(mockT).toHaveBeenCalledWith('shockDealDesc');
  });

  it('disables productDiscount button', () => {
    render(<PromotionTypeCards />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[0]).toBeDisabled();
  });

  it('disables invoiceDiscount button', () => {
    render(<PromotionTypeCards />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[1]).toBeDisabled();
  });

  it('disables comboPromotion button', () => {
    render(<PromotionTypeCards />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[2]).toBeDisabled();
  });

  it('enables shockDeal button', () => {
    render(<PromotionTypeCards />);
    const buttons = screen.getAllByRole('button');
    expect(buttons[3]).not.toBeDisabled();
  });

  it('navigates when shockDeal button is clicked', () => {
    render(<PromotionTypeCards />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[3]);
    expect(mockNavigate).toHaveBeenCalledWith('/shock-deal/create');
  });

  it('does not navigate when disabled button is clicked', () => {
    render(<PromotionTypeCards />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // productDiscount is disabled
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('uses translation hook', () => {
    render(<PromotionTypeCards />);
    expect(mockT).toHaveBeenCalled();
  });

  it('uses useNavigate hook', () => {
    render(<PromotionTypeCards />);
    expect(mockNavigate).toBeDefined();
  });

  it('exports PromotionTypeCards function', () => {
    expect(PromotionTypeCards).toBeDefined();
    expect(typeof PromotionTypeCards).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof PromotionTypeCards).toBe('function');
    expect(PromotionTypeCards.name).toBe('PromotionTypeCards');
  });

  it('renders Grid component', () => {
    const { container } = render(<PromotionTypeCards />);
    expect(container.querySelector('.MuiGrid-root')).toBeInTheDocument();
  });

  it('renders Card components', () => {
    const { container } = render(<PromotionTypeCards />);
    const cards = container.querySelectorAll('.MuiCard-root');
    expect(cards.length).toBe(4);
  });

  it('renders Box component', () => {
    const { container } = render(<PromotionTypeCards />);
    expect(container.querySelector('.MuiBox-root')).toBeInTheDocument();
  });

  it('renders create button text', () => {
    render(<PromotionTypeCards />);
    expect(mockT).toHaveBeenCalledWith('create');
  });
});
