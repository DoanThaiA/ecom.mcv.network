import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { RouterLink } from 'src/routes/components/router-link';

describe('routes/components/RouterLink', () => {
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<MemoryRouter>{ui}</MemoryRouter>);
  };

  it('renders a link with href', () => {
    renderWithRouter(<RouterLink href="/test">Test Link</RouterLink>);
    
    const link = screen.getByText('Test Link');
    expect(link).toBeDefined();
    expect(link.tagName).toBe('A');
  });

  it('converts href to to prop for Link component', () => {
    renderWithRouter(<RouterLink href="/about">About</RouterLink>);
    
    const link = screen.getByText('About') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/about');
  });

  it('passes through other props', () => {
    renderWithRouter(
      <RouterLink href="/test" className="custom-class" data-testid="custom-link">
        Link
      </RouterLink>
    );
    
    const link = screen.getByTestId('custom-link');
    expect(link.className).toContain('custom-class');
  });

  it('supports forwardRef', () => {
    const ref = { current: null as HTMLAnchorElement | null };
    
    renderWithRouter(
      <RouterLink href="/test" ref={ref}>
        Ref Link
      </RouterLink>
    );
    
    expect(ref.current).not.toBeNull();
    expect(ref.current?.tagName).toBe('A');
  });

  it('renders children correctly', () => {
    renderWithRouter(
      <RouterLink href="/test">
        <span>Child Element</span>
      </RouterLink>
    );
    
    expect(screen.getByText('Child Element')).toBeDefined();
  });

  it('handles multiple paths', () => {
    renderWithRouter(<RouterLink href="/users/123">User Profile</RouterLink>);
    
    const link = screen.getByText('User Profile') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/users/123');
  });

  it('handles root path', () => {
    renderWithRouter(<RouterLink href="/">Home</RouterLink>);
    
    const link = screen.getByText('Home') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe('/');
  });
});
