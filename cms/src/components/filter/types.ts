export type RangeValue = { from?: number; to?: number };

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  width?: number;
  children: React.ReactNode;
  onApply: () => void;
  onClear: () => void;
  loading?: boolean;
}

export interface FilterSelectProps {
  value: string | number;
  options: SelectOption[];
  onChange: (value: string | number) => void;
  placeholder?: string;
  fullWidth?: boolean;
  size?: 'small' | 'medium';
}

export interface FilterRangeInputProps {
  value: RangeValue;
  onChange: (value: RangeValue) => void;
  placeholderFrom?: string;
  placeholderTo?: string;
  typeSelector?: {
    label: string;
    value: string;
    options: SelectOption[];
    onChange: (value: string) => void;
  };
}

export interface FilterCheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export interface FilterButtonProps {
  onClick: () => void;
  activeCount: number;
}

export interface FilterActionsProps {
  onClear: () => void;
  onApply: () => void;
  loading?: boolean;
}
