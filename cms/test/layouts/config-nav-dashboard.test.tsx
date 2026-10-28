import { describe, it, expect, vi } from 'vitest';
import { NavbarData, NavEnums } from 'src/layouts/config-nav-dashboard';

vi.mock('src/components/svg-color', () => ({
  SvgColor: ({ src }: any) => <div data-testid="svg-color" data-src={src}>SVG</div>,
}));

describe('NavEnums', () => {
  it('exports Nav enum', () => {
    expect(NavEnums.Nav).toBeDefined();
  });

  it('has correct enum values', () => {
    expect(NavEnums.Nav.OVERVIEW).toBe('overview');
    expect(NavEnums.Nav.PRODUCT_MANAGEMENT).toBe('product_management');
    expect(NavEnums.Nav.PRODUCTS).toBe('products');
    expect(NavEnums.Nav.COMBO_PRODUCTS).toBe('combo_products');
  });
});

describe('NavbarData', () => {
  it('creates instance without errors', () => {
    expect(() => {
      new NavbarData();
    }).not.toThrow();
  });

  it('returns navigation array', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    expect(Array.isArray(nav)).toBe(true);
  });

  it('has product management item', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    const productMgmt = nav.find(item => item.title === NavEnums.Nav.PRODUCT_MANAGEMENT);
    expect(productMgmt).toBeDefined();
  });

  it('product management has children', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    const productMgmt = nav.find(item => item.title === NavEnums.Nav.PRODUCT_MANAGEMENT);
    expect(productMgmt?.children).toBeDefined();
    expect(Array.isArray(productMgmt?.children)).toBe(true);
  });

  it('has products child item', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    const productMgmt = nav.find(item => item.title === NavEnums.Nav.PRODUCT_MANAGEMENT);
    const products = productMgmt?.children?.find(item => item.title === NavEnums.Nav.PRODUCTS);
    expect(products).toBeDefined();
    expect(products?.path).toBe('/product');
  });

  it('has combo products child item', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    const productMgmt = nav.find(item => item.title === NavEnums.Nav.PRODUCT_MANAGEMENT);
    const comboProducts = productMgmt?.children?.find(item => item.title === NavEnums.Nav.COMBO_PRODUCTS);
    expect(comboProducts).toBeDefined();
    expect(comboProducts?.path).toBe('/product-combo');
  });

  it('has order management item', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    const orderMgmt = nav.find(item => item.title === NavEnums.Nav.ORDER_MANAGEMENT);
    expect(orderMgmt).toBeDefined();
    expect(orderMgmt?.path).toBe('/order');
  });

  it('has return management item', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    const returnMgmt = nav.find(item => item.title === NavEnums.Nav.RETURN_MANAGEMENT);
    expect(returnMgmt).toBeDefined();
    expect(returnMgmt?.path).toBe('/return');
  });

  it('has flash sale management item', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    const flashSale = nav.find(item => item.title === NavEnums.Nav.FLASH_SALE_MANAGEMENT);
    expect(flashSale).toBeDefined();
    expect(flashSale?.path).toBe('/flash-sale');
  });

  it('has promotion management item', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    const promotion = nav.find(item => item.title === NavEnums.Nav.PROMOTION_MANAGEMENT);
    expect(promotion).toBeDefined();
    expect(promotion?.path).toBe('/promotion');
  });

  it('has news management item', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    const news = nav.find(item => item.title === NavEnums.Nav.NEWS_MANAGEMENT);
    expect(news).toBeDefined();
    expect(news?.path).toBe('/article');
  });

  it('has homepage management item', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    const homepage = nav.find(item => item.title === NavEnums.Nav.HOMEPAGE_MANAGEMENT);
    expect(homepage).toBeDefined();
  });

  it('homepage management has children', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    const homepage = nav.find(item => item.title === NavEnums.Nav.HOMEPAGE_MANAGEMENT);
    expect(homepage?.children).toBeDefined();
    expect(Array.isArray(homepage?.children)).toBe(true);
  });

  it('has topic management child item', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    const homepage = nav.find(item => item.title === NavEnums.Nav.HOMEPAGE_MANAGEMENT);
    const topic = homepage?.children?.find(item => item.title === NavEnums.Nav.TOPIC_MANAGEMENT);
    expect(topic).toBeDefined();
    expect(topic?.path).toBe('/topic');
  });

  it('has menu management child item', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    const homepage = nav.find(item => item.title === NavEnums.Nav.HOMEPAGE_MANAGEMENT);
    const menu = homepage?.children?.find(item => item.title === NavEnums.Nav.MENU_MANAGEMENT);
    expect(menu).toBeDefined();
    expect(menu?.path).toBe('/menu');
  });

  it('all items have icons', () => {
    const navbar = new NavbarData();
    const nav = navbar.getNavigation();
    nav.forEach(item => {
      expect(item.icon).toBeDefined();
    });
  });

  it('exports NavbarData class', () => {
    expect(NavbarData).toBeDefined();
    expect(typeof NavbarData).toBe('function');
  });

  it('is a class', () => {
    const navbar = new NavbarData();
    expect(navbar).toBeInstanceOf(NavbarData);
  });

  it('getNavigation returns same array on multiple calls', () => {
    const navbar = new NavbarData();
    const nav1 = navbar.getNavigation();
    const nav2 = navbar.getNavigation();
    expect(nav1).toBe(nav2);
  });
});
