import type { Breakpoint, SxProps, Theme } from '@mui/material/styles';

import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Breadcrumb } from 'src/components/breadcrumb';
import { usePageTitle } from 'src/contexts/page-title-context';
import { useBreadcrumbSync } from 'src/hooks/use-breadcrumb-sync';

import { useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import { useRouter } from 'src/routes/hooks/use-router';
import { logoutRequest, selectCurrentUser } from 'src/redux/store/authSlice';
import { layoutClasses } from '../classes';
import { AccountPopover } from '../components/account-popover';
import { LanguagePopover } from '../components/language-popover';
import { MenuButton } from '../components/menu-button';
import { NhanhUnsyncedPopover } from '../components/nhanh-unsynced-popover';
import type { NavItem } from '../config-nav-dashboard';
import { NavbarData } from '../config-nav-dashboard';
import { AccountTypeEnum } from 'src/types/gen/cms/cms/cms-users/cms-user';
import { ModulePermission } from 'src/repositories/cms-user.repository';
import type { ModulePermissionEnum } from 'src/types/gen/cms/cms/cms-users/cms-user';
import { HeaderSection } from '../core/header-section';
import { LayoutSection } from '../core/layout-section';
import { Main } from './main';
import { NavDesktop, NavMobile } from './nav';
import { NhanhUnsyncedDialog } from './nhanh-unsynced-dialog';

const _langs = [
  { value: 'en', label: 'English', icon: 'https://flagcdn.com/w20/gb.png' },
  { value: 'vi', label: 'Tiếng Việt', icon: 'https://flagcdn.com/w20/vn.png' },
];

// ----------------------------------------------------------------------

// Country codes matching backend
enum CountryCode {
  VIETNAM = 'VN',
  THAILAND = 'TH',
  JAPAN = 'JP',
  US = 'US',
}

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  header?: {
    sx?: SxProps<Theme>;
  };
};

/**
 * Filter nav items based on user's module permissions and account type.
 * - Affiliate accounts (accountType=2): only see items with accountType=AFFILIATE set.
 * - Website admin / owner: see all items without accountType restriction.
 *   - Owner sees all non-affiliate items.
 *   - Non-owner admins see items matching their module permissions.
 */
const filterNav = (
  navItems: NavItem[],
  userPermissions: ModulePermissionEnum[],
  accountType?: AccountTypeEnum
): NavItem[] => {
  const isAffiliate = accountType === AccountTypeEnum.ACCOUNT_TYPE_AFFILIATE;

  if (isAffiliate) {
    return navItems.filter((item) => item.accountType === AccountTypeEnum.ACCOUNT_TYPE_AFFILIATE);
  }

  const adminItems = navItems.filter(
    (item) => item.accountType !== AccountTypeEnum.ACCOUNT_TYPE_AFFILIATE
  );

  // super_admin sees all admin items
  if (userPermissions.includes(ModulePermission.super_admin as unknown as ModulePermissionEnum)) {
    return adminItems;
  }

  return adminItems.filter((item) => {
    if (!item.permission) return true;
    return userPermissions.includes(item.permission);
  });
};

export function DashboardLayout({ sx, children, header }: DashboardLayoutProps) {
  const theme = useTheme();
  const { title } = usePageTitle();

  // Auto-sync breadcrumbs based on current route
  useBreadcrumbSync();

  const [navOpen, setNavOpen] = useState(false);
  const [widthNavDesktop, setWidthNavDesktop] = useState('var(--layout-nav-vertical-width)');

  const layoutQuery: Breakpoint = 'lg';
  const currentUser = useAppSelector(selectCurrentUser);
  const isAffiliate = currentUser?.accountType === AccountTypeEnum.ACCOUNT_TYPE_AFFILIATE;
  const navbarData = filterNav(
    new NavbarData().getNavigation(),
    currentUser?.permissions ?? [],
    currentUser?.accountType
  );

  const toggleExpandNavDesktop = () => {
    if (widthNavDesktop === 'var(--layout-nav-mini-width)') {
      setWidthNavDesktop('var(--layout-nav-vertical-width)');
      return;
    }
    setWidthNavDesktop('var(--layout-nav-mini-width)');
  };

  return (
    <LayoutSection
      /** **************************************
       * Header
       *************************************** */
      headerSection={
        <HeaderSection
          layoutQuery={layoutQuery}
          slotProps={{
            container: {
              maxWidth: false,
              sx: { px: { [layoutQuery]: 5 } },
            },
          }}
          sx={header?.sx}
          slots={{
            leftArea: (
              <>
                <MenuButton
                  onClick={() => setNavOpen(true)}
                  sx={{
                    ml: -1,
                    [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                  }}
                />
                <NavMobile
                  data={navbarData}
                  open={navOpen}
                  onClose={() => setNavOpen(false)}
                  workspaces={[]}
                />
              </>
            ),
            breadcrumbArea: (
              <Box sx={{ display: { xs: 'none', [layoutQuery]: 'block' } }}>
                <Breadcrumb />
              </Box>
            ),
            centerArea: title ? (
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#120D40' }}>
                {title}
              </Typography>
            ) : null,
            rightArea: (
              <Box gap={1} display="flex" alignItems="center">
                {!isAffiliate && <NhanhUnsyncedPopover />}
                <LanguagePopover data={_langs} />
                <AccountPopover
                  data={[
                    {
                      label: 'Home',
                      href: '/',
                      icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" />,
                    },
                    // {
                    //   label: 'Profile',
                    //   href: '#',
                    //   icon: <Iconify width={22} icon="solar:shield-keyhole-bold-duotone" />,
                    // },
                    // {
                    //   label: 'Settings',
                    //   href: '#',
                    //   icon: <Iconify width={22} icon="solar:settings-bold-duotone" />,
                    // },
                  ]}
                />
              </Box>
            ),
          }}
        />
      }
      /** **************************************
       * Sidebar
       *************************************** */
      sidebarSection={
        <NavDesktop
          data={navbarData}
          layoutQuery={layoutQuery}
          workspaces={[]}
          onClickExpand={toggleExpandNavDesktop}
          widthNavDesktop={widthNavDesktop}
        />
      }
      /** **************************************
       * Footer
       *************************************** */
      footerSection={null}
      /** **************************************
       * Style
       *************************************** */
      cssVars={{
        '--layout-nav-vertical-width': '300px',
        '--layout-dashboard-content-pt': theme.spacing(0.5),
        '--layout-dashboard-content-pb': theme.spacing(8),
        '--layout-dashboard-content-px': theme.spacing(3),
      }}
      sx={{
        transition:
          'left  var(--layout-transition-duration) var(--layout-transition-easing) 0ms, right var(--layout-transition-duration) var(--layout-transition-easing) 0ms',
        [`& .${layoutClasses.hasSidebar}`]: {
          [theme.breakpoints.up(layoutQuery)]: {
            pl: widthNavDesktop,
          },
        },
        ...sx,
      }}
    >
      <Main>{children}</Main>
      {!isAffiliate && <NhanhUnsyncedDialog />}
    </LayoutSection>
  );
}
