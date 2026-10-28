import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Input, InputCommon } from 'src/components/input/input';

describe('Input', () => {
  it('renders with label', () => {
    const { getByLabelText } = render(<Input label="Test Label" />);
    expect(getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('renders with value', () => {
    const { container } = render(<Input value="test value" onChange={() => {}} />);
    const input = container.querySelector('input');
    expect(input?.value).toBe('test value');
  });

  it('renders with placeholder', () => {
    const { container } = render(<Input placeholder="Enter text" />);
    const input = container.querySelector('input');
    expect(input?.placeholder).toBe('Enter text');
  });

  it('renders disabled state', () => {
    const { container } = render(<Input disabled />);
    const input = container.querySelector('input');
    expect(input).toBeDisabled();
  });

  it('renders with error', () => {
    const { container } = render(<Input error helperText="Error message" />);
    expect(container).toHaveTextContent('Error message');
  });

  it('renders with fullWidth', () => {
    const { container } = render(<Input fullWidth />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('InputCommon', () => {
  it('renders with props', () => {
    const { getByLabelText } = render(<InputCommon label="Common Input" />);
    expect(getByLabelText('Common Input')).toBeInTheDocument();
  });

  it('passes through all props', () => {
    const { container } = render(<InputCommon placeholder="test" disabled />);
    const input = container.querySelector('input');
    expect(input?.placeholder).toBe('test');
    expect(input).toBeDisabled();
  });
});
