import { describe, it, expect } from 'vitest';
import type { ScrollbarProps } from 'src/components/scrollbar/types';

describe('components/scrollbar/types', () => {
  describe('ScrollbarProps', () => {
    it('type is valid with minimal props', () => {
      const props: ScrollbarProps = {};
      expect(props).toBeDefined();
    });

    it('type accepts sx prop', () => {
      const props: ScrollbarProps = {
        sx: { padding: 2 },
      };
      expect(props.sx).toEqual({ padding: 2 });
    });

    it('type accepts children prop', () => {
      const props: ScrollbarProps = {
        children: 'test content',
      };
      expect(props.children).toBe('test content');
    });

    it('type accepts fillContent prop', () => {
      const props: ScrollbarProps = {
        fillContent: true,
      };
      expect(props.fillContent).toBe(true);
    });

    it('type accepts slotProps with wrapper', () => {
      const props: ScrollbarProps = {
        slotProps: {
          wrapper: { padding: 1 },
        },
      };
      expect(props.slotProps?.wrapper).toEqual({ padding: 1 });
    });

    it('type accepts slotProps with contentWrapper', () => {
      const props: ScrollbarProps = {
        slotProps: {
          contentWrapper: { margin: 2 },
        },
      };
      expect(props.slotProps?.contentWrapper).toEqual({ margin: 2 });
    });

    it('type accepts slotProps with content', () => {
      const props: ScrollbarProps = {
        slotProps: {
          content: { display: 'flex' },
        },
      };
      expect(props.slotProps?.content).toEqual({ display: 'flex' });
    });

    it('type accepts all slotProps together', () => {
      const props: ScrollbarProps = {
        slotProps: {
          wrapper: { padding: 1 },
          contentWrapper: { margin: 2 },
          content: { display: 'flex' },
        },
      };
      expect(props.slotProps).toBeDefined();
      expect(props.slotProps?.wrapper).toEqual({ padding: 1 });
      expect(props.slotProps?.contentWrapper).toEqual({ margin: 2 });
      expect(props.slotProps?.content).toEqual({ display: 'flex' });
    });

    it('type accepts all props together', () => {
      const props: ScrollbarProps = {
        sx: { padding: 2 },
        children: 'content',
        fillContent: true,
        slotProps: {
          wrapper: { padding: 1 },
          contentWrapper: { margin: 2 },
          content: { display: 'flex' },
        },
      };
      expect(props.sx).toEqual({ padding: 2 });
      expect(props.children).toBe('content');
      expect(props.fillContent).toBe(true);
      expect(props.slotProps).toBeDefined();
    });

    it('fillContent can be false', () => {
      const props: ScrollbarProps = {
        fillContent: false,
      };
      expect(props.fillContent).toBe(false);
    });

    it('children can be React elements', () => {
      const props: ScrollbarProps = {
        children: null,
      };
      expect(props.children).toBeNull();
    });

    it('slotProps is optional', () => {
      const props: ScrollbarProps = {
        sx: { padding: 1 },
      };
      expect(props.slotProps).toBeUndefined();
    });
  });
});
