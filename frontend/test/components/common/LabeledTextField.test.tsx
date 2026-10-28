import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LabeledTextField } from '@/components/common/LabeledTextField';
import { Theme } from '@radix-ui/themes';

describe('LabeledTextField', () => {
  const defaultProps = {
    label: 'Test Label',
    value: '',
    onChange: vi.fn(),
  };

  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  it('renders with label above input by default', () => {
    renderWithTheme(<LabeledTextField {...defaultProps} />);

    const label = screen.getByText('Test Label');
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe('LABEL');
  });

  it('renders with placeholder labelPosition', () => {
    renderWithTheme(
      <LabeledTextField {...defaultProps} labelPosition="placeholder" />
    );

    const input = screen.getByPlaceholderText('Test Label');
    expect(input).toBeInTheDocument();

    // Label should not be visible when labelPosition is placeholder
    expect(screen.queryByText('Test Label')).not.toBeInTheDocument();
  });

  it('displays the current value', () => {
    renderWithTheme(<LabeledTextField {...defaultProps} value="Test Value" />);

    const input = screen.getByDisplayValue('Test Value');
    expect(input).toBeInTheDocument();
  });

  it('calls onChange when input value changes', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    renderWithTheme(<LabeledTextField {...defaultProps} onChange={onChange} />);

    const input = screen.getByRole('textbox');
    await user.type(input, 'a');

    expect(onChange).toHaveBeenCalled();
  });

  it('renders with different input types', () => {
    const { rerender } = renderWithTheme(
      <LabeledTextField {...defaultProps} type="password" />
    );

    let input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('type', 'password');

    rerender(
      <Theme>
        <LabeledTextField {...defaultProps} type="email" />
      </Theme>
    );
    input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('type', 'email');

    rerender(
      <Theme>
        <LabeledTextField {...defaultProps} type="tel" />
      </Theme>
    );
    input = screen.getByLabelText('Test Label');
    expect(input).toHaveAttribute('type', 'tel');
  });

  it('displays error message when error prop is provided', () => {
    renderWithTheme(
      <LabeledTextField {...defaultProps} error="This field is required" />
    );

    const errorMessage = screen.getByText('This field is required');
    expect(errorMessage).toBeInTheDocument();
  });

  it('applies error class when error is present', () => {
    const { container } = renderWithTheme(
      <LabeledTextField {...defaultProps} error="Error message" />
    );

    const inputRoot = container.querySelector('.field-error');
    expect(inputRoot).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    renderWithTheme(<LabeledTextField {...defaultProps} disabled={true} />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('calls onKeyDown when key is pressed', async () => {
    const user = userEvent.setup();
    const onKeyDown = vi.fn();

    renderWithTheme(
      <LabeledTextField {...defaultProps} onKeyDown={onKeyDown} />
    );

    const input = screen.getByRole('textbox');
    await user.type(input, '{Enter}');

    expect(onKeyDown).toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const { container } = renderWithTheme(
      <LabeledTextField {...defaultProps} className="custom-class" />
    );

    const inputRoot = container.querySelector('.custom-class');
    expect(inputRoot).toBeInTheDocument();
  });

  it('renders rightElement when provided', () => {
    renderWithTheme(
      <LabeledTextField
        {...defaultProps}
        rightElement={<span data-testid="right-element">Icon</span>}
      />
    );

    const rightElement = screen.getByTestId('right-element');
    expect(rightElement).toBeInTheDocument();
  });

  it('sets inputMode attribute when provided', () => {
    renderWithTheme(
      <LabeledTextField {...defaultProps} inputMode="numeric" />
    );

    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('inputMode', 'numeric');
  });

  it('uses custom placeholder when provided', () => {
    renderWithTheme(
      <LabeledTextField {...defaultProps} placeholder="Custom placeholder" />
    );

    const input = screen.getByPlaceholderText('Custom placeholder');
    expect(input).toBeInTheDocument();
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();

    renderWithTheme(<LabeledTextField {...defaultProps} ref={ref} />);

    expect(ref).toHaveBeenCalled();
  });

  it('generates unique input id', () => {
    const { container } = renderWithTheme(
      <LabeledTextField {...defaultProps} />
    );

    const input = screen.getByRole('textbox');
    const label = screen.getByText('Test Label');

    expect(input).toHaveAttribute('id');
    expect(label).toHaveAttribute('for', input.getAttribute('id'));
  });

  it('renders with ReactNode as label', () => {
    renderWithTheme(
      <LabeledTextField
        {...defaultProps}
        label={<span data-testid="custom-label">Custom Label</span>}
      />
    );

    const customLabel = screen.getByTestId('custom-label');
    expect(customLabel).toBeInTheDocument();
  });

  it('does not show label text when labelPosition is placeholder and label is ReactNode', () => {
    renderWithTheme(
      <LabeledTextField
        {...defaultProps}
        label={<span>Custom Label</span>}
        labelPosition="placeholder"
      />
    );

    const input = screen.getByRole('textbox');
    expect(input).not.toHaveAttribute('placeholder', 'Custom Label');
  });
});
