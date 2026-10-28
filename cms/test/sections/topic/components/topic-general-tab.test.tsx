import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TopicGeneralTab, type TopicFormData } from 'src/sections/topic/components/topic-general-tab';
import { TopicStatus } from 'src/types/gen/shared/shared/common/enums';

const mockOnChange = vi.fn();

const mockFormData: TopicFormData = {
  name: 'Test Topic',
  order: 1,
  status: TopicStatus.TOPIC_STATUS_ACTIVE,
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('TopicGeneralTab', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without crashing', () => {
    const { container } = render(
      <TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />
    );
    expect(container).toBeInTheDocument();
  });

  it('renders topic title label', () => {
    render(<TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />);
    expect(screen.getByText('topicTitle')).toBeInTheDocument();
  });

  it('renders name input', () => {
    render(<TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText('topicTitle');
    expect(input).toBeInTheDocument();
  });

  it('displays name value', () => {
    render(<TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText('topicTitle');
    expect(input).toHaveValue('Test Topic');
  });

  it('calls onChange when name changes', () => {
    render(<TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText('topicTitle');
    fireEvent.change(input, { target: { value: 'New Topic' } });
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockFormData,
      name: 'New Topic',
    });
  });

  it('renders order label', () => {
    render(<TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />);
    expect(screen.getByText('order')).toBeInTheDocument();
  });

  it('renders order select', () => {
    const { container } = render(
      <TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />
    );
    const select = container.querySelector('.MuiSelect-select');
    expect(select).toBeInTheDocument();
  });

  it('displays order value', () => {
    const { container } = render(
      <TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />
    );
    const select = container.querySelector('.MuiSelect-select');
    expect(select).toHaveTextContent('1');
  });

  it('renders status label', () => {
    render(<TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />);
    expect(screen.getByText('status')).toBeInTheDocument();
  });

  it('renders active radio button', () => {
    render(<TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />);
    expect(screen.getByLabelText('active')).toBeInTheDocument();
  });

  it('renders inactive radio button', () => {
    render(<TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />);
    expect(screen.getByLabelText('inactive')).toBeInTheDocument();
  });

  it('active radio is checked when status is active', () => {
    render(<TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />);
    const activeRadio = screen.getByLabelText('active') as HTMLInputElement;
    expect(activeRadio.checked).toBe(true);
  });

  it('calls onChange when status changes to inactive', () => {
    render(<TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />);
    const inactiveRadio = screen.getByLabelText('inactive');
    fireEvent.click(inactiveRadio);
    expect(mockOnChange).toHaveBeenCalledWith({
      ...mockFormData,
      status: 'inactive',
    });
  });

  it('disables inputs when loading', () => {
    render(<TopicGeneralTab formData={mockFormData} onChange={mockOnChange} loading />);
    const input = screen.getByPlaceholderText('topicTitle');
    expect(input).toBeDisabled();
  });

  it('exports TopicGeneralTab function', () => {
    expect(TopicGeneralTab).toBeDefined();
    expect(typeof TopicGeneralTab).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof TopicGeneralTab).toBe('function');
    expect(TopicGeneralTab.name).toBe('TopicGeneralTab');
  });

  it('renders Card component', () => {
    const { container } = render(
      <TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />
    );
    const card = container.querySelector('.MuiCard-root');
    expect(card).toBeInTheDocument();
  });

  it('renders Stack component', () => {
    const { container } = render(
      <TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />
    );
    const stack = container.querySelector('.MuiStack-root');
    expect(stack).toBeInTheDocument();
  });

  it('renders TextField component', () => {
    const { container } = render(
      <TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />
    );
    const textField = container.querySelector('.MuiTextField-root');
    expect(textField).toBeInTheDocument();
  });

  it('renders required indicators', () => {
    const { container } = render(
      <TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />
    );
    const requiredSpans = container.querySelectorAll('span[style*="red"]');
    expect(requiredSpans.length).toBe(3);
  });

  it('handles empty name', () => {
    const emptyFormData = { ...mockFormData, name: '' };
    render(<TopicGeneralTab formData={emptyFormData} onChange={mockOnChange} />);
    const input = screen.getByPlaceholderText('topicTitle');
    expect(input).toHaveValue('');
  });

  it('handles order 0', () => {
    const zeroOrderFormData = { ...mockFormData, order: 0 };
    const { container } = render(
      <TopicGeneralTab formData={zeroOrderFormData} onChange={mockOnChange} />
    );
    const select = container.querySelector('.MuiSelect-select');
    expect(select).toHaveTextContent('pleaseSelect');
  });

  it('handles inactive status', () => {
    const inactiveFormData = { ...mockFormData, status: 'inactive' as any };
    render(<TopicGeneralTab formData={inactiveFormData} onChange={mockOnChange} />);
    const inactiveRadio = screen.getByLabelText('inactive') as HTMLInputElement;
    expect(inactiveRadio.checked).toBe(true);
  });

  it('renders FormControl component', () => {
    const { container } = render(
      <TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />
    );
    const formControls = container.querySelectorAll('.MuiFormControl-root');
    expect(formControls.length).toBeGreaterThan(0);
  });

  it('renders RadioGroup component', () => {
    const { container } = render(
      <TopicGeneralTab formData={mockFormData} onChange={mockOnChange} />
    );
    const radioGroup = container.querySelector('.MuiRadioGroup-root');
    expect(radioGroup).toBeInTheDocument();
  });

  it('exports TopicFormData type', () => {
    const data: TopicFormData = {
      name: 'test',
      order: 1,
      status: TopicStatus.TOPIC_STATUS_ACTIVE,
    };
    expect(data.name).toBe('test');
  });
});
