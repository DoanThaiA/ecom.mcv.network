import { describe, it, expect } from 'vitest';
import type { ScrollbarProps } from 'src/components/scrollbar/types';
import type { Theme } from '@mui/material/styles';

describe('ScrollbarProps type', () => {
  it('accepts valid ScrollbarProps with all properties', () => {
    const props: ScrollbarProps = {
      sx: { height: '100%' },
      children: 'Content',
      fillContent: true,
      slotProps: {
        wrapper: { padding: 2 },
        contentWrapper: { margin: 1 },
        content: { display: 'flex' },
      },
    };

    expect(props.sx).toEqual({ height: '100%' });
    expect(props.children).toBe('Content');
    expect(props.fillContent).toBe(true);
    expect(props.slotProps?.wrapper).toEqual({ padding: 2 });
    expect(props.slotProps?.contentWrapper).toEqual({ margin: 1 });
    expect(props.slotProps?.content).toEqual({ display: 'flex' });
  });

  it('accepts ScrollbarProps with only sx', () => {
    const props: ScrollbarProps = {
      sx: { width: '100%' },
    };

    expect(props.sx).toEqual({ width: '100%' });
    expect(props.children).toBeUndefined();
    expect(props.fillContent).toBeUndefined();
    expect(props.slotProps).toBeUndefined();
  });

  it('accepts ScrollbarProps with only children', () => {
    const props: ScrollbarProps = {
      children: 'Test content',
    };

    expect(props.children).toBe('Test content');
    expect(props.sx).toBeUndefined();
  });

  it('accepts ScrollbarProps with only fillContent', () => {
    const props: ScrollbarProps = {
      fillContent: false,
    };

    expect(props.fillContent).toBe(false);
  });

  it('accepts ScrollbarProps with partial slotProps', () => {
    const props: ScrollbarProps = {
      slotProps: {
        wrapper: { backgroundColor: 'red' },
      },
    };

    expect(props.slotProps?.wrapper).toEqual({ backgroundColor: 'red' });
    expect(props.slotProps?.contentWrapper).toBeUndefined();
    expect(props.slotProps?.content).toBeUndefined();
  });

  it('accepts ScrollbarProps with React node children', () => {
    const props: ScrollbarProps = {
      children: { type: 'div', props: {} } as any,
    };

    expect(props.children).toBeDefined();
  });

  it('accepts ScrollbarProps with empty slotProps', () => {
    const props: ScrollbarProps = {
      slotProps: {},
    };

    expect(props.slotProps).toEqual({});
  });

  it('accepts ScrollbarProps with all optional fields undefined', () => {
    const props: ScrollbarProps = {};

    expect(props.sx).toBeUndefined();
    expect(props.children).toBeUndefined();
    expect(props.fillContent).toBeUndefined();
    expect(props.slotProps).toBeUndefined();
  });

  it('accepts ScrollbarProps with complex sx styles', () => {
    const props: ScrollbarProps = {
      sx: {
        height: '100%',
        width: '100%',
        '&:hover': {
          backgroundColor: 'grey.200',
        },
      },
    };

    expect(props.sx).toHaveProperty('height', '100%');
    expect(props.sx).toHaveProperty('width', '100%');
  });

  it('accepts ScrollbarProps with nested slotProps content', () => {
    const props: ScrollbarProps = {
      slotProps: {
        wrapper: { p: 2, m: 1 },
        contentWrapper: { bgcolor: 'background.paper' },
        content: { display: 'grid', gap: 2 },
      },
    };

    expect(props.slotProps?.wrapper).toHaveProperty('p', 2);
    expect(props.slotProps?.contentWrapper).toHaveProperty('bgcolor', 'background.paper');
    expect(props.slotProps?.content).toHaveProperty('display', 'grid');
  });
});
