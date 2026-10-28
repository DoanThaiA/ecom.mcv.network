import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { NotFoundView } from 'src/sections/error/not-found-view';

describe('NotFoundView', () => {
  const renderComponent = () => {
    return render(
      <BrowserRouter>
        <NotFoundView />
      </BrowserRouter>
    );
  };

  it('renders without crashing', () => {
    renderComponent();
    expect(screen.getByText('Sorry, page not found!')).toBeInTheDocument();
  });

  it('displays the main heading', () => {
    renderComponent();
    const heading = screen.getByText('Sorry, page not found!');
    expect(heading).toBeInTheDocument();
    expect(heading.tagName).toBe('H3');
  });

  it('displays the error message', () => {
    const { container } = renderComponent();
    const text = container.textContent || '';
    expect(text).toContain('find the page');
    expect(text).toContain('mistyped the URL');
  });

  it('displays the 404 illustration image', () => {
    renderComponent();
    const image = screen.getByRole('img');
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute('src', '/assets/illustrations/illustration-404.svg');
  });

  it('displays "Go to home" button', () => {
    renderComponent();
    const button = screen.getByRole('link', { name: /go to home/i });
    expect(button).toBeInTheDocument();
  });

  it('home button links to root path', () => {
    renderComponent();
    const button = screen.getByRole('link', { name: /go to home/i });
    expect(button).toHaveAttribute('href', '/');
  });

  it('renders within SimpleLayout', () => {
    const { container } = renderComponent();
    expect(container.querySelector('[class*="MuiContainer"]')).toBeInTheDocument();
  });
});
