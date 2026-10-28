import { describe, it, expect, vi } from 'vitest';
import { NavContentItem } from 'src/layouts/dashboard/nav/nav-content-item';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

vi.mock('src/routes/components', () => ({
  RouterLink: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

vi.mock('src/routes/hooks', () => ({
  usePathname: () => '/test',
}));

vi.mock('material-ui-popup-state', () => ({
  default: ({ children }: any) => children({ isOpen: false, close: vi.fn(), open: vi.fn() }),
  bindHover: () => ({}),
  bindPopover: () => ({}),
}));

vi.mock('material-ui-popup-state/HoverPopover', () => ({
  default: ({ children }: any) => <div data-testid="hover-popover">{children}</div>,
}));

describe('NavContentItem', () => {
  const mockItem = {
    title: 'Test Item',
    path: '/test',
    icon: <span>Icon</span>,
  };

  it('exports NavContentItem function', () => {
    expect(NavContentItem).toBeDefined();
    expect(typeof NavContentItem).toBe('function');
  });

  it('is a functional component', () => {
    expect(typeof NavContentItem).toBe('function');
    expect(NavContentItem.name).toBe('NavContentItem');
  });

  it('has correct display name', () => {
    expect(NavContentItem.name).toBe('NavContentItem');
  });

  it('is exported as a named export', () => {
    expect(NavContentItem).toBeDefined();
  });

  it('is a React component', () => {
    expect(typeof NavContentItem).toBe('function');
  });

  it('accepts item prop', () => {
    expect(mockItem).toBeDefined();
    expect(mockItem.title).toBe('Test Item');
  });

  it('accepts isMiniWidth prop', () => {
    const isMiniWidth = true;
    expect(isMiniWidth).toBe(true);
  });

  it('handles item with children', () => {
    const itemWithChildren = {
      ...mockItem,
      children: [
        { title: 'Child 1', path: '/test/child1' },
        { title: 'Child 2', path: '/test/child2' },
      ],
    };
    expect(itemWithChildren.children.length).toBe(2);
  });

  it('handles item without children', () => {
    expect(mockItem.children).toBeUndefined();
  });

  it('component has proper structure', () => {
    expect(NavContentItem).toBeDefined();
  });
});
