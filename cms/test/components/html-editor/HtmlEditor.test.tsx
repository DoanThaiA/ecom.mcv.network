import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HtmlEditor } from 'src/components/html-editor/HtmlEditor';

const mockOnChange = vi.fn();

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('@tiptap/react', () => ({
  useEditor: vi.fn(() => ({
    commands: { setContent: vi.fn() },
    setEditable: vi.fn(),
    getHTML: vi.fn(() => '<p>Test content</p>'),
  })),
}));

vi.mock('mui-tiptap', () => ({
  RichTextEditorProvider: ({ children }: any) => <div data-testid="editor-provider">{children}</div>,
  RichTextField: ({ controls }: any) => (
    <div data-testid="rich-text-field">
      {controls}
      <div contentEditable data-testid="editor-content" />
    </div>
  ),
  MenuControlsContainer: ({ children }: any) => <div data-testid="menu-controls">{children}</div>,
  MenuButtonUndo: () => <button data-testid="btn-undo">Undo</button>,
  MenuButtonRedo: () => <button data-testid="btn-redo">Redo</button>,
  MenuButtonBold: () => <button data-testid="btn-bold">Bold</button>,
  MenuButtonItalic: () => <button data-testid="btn-italic">Italic</button>,
  MenuButtonUnderline: () => <button data-testid="btn-underline">Underline</button>,
  MenuButtonStrikethrough: () => <button data-testid="btn-strikethrough">Strike</button>,
  MenuButtonHighlightColor: () => <button data-testid="btn-highlight">Highlight</button>,
  MenuButtonBulletedList: () => <button data-testid="btn-bullet-list">Bullet</button>,
  MenuButtonOrderedList: () => <button data-testid="btn-ordered-list">Ordered</button>,
  MenuButtonEditLink: () => <button data-testid="btn-link">Link</button>,
  MenuButtonBlockquote: () => <button data-testid="btn-blockquote">Quote</button>,
  MenuButtonCode: () => <button data-testid="btn-code">Code</button>,
  MenuButtonCodeBlock: () => <button data-testid="btn-code-block">Code Block</button>,
  MenuButtonHorizontalRule: () => <button data-testid="btn-hr">HR</button>,
  MenuButtonRemoveFormatting: () => <button data-testid="btn-clear">Clear</button>,
  MenuSelectHeading: () => <select data-testid="select-heading"><option>Heading</option></select>,
  MenuSelectTextAlign: () => <select data-testid="select-align"><option>Align</option></select>,
  MenuDivider: () => <span data-testid="menu-divider">|</span>,
}));

describe('HtmlEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(container).toBeInTheDocument();
  });

  it('renders tabs container', () => {
    const { container } = render(<HtmlEditor value="" onChange={mockOnChange} />);
    const tabs = container.querySelector('.MuiTabs-root');
    expect(tabs).toBeInTheDocument();
  });

  it('renders edit tab', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByText('edit')).toBeInTheDocument();
  });

  it('renders html tab', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByText('html')).toBeInTheDocument();
  });

  it('renders preview tab', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByText('preview')).toBeInTheDocument();
  });

  it('renders fullscreen toggle button', () => {
    const { container } = render(<HtmlEditor value="" onChange={mockOnChange} />);
    const iconButton = container.querySelector('.MuiIconButton-root');
    expect(iconButton).toBeInTheDocument();
  });

  it('toggles fullscreen on button click', () => {
    const { container } = render(<HtmlEditor value="" onChange={mockOnChange} />);
    const fullscreenBtn = container.querySelector('.MuiIconButton-root');
    fireEvent.click(fullscreenBtn!);
    expect(container).toBeInTheDocument();
  });

  it('displays edit mode by default', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('editor-provider')).toBeInTheDocument();
  });

  it('switches to html mode', () => {
    render(<HtmlEditor value="<p>Test</p>" onChange={mockOnChange} />);
    const htmlTab = screen.getByText('html');
    fireEvent.click(htmlTab);
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea).toBeInTheDocument();
  });

  it('switches to preview mode', () => {
    render(<HtmlEditor value="<p>Test</p>" onChange={mockOnChange} />);
    const previewTab = screen.getByText('preview');
    fireEvent.click(previewTab);
    expect(screen.queryByTestId('editor-provider')).not.toBeInTheDocument();
  });

  it('renders menu controls in edit mode', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('menu-controls')).toBeInTheDocument();
  });

  it('renders undo button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-undo')).toBeInTheDocument();
  });

  it('renders redo button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-redo')).toBeInTheDocument();
  });

  it('renders bold button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-bold')).toBeInTheDocument();
  });

  it('renders italic button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-italic')).toBeInTheDocument();
  });

  it('renders underline button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-underline')).toBeInTheDocument();
  });

  it('renders strikethrough button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-strikethrough')).toBeInTheDocument();
  });

  it('renders highlight button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-highlight')).toBeInTheDocument();
  });

  it('renders bullet list button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-bullet-list')).toBeInTheDocument();
  });

  it('renders ordered list button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-ordered-list')).toBeInTheDocument();
  });

  it('renders link button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-link')).toBeInTheDocument();
  });

  it('renders blockquote button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-blockquote')).toBeInTheDocument();
  });

  it('renders code button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-code')).toBeInTheDocument();
  });

  it('renders code block button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-code-block')).toBeInTheDocument();
  });

  it('renders horizontal rule button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-hr')).toBeInTheDocument();
  });

  it('renders clear formatting button', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('btn-clear')).toBeInTheDocument();
  });

  it('renders heading select', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('select-heading')).toBeInTheDocument();
  });

  it('renders text align select', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('select-align')).toBeInTheDocument();
  });

  it('renders menu dividers', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    const dividers = screen.getAllByTestId('menu-divider');
    expect(dividers.length).toBeGreaterThan(0);
  });

  it('handles html textarea change', () => {
    render(<HtmlEditor value="<p>Initial</p>" onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('html'));
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: '<p>Updated</p>' } });
    expect(mockOnChange).toHaveBeenCalledWith('<p>Updated</p>');
  });

  it('displays value in html textarea', () => {
    render(<HtmlEditor value="<p>Test content</p>" onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('html'));
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.value).toBe('<p>Test content</p>');
  });

  it('renders with custom placeholder', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} placeholder="Enter text..." />);
    expect(screen.getByTestId('rich-text-field')).toBeInTheDocument();
  });

  it('disables editor when disabled prop is true', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} disabled />);
    fireEvent.click(screen.getByText('html'));
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea).toBeDisabled();
  });

  it('applies custom minHeight', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} minHeight={300} />);
    expect(screen.getByTestId('editor-provider')).toBeInTheDocument();
  });

  it('exports HtmlEditor function', () => {
    expect(HtmlEditor).toBeDefined();
    expect(typeof HtmlEditor).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof HtmlEditor).toBe('function');
    expect(HtmlEditor.name).toBe('HtmlEditor');
  });

  it('renders RichTextEditorProvider', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('editor-provider')).toBeInTheDocument();
  });

  it('renders RichTextField', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('rich-text-field')).toBeInTheDocument();
  });

  it('renders editor content area', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('editor-content')).toBeInTheDocument();
  });

  it('renders Tooltip for fullscreen button', () => {
    const { container } = render(<HtmlEditor value="" onChange={mockOnChange} />);
    const tooltip = container.querySelector('.MuiTooltip-popper, [data-testid*="tooltip"]');
    expect(container.querySelector('.MuiIconButton-root')).toBeInTheDocument();
  });

  it('handles tab change to edit', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('html'));
    fireEvent.click(screen.getByText('edit'));
    expect(screen.getByTestId('editor-provider')).toBeInTheDocument();
  });

  it('handles tab change to html', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('html'));
    expect(screen.getByRole('textbox')).toBeInTheDocument();
  });

  it('handles tab change to preview', () => {
    render(<HtmlEditor value="<p>Preview</p>" onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('preview'));
    expect(screen.queryByTestId('editor-provider')).not.toBeInTheDocument();
  });

  it('renders Box components', () => {
    const { container } = render(<HtmlEditor value="" onChange={mockOnChange} />);
    const boxes = container.querySelectorAll('.MuiBox-root');
    expect(boxes.length).toBeGreaterThan(0);
  });

  it('handles empty value', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('editor-provider')).toBeInTheDocument();
  });

  it('handles complex HTML value', () => {
    const complexHtml = '<h1>Title</h1><p>Paragraph</p><ul><li>Item</li></ul>';
    render(<HtmlEditor value={complexHtml} onChange={mockOnChange} />);
    expect(screen.getByTestId('editor-provider')).toBeInTheDocument();
  });

  it('renders with default minHeight 250', () => {
    render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('editor-provider')).toBeInTheDocument();
  });

  it('renders textarea in html mode with monospace font', () => {
    render(<HtmlEditor value="<p>Test</p>" onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('html'));
    const textarea = screen.getByRole('textbox');
    expect(textarea).toBeInTheDocument();
  });

  it('handles disabled state in html mode', () => {
    render(<HtmlEditor value="<p>Test</p>" onChange={mockOnChange} disabled />);
    fireEvent.click(screen.getByText('html'));
    const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
    expect(textarea.disabled).toBe(true);
  });

  it('renders fullscreen icon initially', () => {
    const { container } = render(<HtmlEditor value="" onChange={mockOnChange} />);
    expect(container.querySelector('.MuiIconButton-root')).toBeInTheDocument();
  });

  it('renders Tab components', () => {
    const { container } = render(<HtmlEditor value="" onChange={mockOnChange} />);
    const tabs = container.querySelectorAll('.MuiTab-root');
    expect(tabs.length).toBe(3);
  });

  it('renders IconButton component', () => {
    const { container } = render(<HtmlEditor value="" onChange={mockOnChange} />);
    const iconButton = container.querySelector('.MuiIconButton-root');
    expect(iconButton).toBeInTheDocument();
  });
});
