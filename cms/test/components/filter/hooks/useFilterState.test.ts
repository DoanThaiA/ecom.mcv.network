import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilterState } from 'src/components/filter/hooks/useFilterState';

describe('useFilterState', () => {
  const initialValues = { search: '', status: '', price: { from: undefined, to: undefined } };

  it('initializes with provided values', () => {
    const { result } = renderHook(() => useFilterState({ initialValues }));
    expect(result.current.values).toEqual(initialValues);
  });

  it('sets single value', () => {
    const { result } = renderHook(() => useFilterState({ initialValues }));
    act(() => { result.current.setValue('search', 'test'); });
    expect(result.current.values.search).toBe('test');
  });

  it('sets multiple values', () => {
    const { result } = renderHook(() => useFilterState({ initialValues }));
    act(() => { result.current.setValues({ search: 'test', status: 'active' }); });
    expect(result.current.values.search).toBe('test');
    expect(result.current.values.status).toBe('active');
  });

  it('calls onChange when value set', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useFilterState({ initialValues, onChange }));
    act(() => { result.current.setValue('search', 'test'); });
    expect(onChange).toHaveBeenCalledWith({ ...initialValues, search: 'test' });
  });

  it('calls onChange when values set', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useFilterState({ initialValues, onChange }));
    act(() => { result.current.setValues({ search: 'test', status: 'active' }); });
    expect(onChange).toHaveBeenCalledWith({ ...initialValues, search: 'test', status: 'active' });
  });

  it('resets to initial values', () => {
    const { result } = renderHook(() => useFilterState({ initialValues }));
    act(() => { result.current.setValue('search', 'test'); });
    act(() => { result.current.reset(); });
    expect(result.current.values).toEqual(initialValues);
  });

  it('calls onChange on reset', () => {
    const onChange = vi.fn();
    const { result } = renderHook(() => useFilterState({ initialValues, onChange }));
    act(() => { result.current.setValue('search', 'test'); });
    act(() => { result.current.reset(); });
    expect(onChange).toHaveBeenLastCalledWith(initialValues);
  });

  it('counts active filters excluding empty strings', () => {
    const { result } = renderHook(() => useFilterState({ initialValues }));
    expect(result.current.activeCount).toBe(0);
    act(() => { result.current.setValue('search', 'test'); });
    expect(result.current.activeCount).toBe(1);
  });

  it('counts active filters excluding null', () => {
    const { result } = renderHook(() => useFilterState({ initialValues }));
    act(() => { result.current.setValue('status', null); });
    expect(result.current.activeCount).toBe(0);
  });

  it('counts active filters excluding undefined', () => {
    const { result } = renderHook(() => useFilterState({ initialValues }));
    act(() => { result.current.setValue('status', undefined); });
    expect(result.current.activeCount).toBe(0);
  });

  it('counts boolean false as active', () => {
    const values = { ...initialValues, active: false };
    const { result } = renderHook(() => useFilterState({ initialValues: values }));
    act(() => { result.current.setValue('active', false); });
    expect(result.current.activeCount).toBe(1);
  });

  it('counts boolean true as active', () => {
    const values = { ...initialValues, active: true };
    const { result } = renderHook(() => useFilterState({ initialValues: values }));
    act(() => { result.current.setValue('active', true); });
    expect(result.current.activeCount).toBe(1);
  });

  it('counts active filters excluding empty range', () => {
    const { result } = renderHook(() => useFilterState({ initialValues }));
    act(() => { result.current.setValue('price', { from: undefined, to: undefined }); });
    expect(result.current.activeCount).toBe(0);
  });

  it('counts active filters with from value in range', () => {
    const { result } = renderHook(() => useFilterState({ initialValues }));
    act(() => { result.current.setValue('price', { from: 100, to: undefined }); });
    expect(result.current.activeCount).toBe(1);
  });

  it('counts active filters with to value in range', () => {
    const { result } = renderHook(() => useFilterState({ initialValues }));
    act(() => { result.current.setValue('price', { from: undefined, to: 200 }); });
    expect(result.current.activeCount).toBe(1);
  });

  it('counts active filters with both from and to in range', () => {
    const { result } = renderHook(() => useFilterState({ initialValues }));
    act(() => { result.current.setValue('price', { from: 100, to: 200 }); });
    expect(result.current.activeCount).toBe(1);
  });

  it('counts multiple active filters', () => {
    const { result } = renderHook(() => useFilterState({ initialValues }));
    act(() => {
      result.current.setValues({
        search: 'test',
        status: 'active',
        price: { from: 100, to: 200 },
      });
    });
    expect(result.current.activeCount).toBe(3);
  });

  it('preserves other values when setting single value', () => {
    const { result } = renderHook(() => useFilterState({ initialValues }));
    act(() => { result.current.setValue('search', 'test'); });
    act(() => { result.current.setValue('status', 'active'); });
    expect(result.current.values.search).toBe('test');
    expect(result.current.values.status).toBe('active');
  });

  it('preserves other values when setting multiple values', () => {
    const { result } = renderHook(() => useFilterState({ initialValues }));
    act(() => { result.current.setValue('search', 'test'); });
    act(() => { result.current.setValues({ status: 'active' }); });
    expect(result.current.values.search).toBe('test');
    expect(result.current.values.status).toBe('active');
  });

  it('handles number values', () => {
    const values = { ...initialValues, count: 0 };
    const { result } = renderHook(() => useFilterState({ initialValues: values }));
    act(() => { result.current.setValue('count', 42); });
    expect(result.current.values.count).toBe(42);
    expect(result.current.activeCount).toBe(1);
  });
});
