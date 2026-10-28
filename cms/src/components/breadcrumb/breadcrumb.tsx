import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Link } from 'react-router-dom';

import type { BreadcrumbItem } from 'src/contexts/breadcrumb-context';
import { useBreadcrumb } from 'src/contexts/breadcrumb-context';
import { Iconify } from '../iconify';

// ----------------------------------------------------------------------

export function Breadcrumb() {
  const { breadcrumbs } = useBreadcrumb();

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      {breadcrumbs.map((item: BreadcrumbItem, index: number) => {
        const isLast = index === breadcrumbs.length - 1;
        const hasLink = Boolean(item.href);

        return (
          <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            {hasLink ? (
              <Link
                to={item.href!}
                style={{
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': {
                      color: 'primary.main',
                      textDecoration: 'underline',
                    },
                    transition: 'color 0.2s',
                  }}
                >
                  {item.label}
                </Typography>
              </Link>
            ) : (
              <Typography
                variant="body2"
                sx={{
                  color: isLast ? 'text.primary' : 'text.secondary',
                  fontWeight: isLast ? 600 : 400,
                }}
              >
                {item.label}
              </Typography>
            )}

            {!isLast && (
              <Iconify icon="eva:chevron-right-fill" width={16} sx={{ color: 'text.disabled' }} />
            )}
          </Box>
        );
      })}
    </Box>
  );
}
