import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AuthProviderWrapper } from '@/components/providers/AuthProviderWrapper';
import { Theme } from '@radix-ui/themes';

describe('AuthProviderWrapper', () => {
  const renderWithTheme = (ui: React.ReactElement) => {
    return render(<Theme>{ui}</Theme>);
  };

  describe('Basic rendering', () => {
    it('renders children', () => {
      renderWithTheme(
        <AuthProviderWrapper locale="vi">
          <div>Test content</div>
        </AuthProviderWrapper>
      );
      expect(screen.getByText('Test content')).toBeInTheDocument();
    });

    it('renders with locale="vi"', () => {
      renderWithTheme(
        <AuthProviderWrapper locale="vi">
          <span>Vietnamese content</span>
        </AuthProviderWrapper>
      );
      expect(screen.getByText('Vietnamese content')).toBeInTheDocument();
    });

    it('renders with locale="en"', () => {
      renderWithTheme(
        <AuthProviderWrapper locale="en">
          <span>English content</span>
        </AuthProviderWrapper>
      );
      expect(screen.getByText('English content')).toBeInTheDocument();
    });
  });

  describe('Multiple children', () => {
    it('renders multiple children', () => {
      renderWithTheme(
        <AuthProviderWrapper locale="vi">
          <div>First child</div>
          <div>Second child</div>
        </AuthProviderWrapper>
      );
      expect(screen.getByText('First child')).toBeInTheDocument();
      expect(screen.getByText('Second child')).toBeInTheDocument();
    });

    it('renders nested children', () => {
      renderWithTheme(
        <AuthProviderWrapper locale="vi">
          <div>
            <span>Nested child</span>
          </div>
        </AuthProviderWrapper>
      );
      expect(screen.getByText('Nested child')).toBeInTheDocument();
    });

    it('renders complex component tree', () => {
      renderWithTheme(
        <AuthProviderWrapper locale="vi">
          <div>
            <h1>Title</h1>
            <p>Paragraph</p>
            <button>Button</button>
          </div>
        </AuthProviderWrapper>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Paragraph')).toBeInTheDocument();
      expect(screen.getByText('Button')).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('renders empty children', () => {
      const { container } = renderWithTheme(
        <AuthProviderWrapper locale="vi">{null}</AuthProviderWrapper>
      );
      expect(container).toBeInTheDocument();
    });

    it('renders undefined children', () => {
      const { container } = renderWithTheme(
        <AuthProviderWrapper locale="vi">{undefined}</AuthProviderWrapper>
      );
      expect(container).toBeInTheDocument();
    });

    it('renders string children', () => {
      renderWithTheme(
        <AuthProviderWrapper locale="vi">Plain text</AuthProviderWrapper>
      );
      expect(screen.getByText('Plain text')).toBeInTheDocument();
    });

    it('renders number children', () => {
      renderWithTheme(<AuthProviderWrapper locale="vi">{123}</AuthProviderWrapper>);
      expect(screen.getByText('123')).toBeInTheDocument();
    });

    it('renders boolean children as empty', () => {
      const { container } = renderWithTheme(
        <AuthProviderWrapper locale="vi">{true}</AuthProviderWrapper>
      );
      // Booleans render as empty in React
      expect(container.textContent).toBe('');
    });

    it('renders array of children', () => {
      renderWithTheme(
        <AuthProviderWrapper locale="vi">
          {[
            <div key="1">Item 1</div>,
            <div key="2">Item 2</div>,
            <div key="3">Item 3</div>,
          ]}
        </AuthProviderWrapper>
      );
      expect(screen.getByText('Item 1')).toBeInTheDocument();
      expect(screen.getByText('Item 2')).toBeInTheDocument();
      expect(screen.getByText('Item 3')).toBeInTheDocument();
    });
  });

  describe('Wrapper behavior', () => {
    it('does not add extra DOM elements', () => {
      const { container } = renderWithTheme(
        <AuthProviderWrapper locale="vi">
          <div data-testid="child">Content</div>
        </AuthProviderWrapper>
      );
      const child = screen.getByTestId('child');
      // The child should be directly under the Theme wrapper, no extra elements
      expect(child).toBeInTheDocument();
    });

    it('preserves child component props', () => {
      renderWithTheme(
        <AuthProviderWrapper locale="vi">
          <button type="submit" disabled>
            Submit
          </button>
        </AuthProviderWrapper>
      );
      const button = screen.getByText('Submit');
      expect(button).toHaveAttribute('type', 'submit');
      expect(button).toBeDisabled();
    });

    it('preserves child component className', () => {
      renderWithTheme(
        <AuthProviderWrapper locale="vi">
          <div className="custom-class">Content</div>
        </AuthProviderWrapper>
      );
      const div = screen.getByText('Content');
      expect(div).toHaveClass('custom-class');
    });

    it('preserves child component events', () => {
      const handleClick = vi.fn();
      renderWithTheme(
        <AuthProviderWrapper locale="vi">
          <button onClick={handleClick}>Click me</button>
        </AuthProviderWrapper>
      );
      const button = screen.getByText('Click me');
      button.click();
      expect(handleClick).toHaveBeenCalledTimes(1);
    });
  });
});
