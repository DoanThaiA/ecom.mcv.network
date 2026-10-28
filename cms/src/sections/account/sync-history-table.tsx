import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import LinearProgress from '@mui/material/LinearProgress';
import IconButton from '@mui/material/IconButton';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import { alpha } from '@mui/material/styles';

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatDistanceToNow } from 'date-fns';
import { vi, enUS } from 'date-fns/locale';
import { useAppDispatch, useAppSelector } from 'src/redux/store/store';
import {
  listJobsRequest,
  selectJobs,
  selectJobsLoading,
  selectJobsHasNextPage,
} from 'src/redux/store/jobSlice';
import { Iconify } from 'src/components/iconify';
import { JobType, JobStatus } from 'src/types/gen/shared/shared/common/enums';

// ----------------------------------------------------------------------

const PAGE_SIZE = 5;

// Helper function for job type translation key using enum
const getJobTypeKey = (type: JobType): string => {
  switch (type) {
    case JobType.JOB_TYPE_NHANH_PRODUCT_LIST_SYNC:
      return 'productListSync';
    case JobType.JOB_TYPE_NHANH_CATEGORY_SYNC:
      return 'categorySync';
    case JobType.JOB_TYPE_NHANH_BRAND_SYNC:
      return 'brandSync';
    case JobType.JOB_TYPE_NHANH_INVENTORY_SYNC:
      return 'inventorySync';
    case JobType.JOB_TYPE_NHANH_DEPOT_SYNC:
      return 'depotSync';
    case JobType.JOB_TYPE_NHANH_PRODUCT_DETAIL_SYNC:
      return 'productDetailSync';
    case JobType.JOB_TYPE_NHANH_PRODUCT_EMBED_SYNC:
      return 'productEmbedSync';
    case JobType.JOB_TYPE_UNSPECIFIED:
      return 'unspecified';
    case JobType.UNRECOGNIZED:
    default:
      return 'unrecognized';
  }
};

// Helper function for job status translation key using enum
const getJobStatusKey = (status: JobStatus): string => {
  switch (status) {
    case JobStatus.JOB_STATUS_PENDING:
      return 'pending';
    case JobStatus.JOB_STATUS_RUNNING:
      return 'running';
    case JobStatus.JOB_STATUS_COMPLETED:
      return 'completed';
    case JobStatus.JOB_STATUS_FAILED:
      return 'failed';
    case JobStatus.JOB_STATUS_CANCELLED:
      return 'cancelled';
    default:
      return 'unknown';
  }
};

// Helper function for job status color using enum
const getJobStatusColor = (
  status: JobStatus
): 'default' | 'info' | 'success' | 'error' | 'warning' => {
  switch (status) {
    case JobStatus.JOB_STATUS_PENDING:
      return 'default';
    case JobStatus.JOB_STATUS_RUNNING:
      return 'info';
    case JobStatus.JOB_STATUS_COMPLETED:
      return 'success';
    case JobStatus.JOB_STATUS_FAILED:
      return 'error';
    case JobStatus.JOB_STATUS_CANCELLED:
      return 'warning';
    default:
      return 'default';
  }
};

// ----------------------------------------------------------------------

export function SyncHistoryTable() {
  const { t, i18n } = useTranslation();
  const dispatch = useAppDispatch();

  const [isExpanded, setIsExpanded] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const jobs = useAppSelector(selectJobs);
  const jobsLoading = useAppSelector(selectJobsLoading);
  const hasNextPage = useAppSelector(selectJobsHasNextPage);

  const handleToggleExpand = () => {
    const newExpanded = !isExpanded;
    setIsExpanded(newExpanded);
    if (newExpanded && jobs.length === 0) {
      dispatch(listJobsRequest({ limit: PAGE_SIZE, page: 1 }));
    }
  };

  const handleReloadJobs = () => {
    setCurrentPage(1);
    dispatch(listJobsRequest({ limit: PAGE_SIZE, page: 1 }));
  };

  const handleNextPage = () => {
    const nextPage = currentPage + 1;
    setCurrentPage(nextPage);
    dispatch(listJobsRequest({ limit: PAGE_SIZE, page: nextPage }));
  };

  const handlePrevPage = () => {
    const prevPage = currentPage - 1;
    if (prevPage >= 1) {
      setCurrentPage(prevPage);
      dispatch(listJobsRequest({ limit: PAGE_SIZE, page: prevPage }));
    }
  };

  const formatRelativeTime = (date: Date | string | undefined) => {
    if (!date) return '-';
    const locale = i18n.language === 'vi' ? vi : enUS;
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale });
  };

  return (
    <>
      {/* Toggle Button */}
      <Button
        onClick={handleToggleExpand}
        variant="text"
        size="small"
        startIcon={<Iconify icon={isExpanded ? 'mdi:chevron-up' : 'mdi:chevron-down'} width={18} />}
        sx={{
          color: 'text.secondary',
          fontSize: 12,
          fontWeight: 500,
          textTransform: 'none',
          '&:hover': {
            bgcolor: alpha('#919EAB', 0.08),
          },
        }}
      >
        {isExpanded ? t('hideSyncHistory') : t('viewSyncHistory')}
      </Button>

      <Collapse in={isExpanded} timeout="auto" unmountOnExit>
        <Divider sx={{ borderStyle: 'dashed', mb: 1.5 }} />
        <Box>
          {/* Header with reload button */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mb: 1.5 }}
          >
            <Typography variant="subtitle2" sx={{ fontSize: 13 }}>
              {t('syncHistory')}
            </Typography>
            <IconButton
              size="small"
              onClick={handleReloadJobs}
              disabled={jobsLoading}
              sx={{ color: 'text.secondary' }}
            >
              <Iconify
                icon="mdi:refresh"
                width={18}
                sx={{
                  animation: jobsLoading ? 'spin 1s linear infinite' : 'none',
                  '@keyframes spin': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                  },
                }}
              />
            </IconButton>
          </Stack>

          <Box sx={{ minHeight: 350 }}>
            {jobsLoading ? (
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 350,
                }}
              >
                <CircularProgress size={24} />
              </Box>
            ) : jobs.length === 0 ? (
              <Box
                sx={{
                  textAlign: 'center',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  height: 350,
                }}
              >
                <Typography variant="body2" color="text.secondary">
                  {t('noJobsFound')}
                </Typography>
              </Box>
            ) : (
              <>
                <TableContainer sx={{ height: 300 }}>
                  <Table size="small" stickyHeader>
                    <TableHead>
                      <TableRow>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>{t('type')}</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>{t('status')}</TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>
                          {t('progress')}
                        </TableCell>
                        <TableCell sx={{ fontWeight: 600, fontSize: 12 }}>
                          {t('createdAt')}
                        </TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {jobs.map((job) => {
                        console.log('job.type', job.type);
                        return (
                          <TableRow key={job.id} hover>
                            <TableCell sx={{ fontSize: 12 }}>
                              <Chip
                                label={t(getJobTypeKey(job.type))}
                                size="small"
                                variant="outlined"
                                sx={{ fontSize: 10, height: 22 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: 12 }}>
                              <Chip
                                label={t(getJobStatusKey(job.status))}
                                size="small"
                                color={getJobStatusColor(job.status)}
                                sx={{ fontSize: 10, height: 22 }}
                              />
                            </TableCell>
                            <TableCell sx={{ fontSize: 12, minWidth: 120 }}>
                              <Stack spacing={0.5}>
                                <LinearProgress
                                  variant="determinate"
                                  value={job.percentComplete || 0}
                                  sx={{ height: 6, borderRadius: 1 }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                  {job.percentComplete || 0}% ({job.processed || 0}/{job.total || 0}
                                  )
                                </Typography>
                              </Stack>
                            </TableCell>
                            <TableCell sx={{ fontSize: 11, color: 'text.secondary' }}>
                              {formatRelativeTime(job.createdAt)}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                <Stack
                  direction="row"
                  alignItems="center"
                  justifyContent="flex-end"
                  spacing={1}
                  sx={{ mt: 1.5 }}
                >
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handlePrevPage}
                    disabled={currentPage <= 1 || jobsLoading}
                    startIcon={<Iconify icon="mdi:chevron-left" width={16} />}
                    sx={{
                      fontSize: 11,
                      textTransform: 'none',
                      minWidth: 'auto',
                      px: 1,
                    }}
                  >
                    {t('previous')}
                  </Button>
                  <Typography variant="caption" color="text.secondary">
                    {t('page')} {currentPage}
                  </Typography>
                  <Button
                    size="small"
                    variant="outlined"
                    onClick={handleNextPage}
                    disabled={!hasNextPage || jobsLoading}
                    endIcon={<Iconify icon="mdi:chevron-right" width={16} />}
                    sx={{
                      fontSize: 11,
                      textTransform: 'none',
                      minWidth: 'auto',
                      px: 1,
                    }}
                  >
                    {t('next')}
                  </Button>
                </Stack>
              </>
            )}
          </Box>
        </Box>
      </Collapse>
    </>
  );
}
