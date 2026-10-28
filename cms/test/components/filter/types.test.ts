import { describe, it, expect } from 'vitest';
import type {
  RangeValue,
  SelectOption,
  FilterDrawerProps,
  FilterSelectProps,
  FilterRangeInputProps,
  FilterCheckboxProps,
  FilterButtonProps,
  FilterActionsProps,
} from 'src/components/filter/types';

describe('components/filter/types', () => {
  describe('RangeValue', () => {
    it('type is valid with both values', () => {
      const range: RangeValue = { from: 0, to: 100 };
      expect(range).toBeDefined();
      expect(range.from).toBe(0);
      expect(range.to).toBe(100);
    });

    it('type is valid with only from', () => {
      const range: RangeValue = { from: 10 };
      expect(range).toBeDefined();
      expect(range.from).toBe(10);
    });

    it('type is valid with only to', () => {
      const range: RangeValue = { to: 50 };
      expect(range).toBeDefined();
      expect(range.to).toBe(50);
    });

    it('type is valid with empty object', () => {
      const range: RangeValue = {};
      expect(range).toBeDefined();
    });
  });

  describe('SelectOption', () => {
    it('type is valid with string value', () => {
      const option: SelectOption = {
        value: 'option1',
        label: 'Option 1',
      };
      expect(option).toBeDefined();
      expect(option.value).toBe('option1');
      expect(option.label).toBe('Option 1');
    });

    it('type is valid with number value', () => {
      const option: SelectOption = {
        value: 1,
        label: 'Option 1',
      };
      expect(option).toBeDefined();
      expect(option.value).toBe(1);
    });
  });

  describe('FilterDrawerProps', () => {
    it('type is valid with required fields', () => {
      const props: FilterDrawerProps = {
        open: true,
        onClose: () => {},
        children: null,
        onApply: () => {},
        onClear: () => {},
      };
      expect(props).toBeDefined();
    });

    it('type is valid with all fields', () => {
      const props: FilterDrawerProps = {
        open: true,
        onClose: () => {},
        title: 'Filter Title',
        width: 400,
        children: null,
        onApply: () => {},
        onClear: () => {},
        loading: true,
      };
      expect(props).toBeDefined();
      expect(props.title).toBe('Filter Title');
      expect(props.width).toBe(400);
      expect(props.loading).toBe(true);
    });
  });

  describe('FilterSelectProps', () => {
    it('type is valid with required fields', () => {
      const props: FilterSelectProps = {
        value: 'test',
        options: [],
        onChange: () => {},
      };
      expect(props).toBeDefined();
    });

    it('type is valid with all fields', () => {
      const props: FilterSelectProps = {
        value: 'test',
        options: [{ value: 'test', label: 'Test' }],
        onChange: () => {},
        placeholder: 'Select...',
        fullWidth: true,
        size: 'small',
      };
      expect(props).toBeDefined();
    });
  });

  describe('FilterRangeInputProps', () => {
    it('type is valid with required fields', () => {
      const props: FilterRangeInputProps = {
        value: { from: 0, to: 100 },
        onChange: () => {},
      };
      expect(props).toBeDefined();
    });

    it('type is valid with all fields', () => {
      const props: FilterRangeInputProps = {
        value: { from: 0, to: 100 },
        onChange: () => {},
        placeholderFrom: 'From',
        placeholderTo: 'To',
        typeSelector: {
          label: 'Type',
          value: 'price',
          options: [],
          onChange: () => {},
        },
      };
      expect(props).toBeDefined();
    });
  });

  describe('FilterCheckboxProps', () => {
    it('type is valid', () => {
      const props: FilterCheckboxProps = {
        label: 'Show active',
        checked: true,
        onChange: () => {},
      };
      expect(props).toBeDefined();
      expect(props.label).toBe('Show active');
      expect(props.checked).toBe(true);
    });
  });

  describe('FilterButtonProps', () => {
    it('type is valid', () => {
      const props: FilterButtonProps = {
        onClick: () => {},
        activeCount: 3,
      };
      expect(props).toBeDefined();
      expect(props.activeCount).toBe(3);
    });

    it('type is valid with zero count', () => {
      const props: FilterButtonProps = {
        onClick: () => {},
        activeCount: 0,
      };
      expect(props).toBeDefined();
      expect(props.activeCount).toBe(0);
    });
  });

  describe('FilterActionsProps', () => {
    it('type is valid with required fields', () => {
      const props: FilterActionsProps = {
        onClear: () => {},
        onApply: () => {},
      };
      expect(props).toBeDefined();
    });

    it('type is valid with loading', () => {
      const props: FilterActionsProps = {
        onClear: () => {},
        onApply: () => {},
        loading: true,
      };
      expect(props).toBeDefined();
      expect(props.loading).toBe(true);
    });
  });
});
