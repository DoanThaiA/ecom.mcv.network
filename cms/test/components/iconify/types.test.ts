import { describe, it, expect, expectTypeOf } from 'vitest';
import type { IconifyProps } from 'src/components/iconify/types';
import type { BoxProps } from '@mui/material/Box';
import type { IconProps } from '@iconify/react';

describe('IconifyProps', () => {
  it('exports IconifyProps type', () => {
    // Type-only test - if this compiles, the type exists
    expectTypeOf<IconifyProps>().not.toBeAny();
  });

  it('extends BoxProps', () => {
    // IconifyProps should be assignable to BoxProps
    expectTypeOf<IconifyProps>().toMatchTypeOf<Partial<BoxProps>>();
  });

  it('extends IconProps', () => {
    // IconifyProps should be assignable to IconProps
    expectTypeOf<IconifyProps>().toMatchTypeOf<Partial<IconProps>>();
  });

  it('accepts BoxProps properties', () => {
    const props: IconifyProps = {
      sx: { color: 'red' },
      className: 'test',
    };
    expect(props).toBeDefined();
  });

  it('accepts IconProps properties', () => {
    const props: IconifyProps = {
      icon: 'mdi:home',
      width: 24,
      height: 24,
    };
    expect(props).toBeDefined();
  });

  it('accepts combined BoxProps and IconProps', () => {
    const props: IconifyProps = {
      icon: 'mdi:home',
      width: 24,
      sx: { color: 'blue' },
      className: 'icon-test',
    };
    expect(props).toBeDefined();
  });

  it('is intersection type', () => {
    // Test that it combines both types
    const props: IconifyProps = {};
    expectTypeOf(props).toMatchTypeOf<BoxProps & IconProps>();
  });

  it('can be empty object', () => {
    const props: IconifyProps = {};
    expect(props).toEqual({});
  });
});
