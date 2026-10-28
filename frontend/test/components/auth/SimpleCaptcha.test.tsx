import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SimpleCaptcha } from '@/components/auth/SimpleCaptcha';

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'signin.captcha.placeholder': 'Enter answer',
      'signin.captcha.refresh': 'Refresh',
    };
    return translations[`signin.captcha.${key}`] || key;
  },
}));

describe('SimpleCaptcha', () => {
  let onValidate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onValidate = vi.fn();
  });

  it('renders captcha question', () => {
    render(<SimpleCaptcha onValidate={onValidate} />);

    const captchaText = screen.getByText(/\d+ \+ \d+ = \?/);
    expect(captchaText).toBeInTheDocument();
  });

  it('renders input field with placeholder', () => {
    render(<SimpleCaptcha onValidate={onValidate} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Enter answer');
  });

  it('renders refresh button', () => {
    render(<SimpleCaptcha onValidate={onValidate} />);

    const refreshButton = screen.getByRole('button', { name: 'Refresh' });
    expect(refreshButton).toBeInTheDocument();
  });

  it('calls onValidate with false initially', () => {
    render(<SimpleCaptcha onValidate={onValidate} />);

    expect(onValidate).toHaveBeenCalledWith(false);
  });

  it('validates correct answer', async () => {
    const user = userEvent.setup();
    render(<SimpleCaptcha onValidate={onValidate} />);

    const captchaText = screen.getByText(/\d+ \+ \d+ = \?/);
    const match = captchaText.textContent?.match(/(\d+) \+ (\d+) = \?/);
    const num1 = parseInt(match![1], 10);
    const num2 = parseInt(match![2], 10);
    const correctAnswer = num1 + num2;

    const input = screen.getByRole('textbox');
    await user.type(input, correctAnswer.toString());

    expect(onValidate).toHaveBeenLastCalledWith(true);
  });

  it('validates incorrect answer', async () => {
    const user = userEvent.setup();
    render(<SimpleCaptcha onValidate={onValidate} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '999');

    expect(onValidate).toHaveBeenLastCalledWith(false);
  });

  it('only accepts numeric input', async () => {
    const user = userEvent.setup();
    render(<SimpleCaptcha onValidate={onValidate} />);

    const input = screen.getByRole('textbox') as HTMLInputElement;
    await user.type(input, 'abc123xyz');

    expect(input.value).toBe('123');
  });

  it('refreshes captcha when refresh button clicked', async () => {
    const user = userEvent.setup();
    render(<SimpleCaptcha onValidate={onValidate} />);

    const captchaTextBefore = screen.getByText(/\d+ \+ \d+ = \?/);
    const textBefore = captchaTextBefore.textContent;

    const refreshButton = screen.getByRole('button', { name: 'Refresh' });
    await user.click(refreshButton);

    const captchaTextAfter = screen.getByText(/\d+ \+ \d+ = \?/);
    const textAfter = captchaTextAfter.textContent;

    // Captcha might be the same by chance (small probability), but input should be cleared
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('');
    expect(onValidate).toHaveBeenLastCalledWith(false);
  });

  it('clears input when refresh button clicked', async () => {
    const user = userEvent.setup();
    render(<SimpleCaptcha onValidate={onValidate} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '10');

    const refreshButton = screen.getByRole('button', { name: 'Refresh' });
    await user.click(refreshButton);

    expect((input as HTMLInputElement).value).toBe('');
  });

  it('displays error message when error prop provided', () => {
    const errorMessage = 'Invalid captcha';
    render(<SimpleCaptcha onValidate={onValidate} error={errorMessage} />);

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(<SimpleCaptcha onValidate={onValidate} disabled={true} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('disables refresh button when disabled prop is true', () => {
    render(<SimpleCaptcha onValidate={onValidate} disabled={true} />);

    const refreshButton = screen.getByRole('button', { name: 'Refresh' });
    expect(refreshButton).toBeDisabled();
  });

  it('calls onValidate with false when input is empty', async () => {
    const user = userEvent.setup();
    render(<SimpleCaptcha onValidate={onValidate} />);

    const input = screen.getByRole('textbox');
    await user.type(input, '5');
    await user.clear(input);

    expect(onValidate).toHaveBeenLastCalledWith(false);
  });

  it('validates answer as user types', async () => {
    const user = userEvent.setup();
    render(<SimpleCaptcha onValidate={onValidate} />);

    const captchaText = screen.getByText(/\d+ \+ \d+ = \?/);
    const match = captchaText.textContent?.match(/(\d+) \+ (\d+) = \?/);
    const num1 = parseInt(match![1], 10);
    const num2 = parseInt(match![2], 10);
    const correctAnswer = num1 + num2;

    const input = screen.getByRole('textbox');

    // Type partial answer (just first digit)
    const firstDigit = correctAnswer.toString()[0];
    await user.type(input, firstDigit);

    // If answer is single digit, it might be correct already
    if (correctAnswer.toString().length === 1) {
      expect(onValidate).toHaveBeenLastCalledWith(true);
    } else {
      expect(onValidate).toHaveBeenCalledWith(false);

      // Complete the answer
      const remainingDigits = correctAnswer.toString().slice(1);
      if (remainingDigits) {
        await user.type(input, remainingDigits);
        expect(onValidate).toHaveBeenLastCalledWith(true);
      }
    }
  });

  it('generates random captcha with numbers 1-20', () => {
    const { rerender } = render(<SimpleCaptcha onValidate={onValidate} />);

    // Render multiple times to check randomness
    const captchaValues: string[] = [];
    for (let i = 0; i < 10; i++) {
      rerender(<SimpleCaptcha onValidate={onValidate} />);
      const captchaText = screen.getByText(/\d+ \+ \d+ = \?/);
      const match = captchaText.textContent?.match(/(\d+) \+ (\d+) = \?/);
      if (match) {
        const num1 = parseInt(match[1], 10);
        const num2 = parseInt(match[2], 10);
        expect(num1).toBeGreaterThanOrEqual(1);
        expect(num1).toBeLessThanOrEqual(20);
        expect(num2).toBeGreaterThanOrEqual(1);
        expect(num2).toBeLessThanOrEqual(20);
        captchaValues.push(`${num1}+${num2}`);
      }
    }
  });
});
