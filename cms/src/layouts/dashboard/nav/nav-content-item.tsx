import { useEffect, useState } from 'react';

import Box from '@mui/material/Box';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';

import FiberManualRecordIcon from '@mui/icons-material/FiberManualRecord';
import KeyboardArrowDown from '@mui/icons-material/KeyboardArrowDown';
import { Card, Collapse } from '@mui/material';
import PopupState, { bindHover, bindPopover } from 'material-ui-popup-state';
import HoverPopover from 'material-ui-popup-state/HoverPopover';
import { useTranslation } from 'react-i18next';
import { RouterLink } from 'src/routes/components';
import { usePathname } from 'src/routes/hooks';

import type { NavItem } from '../../config-nav-dashboard';
import { NAV_COLORS } from './nav-colors';

type NavContentItemProps = {
  item: NavItem;
  isMiniWidth?: boolean;
};

export function NavContentItem({ item, isMiniWidth }: NavContentItemProps) {
  const { t } = useTranslation();
  const [isExpand, setIsExpand] = useState(true);
  const pathname = usePathname();

  const isActiveParent = item.children
    ? item.children?.find((e) => e.path === pathname)
    : item.path === pathname;

  useEffect(() => {
    const initialExpand = !!item.children?.find((e) => e.path === pathname);
    setIsExpand(initialExpand || isExpand);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <PopupState variant="popover" popupId="nav-popover">
      {(popupState) => (
        <Box {...(isMiniWidth && item.children ? { ...bindHover(popupState) } : {})}>
          <ListItem disableGutters disablePadding>
            <ListItemButton
              disableGutters
              component={RouterLink}
              onClick={(event) => {
                if (isMiniWidth && item.children) {
                  event.preventDefault();
                  return;
                }
                if (item.children) {
                  event.preventDefault();
                  setIsExpand((prev) => !prev);
                }
              }}
              href={item.path}
              sx={{
                py: 1.25,
                pl: isMiniWidth ? 1 : 0,
                pr: isMiniWidth ? 1 : 2,
                gap: 1.5,
                fontWeight: 500,
                color: NAV_COLORS.text,
                fontSize: 14,
                minHeight: 44,
                borderRadius: 0,
                borderBottom: `1px solid ${NAV_COLORS.border}`,
                transition: 'all 0.15s ease',

                ...(isMiniWidth && {
                  flexDirection: 'column',
                  typography: 'caption',
                  textAlign: 'center',
                  gap: 0.5,
                  minHeight: 56,
                }),

                // Active state
                ...(isActiveParent && {
                  fontWeight: 600,
                  bgcolor: NAV_COLORS.bgActive,
                  color: NAV_COLORS.textActive,
                  borderLeft: `3px solid ${NAV_COLORS.accent}`,
                }),

                '&:hover': {
                  bgcolor: isActiveParent ? NAV_COLORS.bgActive : NAV_COLORS.bgHover,
                  color: NAV_COLORS.textHover,
                },
              }}
            >
              {/* Icon */}
              {!isMiniWidth && item.icon && (
                <Box
                  component="span"
                  sx={{
                    width: 22,
                    height: 22,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    '& svg': { fontSize: 20 },
                  }}
                >
                  {item.icon}
                </Box>
              )}

              {/* Title */}
              <Box component="span" flexGrow={1}>
                {t(item.title)}
              </Box>

              {/* Dropdown arrow */}
              {item.children && !isMiniWidth && (
                <KeyboardArrowDown
                  sx={{
                    fontSize: 18,
                    opacity: 0.6,
                    transition: 'transform 0.15s ease',
                    transform: isExpand ? 'rotate(0deg)' : 'rotate(-90deg)',
                  }}
                />
              )}
            </ListItemButton>
          </ListItem>

          {/* Children Menu Items */}
          {!isMiniWidth && item.children && (
            <Collapse in={isExpand} timeout="auto" unmountOnExit>
              <Box component="ul" sx={{ bgcolor: NAV_COLORS.bgChildArea }}>
                {item.children.map((child) => {
                  const isActiveChild = child.path === pathname;
                  return (
                    <ListItemButton
                      key={child.path}
                      disableGutters
                      component={RouterLink}
                      href={child.path}
                      sx={{
                        py: 0.75,
                        pl: 5,
                        pr: 2,
                        fontWeight: 400,
                        color: NAV_COLORS.textChild,
                        fontSize: 13,
                        minHeight: 34,
                        transition: 'all 0.15s ease',

                        ...(isActiveChild && {
                          fontWeight: 600,
                          color: NAV_COLORS.textActive,
                          bgcolor: NAV_COLORS.bgChildActive,
                        }),

                        '&:hover': {
                          bgcolor: NAV_COLORS.bgHover,
                          color: NAV_COLORS.textHover,
                        },
                      }}
                    >
                      <FiberManualRecordIcon
                        sx={{
                          fontSize: 8,
                          color: isActiveChild ? NAV_COLORS.accent : 'rgba(255,255,255,0.3)',
                          mr: 1.5,
                          flexShrink: 0,
                        }}
                      />
                      {t(child.title)}
                    </ListItemButton>
                  );
                })}
              </Box>
            </Collapse>
          )}

          {/* Mini mode popover */}
          {item.children && (
            <HoverPopover
              {...bindPopover(popupState)}
              anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
              transformOrigin={{ vertical: 'center', horizontal: 'left' }}
              sx={{ ml: 1, pointerEvents: 'none' }}
              slotProps={{ paper: { sx: { pointerEvents: 'auto' } } }}
            >
              <Card
                sx={{
                  p: 0.5,
                  borderRadius: 1,
                  minWidth: 160,
                  bgcolor: NAV_COLORS.bg,
                  boxShadow: 3,
                }}
              >
                {item.children.map((child) => {
                  const isActiveChild = child.path === pathname;
                  return (
                    <ListItem disableGutters disablePadding key={child.path}>
                      <ListItemButton
                        disableGutters
                        component={RouterLink}
                        href={child.path}
                        sx={{
                          py: 1,
                          px: 1.5,
                          borderRadius: 0.5,
                          color: NAV_COLORS.textChild,
                          fontSize: 13,
                          minHeight: 36,
                          transition: 'all 0.15s ease',

                          ...(isActiveChild && {
                            fontWeight: 600,
                            bgcolor: NAV_COLORS.bgChildActive,
                            color: NAV_COLORS.textActive,
                          }),

                          '&:hover': {
                            bgcolor: NAV_COLORS.bgHover,
                            color: NAV_COLORS.textHover,
                          },
                        }}
                      >
                        {t(child.title)}
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </Card>
            </HoverPopover>
          )}
        </Box>
      )}
    </PopupState>
  );
}
