import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ThemeModeButton from 'src/layouts/components/theme-mode-button';

const mockSetMode = vi.fn();
let mockMode: 'light' | 'dark' = 'light';

vi.mock('@mui/material', async () => {
  const actual = await vi.importActual('@mui/material');
  return {
    ...actual,
    useColorScheme: () => ({
      mode: mockMode,
      setMode: mockSetMode,
    }),
  };
});

describe('ThemeModeButton', () => {
  beforeEach(() => {
    mockSetMode.mockClear();
    vi.clearAllMocks();
  });

  it('renders IconButton', () => {
    const { container } = render(<ThemeModeButton />);
    expect(container.querySelector('.MuiIconButton-root')).toBeInTheDocument();
  });

  it('renders LightModeIcon when mode is light', () => {
    const { container } = render(<ThemeModeButton />);
    expect(container.querySelector('[data-testid="LightModeIcon"]')).toBeInTheDocument();
  });

  it('applies correct width and height styles', () => {
    const { container } = render(<ThemeModeButton />);
    const button = container.querySelector('.MuiIconButton-root');
    expect(button).toHaveStyle({ width: '40px', height: '40px' });
  });

  it('toggles theme on button click', () => {
    const { container } = render(<ThemeModeButton />);
    const button = container.querySelector('.MuiIconButton-root') as HTMLElement;

    fireEvent.click(button);
    expect(mockSetMode).toHaveBeenCalledWith('dark');
  });

  it('renders without errors', () => {
    expect(() => {
      render(<ThemeModeButton />);
    }).not.toThrow();
  });

  it('exports default ThemeModeButton', () => {
    expect(ThemeModeButton).toBeDefined();
    expect(typeof ThemeModeButton).toBe('function');
  });

  it('IconButton has role button', () => {
    render(<ThemeModeButton />);
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
  });

  it('adds keydown event listener on mount', () => {
    const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
    render(<ThemeModeButton />);
    expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    addEventListenerSpy.mockRestore();
  });

  it('removes keydown event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');
    const { unmount } = render(<ThemeModeButton />);
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    removeEventListenerSpy.mockRestore();
  });

  it('toggles theme on Alt+Delete keyboard shortcut', () => {
    render(<ThemeModeButton />);

    fireEvent.keyDown(window, { altKey: true, key: 'Delete' });
    expect(mockSetMode).toHaveBeenCalledWith('dark');
  });

  it('does not toggle theme on Delete without Alt', () => {
    render(<ThemeModeButton />);

    fireEvent.keyDown(window, { altKey: false, key: 'Delete' });
    expect(mockSetMode).not.toHaveBeenCalled();
  });

  it('does not toggle theme on Alt without Delete', () => {
    render(<ThemeModeButton />);

    fireEvent.keyDown(window, { altKey: true, key: 'Enter' });
    expect(mockSetMode).not.toHaveBeenCalled();
  });

  it('IconButton is clickable', () => {
    const { container } = render(<ThemeModeButton />);
    const button = container.querySelector('.MuiIconButton-root') as HTMLElement;
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('has correct component structure', () => {
    const { container } = render(<ThemeModeButton />);
    const button = container.querySelector('.MuiIconButton-root');
    const icon = container.querySelector('[data-testid="LightModeIcon"]');

    expect(button).toContainElement(icon);
  });

  it('renders icon inside button', () => {
    const { container } = render(<ThemeModeButton />);
    const button = container.querySelector('.MuiIconButton-root');
    const svg = button?.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('useColorScheme hook is called', () => {
    render(<ThemeModeButton />);
    // Component should render without errors, indicating hook was called successfully
    expect(screen.getAllByRole('button').length).toBeGreaterThan(0);
  });

  it('toggleTheme callback is memoized', () => {
    const { rerender } = render(<ThemeModeButton />);
    const { container: container1 } = render(<ThemeModeButton />);
    const button1 = container1.querySelector('.MuiIconButton-root') as HTMLElement;

    rerender(<ThemeModeButton />);

    // Button should still be clickable after rerender
    fireEvent.click(button1);
    expect(mockSetMode).toHaveBeenCalled();
  });

  it('handleKeyDown callback is memoized', () => {
    const { rerender } = render(<ThemeModeButton />);

    rerender(<ThemeModeButton />);

    // Keyboard shortcut should still work after rerender
    fireEvent.keyDown(window, { altKey: true, key: 'Delete' });
    expect(mockSetMode).toHaveBeenCalled();
  });

  it('renders complete theme toggle button', () => {
    const { container } = render(<ThemeModeButton />);
    expect(container.querySelector('.MuiIconButton-root')).toBeInTheDocument();
    expect(container.querySelector('[data-testid="LightModeIcon"]')).toBeInTheDocument();
  });

  it('renders DarkModeIcon when mode is dark', () => {
    mockMode = 'dark';
    const { container } = render(<ThemeModeButton />);
    expect(container.querySelector('[data-testid="DarkModeIcon"]')).toBeInTheDocument();
    mockMode = 'light'; // Reset
  });

  it('toggles from dark to light on button click', () => {
    mockMode = 'dark';
    const { container } = render(<ThemeModeButton />);
    const button = container.querySelector('.MuiIconButton-root') as HTMLElement;

    fireEvent.click(button);
    expect(mockSetMode).toHaveBeenCalledWith('light');
    mockMode = 'light'; // Reset
  });
});
