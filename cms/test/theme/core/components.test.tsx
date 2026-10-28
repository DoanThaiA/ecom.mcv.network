import { describe, it, expect } from 'vitest';
import { components } from 'src/theme/core/components';

describe('components', () => {
  it('should export components object', () => {
    expect(components).toBeDefined();
    expect(typeof components).toBe('object');
  });

  it('should have MuiBackdrop component', () => {
    expect(components.MuiBackdrop).toBeDefined();
    expect(components.MuiBackdrop.styleOverrides).toBeDefined();
  });

  it('should have MuiButton component', () => {
    expect(components.MuiButton).toBeDefined();
    expect(components.MuiButton.defaultProps).toBeDefined();
    expect(components.MuiButton.defaultProps?.disableElevation).toBe(true);
    expect(components.MuiButton.styleOverrides).toBeDefined();
  });

  it('should have MuiCard component', () => {
    expect(components.MuiCard).toBeDefined();
    expect(components.MuiCard.styleOverrides).toBeDefined();
  });

  it('should have MuiCardHeader component', () => {
    expect(components.MuiCardHeader).toBeDefined();
    expect(components.MuiCardHeader.defaultProps).toBeDefined();
    expect(components.MuiCardHeader.defaultProps?.titleTypographyProps).toEqual({ variant: 'h6' });
    expect(components.MuiCardHeader.defaultProps?.subheaderTypographyProps).toEqual({
      variant: 'body2',
    });
    expect(components.MuiCardHeader.styleOverrides).toBeDefined();
  });

  it('should have MuiOutlinedInput component', () => {
    expect(components.MuiOutlinedInput).toBeDefined();
    expect(components.MuiOutlinedInput.styleOverrides).toBeDefined();
  });

  it('should have MuiPaper component', () => {
    expect(components.MuiPaper).toBeDefined();
    expect(components.MuiPaper.defaultProps).toBeDefined();
    expect(components.MuiPaper.defaultProps?.elevation).toBe(0);
    expect(components.MuiPaper.styleOverrides).toBeDefined();
  });

  it('should have MuiTableCell component', () => {
    expect(components.MuiTableCell).toBeDefined();
    expect(components.MuiTableCell.styleOverrides).toBeDefined();
  });

  it('should have MuiMenuItem component', () => {
    expect(components.MuiMenuItem).toBeDefined();
    expect(components.MuiMenuItem.styleOverrides).toBeDefined();
  });

  it('should have MuiLink component', () => {
    expect(components.MuiLink).toBeDefined();
    expect(components.MuiLink.defaultProps).toBeDefined();
    expect(components.MuiLink.defaultProps?.underline).toBe('hover');
  });

  it('should have MuiFormControlLabel component', () => {
    expect(components.MuiFormControlLabel).toBeDefined();
    expect(components.MuiFormControlLabel.styleOverrides).toBeDefined();
  });

  it('should have MuiCheckbox component', () => {
    expect(components.MuiCheckbox).toBeDefined();
    expect(components.MuiCheckbox.defaultProps).toBeDefined();
    expect(components.MuiCheckbox.defaultProps?.size).toBe('medium');
    expect(components.MuiCheckbox.defaultProps?.icon).toBeDefined();
    expect(components.MuiCheckbox.defaultProps?.checkedIcon).toBeDefined();
    expect(components.MuiCheckbox.defaultProps?.indeterminateIcon).toBeDefined();
    expect(components.MuiCheckbox.styleOverrides).toBeDefined();
  });

  it('should have MuiRadio component', () => {
    expect(components.MuiRadio).toBeDefined();
    expect(components.MuiRadio.defaultProps).toBeDefined();
    expect(components.MuiRadio.defaultProps?.size).toBe('small');
    expect(components.MuiRadio.defaultProps?.icon).toBeDefined();
    expect(components.MuiRadio.defaultProps?.checkedIcon).toBeDefined();
    expect(components.MuiRadio.styleOverrides).toBeDefined();
  });

  it('should have MuiSelect component', () => {
    expect(components.MuiSelect).toBeDefined();
    expect(components.MuiSelect.defaultProps).toBeDefined();
    expect(components.MuiSelect.defaultProps?.size).toBe('medium');
    expect(components.MuiSelect.styleOverrides).toBeDefined();
  });

  it('should have MuiFormLabel component', () => {
    expect(components.MuiFormLabel).toBeDefined();
    expect(components.MuiFormLabel.defaultProps).toBeDefined();
    expect(components.MuiFormLabel.styleOverrides).toBeDefined();
  });

  it('should have MuiTab component', () => {
    expect(components.MuiTab).toBeDefined();
    expect(components.MuiTab.defaultProps).toBeDefined();
    expect(components.MuiTab.defaultProps?.iconPosition).toBe('start');
    expect(components.MuiTab.styleOverrides).toBeDefined();
  });

  it('should have MuiTabs component', () => {
    expect(components.MuiTabs).toBeDefined();
    expect(components.MuiTabs.defaultProps).toBeDefined();
    expect(components.MuiTabs.styleOverrides).toBeDefined();
  });

  it('should have MuiSwitch component', () => {
    expect(components.MuiSwitch).toBeDefined();
    expect(components.MuiSwitch.styleOverrides).toBeDefined();
  });

  it('should have MuiAutocomplete component', () => {
    expect(components.MuiAutocomplete).toBeDefined();
    expect(components.MuiAutocomplete.defaultProps).toBeDefined();
  });

  it('should have MuiDialog component', () => {
    expect(components.MuiDialog).toBeDefined();
    expect(components.MuiDialog.defaultProps).toBeDefined();
  });

  it('should have exactly 18 MUI component overrides', () => {
    const componentKeys = Object.keys(components);
    expect(componentKeys).toHaveLength(19);
  });

  it('should have all component keys start with "Mui"', () => {
    const componentKeys = Object.keys(components);
    componentKeys.forEach((key) => {
      expect(key).toMatch(/^Mui/);
    });
  });
});
