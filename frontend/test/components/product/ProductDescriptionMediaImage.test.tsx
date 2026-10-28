import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ProductDescriptionMediaImage } from '@/components/product/product-description/ProductDescriptionMediaImage';

describe('ProductDescriptionMediaImage', () => {
  it('cho Vùng 3 cuộn ngang với kích thước đọc được trên mobile', () => {
    render(
      <ProductDescriptionMediaImage
        src="https://cdn.example.com/bottom.webp"
        alt="Sơ mi kiểu Josie - bottom"
        testId="bottom-image"
        mobileHorizontalScroll
      />,
    );

    const region = document.querySelector(
      '[data-description-block="bottom-image"]',
    );
    const image = screen.getByRole('img', { name: /bottom/i });

    expect(region).toHaveClass(
      'max-w-full',
      'overflow-x-auto',
      'overscroll-x-contain',
      'md:overflow-visible',
    );
    expect(image).toHaveClass(
      'h-[420px]',
      'w-auto',
      'max-w-none',
      'sm:h-[480px]',
      'md:h-auto',
      'md:w-full',
      'md:max-w-full',
    );
  });

  it('cuộn Vùng 3 theo từng đoạn và cập nhật nút theo vị trí', () => {
    render(
      <ProductDescriptionMediaImage
        src="https://cdn.example.com/bottom.webp"
        alt="Sơ mi kiểu Josie - bottom"
        testId="bottom-image"
        mobileHorizontalScroll
      />,
    );

    const region = document.querySelector(
      '[data-description-block="bottom-image"]',
    ) as HTMLDivElement;
    const image = screen.getByRole('img', { name: /bottom/i });
    const scrollBy = vi.fn();

    Object.defineProperties(region, {
      clientWidth: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 900 },
      scrollLeft: { configurable: true, value: 0, writable: true },
      scrollBy: { configurable: true, value: scrollBy },
    });

    fireEvent.load(image);

    expect(
      screen.queryByRole('button', { name: 'previousImage' }),
    ).not.toBeInTheDocument();
    const nextButton = screen.getByRole('button', { name: 'nextImage' });

    fireEvent.click(nextButton);
    expect(scrollBy).toHaveBeenCalledWith({
      left: 225,
      behavior: 'smooth',
    });

    region.scrollLeft = 300;
    fireEvent.scroll(region);
    expect(
      screen.getByRole('button', { name: 'previousImage' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'nextImage' }),
    ).toBeInTheDocument();

    screen.getByRole('button', { name: 'nextImage' }).focus();
    region.scrollLeft = 600;
    fireEvent.scroll(region);
    const previousButton = screen.getByRole('button', {
      name: 'previousImage',
    });
    expect(previousButton).toHaveFocus();
    expect(
      screen.queryByRole('button', { name: 'nextImage' }),
    ).not.toBeInTheDocument();

    region.scrollLeft = 0;
    fireEvent.scroll(region);
    expect(screen.getByRole('button', { name: 'nextImage' })).toHaveFocus();
  });

  it('không hiện nút khi Vùng 3 không tràn ngang', () => {
    render(
      <ProductDescriptionMediaImage
        src="https://cdn.example.com/bottom.webp"
        alt="Sơ mi kiểu Josie - bottom"
        testId="bottom-image"
        mobileHorizontalScroll
      />,
    );

    const region = document.querySelector(
      '[data-description-block="bottom-image"]',
    ) as HTMLDivElement;
    const image = screen.getByRole('img', { name: /bottom/i });

    Object.defineProperties(region, {
      clientWidth: { configurable: true, value: 300 },
      scrollWidth: { configurable: true, value: 300 },
      scrollLeft: { configurable: true, value: 0, writable: true },
    });

    fireEvent.load(image);

    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('giữ Vùng 1 responsive full-width và không cuộn ngang', () => {
    render(
      <ProductDescriptionMediaImage
        src="https://cdn.example.com/top.webp"
        alt="Sơ mi kiểu Josie - top"
        testId="top-image"
      />,
    );

    const region = document.querySelector(
      '[data-description-block="top-image"]',
    );
    const image = screen.getByRole('img', { name: /top/i });

    expect(region).not.toHaveClass('overflow-x-auto');
    expect(image).toHaveClass('h-auto', 'w-full');
    expect(image).not.toHaveClass('h-[420px]', 'max-w-none');
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
