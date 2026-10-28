import { describe, it, expect, expectTypeOf } from 'vitest';
import type { SvgColorProps } from 'src/components/svg-color/types';
import type { BoxProps } from '@mui/material/Box';

describe('SvgColorProps', () => {
  it('exports SvgColorProps type', () => {
    // Type-only test - if this compiles, the type exists
    expectTypeOf<SvgColorProps>().not.toBeAny();
  });

  it('extends BoxProps', () => {
    // SvgColorProps should be assignable to BoxProps
    expectTypeOf<SvgColorProps>().toMatchTypeOf<Partial<BoxProps>>();
  });

  it('requires src property', () => {
    // @ts-expect-error - src is required
    const props: SvgColorProps = {};
    expect(props).toBeDefined();
  });

  it('accepts src as string', () => {
    const props: SvgColorProps = {
      src: '/path/to/image.svg',
    };
    expect(props.src).toBe('/path/to/image.svg');
  });

  it('accepts BoxProps properties', () => {
    const props: SvgColorProps = {
      src: '/image.svg',
      sx: { width: 100, height: 100 },
      className: 'svg-test',
    };
    expect(props).toBeDefined();
    expect(props.src).toBe('/image.svg');
  });

  it('src property is string type', () => {
    const props: SvgColorProps = {
      src: 'test.svg',
    };
    expectTypeOf(props.src).toBeString();
  });

  it('has required src field', () => {
    type RequiredKeys = Required<SvgColorProps>;
    expectTypeOf<RequiredKeys>().toHaveProperty('src');
  });

  it('can have all BoxProps', () => {
    const props: SvgColorProps = {
      src: '/icon.svg',
      sx: { m: 2, p: 1 },
      component: 'span',
      className: 'custom-svg',
    };
    expect(props.src).toBe('/icon.svg');
  });

  it('src cannot be number', () => {
    // @ts-expect-error - src must be string, not number
    const props: SvgColorProps = {
      src: 123,
    };
    expect(props).toBeDefined();
  });

  it('src cannot be boolean', () => {
    // @ts-expect-error - src must be string, not boolean
    const props: SvgColorProps = {
      src: true,
    };
    expect(props).toBeDefined();
  });
});
