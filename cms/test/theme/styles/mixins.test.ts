import { describe, it, expect } from 'vitest';
import {
  hideScrollX,
  hideScrollY,
  textGradient,
  bgGradient,
  bgBlur,
  type BgGradientProps,
  type BgBlurProps,
} from 'src/theme/styles/mixins';

describe('theme/styles/mixins', () => {
  describe('hideScrollX', () => {
    it('exports hideScrollX object', () => {
      expect(hideScrollX).toBeDefined();
      expect(typeof hideScrollX).toBe('object');
    });

    it('has msOverflowStyle property', () => {
      expect(hideScrollX.msOverflowStyle).toBe('none');
    });

    it('has scrollbarWidth property', () => {
      expect(hideScrollX.scrollbarWidth).toBe('none');
    });

    it('has overflowX property', () => {
      expect(hideScrollX.overflowX).toBe('auto');
    });

    it('has webkit scrollbar hiding', () => {
      expect(hideScrollX['&::-webkit-scrollbar']).toEqual({ display: 'none' });
    });
  });

  describe('hideScrollY', () => {
    it('exports hideScrollY object', () => {
      expect(hideScrollY).toBeDefined();
      expect(typeof hideScrollY).toBe('object');
    });

    it('has msOverflowStyle property', () => {
      expect(hideScrollY.msOverflowStyle).toBe('none');
    });

    it('has scrollbarWidth property', () => {
      expect(hideScrollY.scrollbarWidth).toBe('none');
    });

    it('has overflowY property', () => {
      expect(hideScrollY.overflowY).toBe('auto');
    });

    it('has webkit scrollbar hiding', () => {
      expect(hideScrollY['&::-webkit-scrollbar']).toEqual({ display: 'none' });
    });
  });

  describe('textGradient', () => {
    it('returns CSS object with gradient background', () => {
      const result = textGradient('to right, #000, #fff');
      
      expect(result.background).toBe('linear-gradient(to right, #000, #fff)');
      expect(result.WebkitBackgroundClip).toBe('text');
      expect(result.WebkitTextFillColor).toBe('transparent');
      expect(result.backgroundClip).toBe('text');
      expect(result.textFillColor).toBe('transparent');
      expect(result.color).toBe('transparent');
    });

    it('works with single color', () => {
      const result = textGradient('#ff0000');
      expect(result.background).toBe('linear-gradient(#ff0000)');
    });

    it('works with complex gradient string', () => {
      const gradient = 'to right, rgba(0,0,0,0.8) 25%, rgba(255,0,0,0.5)';
      const result = textGradient(gradient);
      expect(result.background).toBe(`linear-gradient(${gradient})`);
    });
  });

  describe('bgGradient', () => {
    it('returns CSS object with gradient only when no imgUrl', () => {
      const props: BgGradientProps = {
        color: 'to right, #000, #fff',
      };
      const result = bgGradient(props);
      
      expect(result.background).toBe('linear-gradient(to right, #000, #fff)');
      expect(result.backgroundSize).toBeUndefined();
    });

    it('returns CSS object with gradient and image when imgUrl provided', () => {
      const props: BgGradientProps = {
        color: 'to right, #000, #fff',
        imgUrl: '/assets/bg.jpg',
      };
      const result = bgGradient(props);
      
      expect(result.background).toBe('linear-gradient(to right, #000, #fff), url(/assets/bg.jpg)');
      expect(result.backgroundSize).toBe('cover');
      expect(result.backgroundRepeat).toBe('no-repeat');
      expect(result.backgroundPosition).toBe('center center');
    });

    it('handles empty imgUrl', () => {
      const props: BgGradientProps = {
        color: 'to bottom, red, blue',
        imgUrl: '',
      };
      const result = bgGradient(props);
      
      // Empty string is falsy, should use gradient-only path
      expect(result.background).toBe('linear-gradient(to bottom, red, blue)');
    });
  });

  describe('bgBlur', () => {
    it('returns CSS object with blur only when no imgUrl', () => {
      const props: BgBlurProps = {
        color: 'rgba(255, 255, 255, 0.8)',
      };
      const result = bgBlur(props);
      
      expect(result.backdropFilter).toBe('blur(6px)');
      expect(result.WebkitBackdropFilter).toBe('blur(6px)');
      expect(result.backgroundColor).toBe('rgba(255, 255, 255, 0.8)');
      expect(result.position).toBeUndefined();
    });

    it('returns CSS object with custom blur value', () => {
      const props: BgBlurProps = {
        color: 'rgba(0, 0, 0, 0.5)',
        blur: 10,
      };
      const result = bgBlur(props);
      
      expect(result.backdropFilter).toBe('blur(10px)');
      expect(result.WebkitBackdropFilter).toBe('blur(10px)');
    });

    it('uses default blur value of 6 when not provided', () => {
      const props: BgBlurProps = {
        color: 'rgba(0, 0, 0, 0.5)',
      };
      const result = bgBlur(props);
      
      expect(result.backdropFilter).toBe('blur(6px)');
    });

    it('returns CSS object with image and before pseudo-element when imgUrl provided', () => {
      const props: BgBlurProps = {
        color: 'rgba(255, 255, 255, 0.8)',
        blur: 8,
        imgUrl: '/assets/overlay.png',
      };
      const result = bgBlur(props);
      
      expect(result.position).toBe('relative');
      expect(result.backgroundImage).toBe('url(/assets/overlay.png)');
      expect(result['&::before']).toBeDefined();
      
      const before = result['&::before'] as any;
      expect(before.position).toBe('absolute');
      expect(before.top).toBe(0);
      expect(before.left).toBe(0);
      expect(before.zIndex).toBe(9);
      expect(before.content).toBe('""');
      expect(before.width).toBe('100%');
      expect(before.height).toBe('100%');
      expect(before.backdropFilter).toBe('blur(8px)');
      expect(before.WebkitBackdropFilter).toBe('blur(8px)');
      expect(before.backgroundColor).toBe('rgba(255, 255, 255, 0.8)');
    });

    it('handles empty imgUrl', () => {
      const props: BgBlurProps = {
        color: 'rgba(0, 0, 0, 0.5)',
        imgUrl: '',
      };
      const result = bgBlur(props);
      
      // Empty string is falsy, should use blur-only path
      expect(result.backdropFilter).toBe('blur(6px)');
      expect(result.position).toBeUndefined();
    });
  });
});
