import { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Alert,
  CircularProgress,
  Chip,
  Avatar,
  Link,
  Stack,
  Tabs,
  Tab,
  LinearProgress,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteIcon from '@mui/icons-material/Delete';
import { useReactTable, getCoreRowModel, type ColumnDef } from '@tanstack/react-table';

import { DataTable, TablePagination } from 'src/components/table';
import { commissionRepository } from 'src/repositories/commission.repository';
import type {
  ImportSessionResponse,
  ImportSessionRow,
  PaginatedImportSessionRows,
} from 'src/types/import-session';
import { useJobPolling } from 'src/hooks/use-job-polling';

type ImportStep = 'upload' | 'validating' | 'preview' | 'processing' | 'complete';

interface AffiliateProductCommissionExcelImportDialogProps {
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
  /** Affiliate ID; pass null for the global Cài đặt hoa hồng scope. */
  affiliateId: string | null;
}

const PAGE_SIZE = 20;
const TEMPLATE_URL = '/templates/affiliate-product-commission-template.xlsx';

export function AffiliateProductCommissionExcelImportDialog({
  open,
  onClose,
  onComplete,
  affiliateId,
}: AffiliateProductCommissionExcelImportDialogProps) {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [session, setSession] = useState<ImportSessionResponse | null>(null);

  const [previewTab, setPreviewTab] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(PAGE_SIZE);
  const [rowsData, setRowsData] = useState<PaginatedImportSessionRows | null>(null);
  const [rowsLoading, setRowsLoading] = useState(false);

  const [deletingRowId, setDeletingRowId] = useState<string | null>(null);

  const [jobId, setJobId] = useState<string | null>(null);
  const { job, isTerminal } = useJobPolling(jobId);

  useEffect(() => {
    if (isTerminal && job) {
      setStep('complete');
    }
  }, [isTerminal, job]);

  const resetState = useCallback(() => {
    setStep('upload');
    setFile(null);
    setError(null);
    setSession(null);
    setPreviewTab(0);
    setPage(1);
    setPageSize(PAGE_SIZE);
    setRowsData(null);
    setRowsLoading(false);
    setDeletingRowId(null);
    setJobId(null);
  }, []);

  const handleClose = () => {
    if (step === 'processing') return;
    resetState();
    onClose();
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx') && !selectedFile.name.endsWith('.xls')) {
        setError(t('invalidFileType'));
        return;
      }
      setFile(selectedFile);
      setError(null);
    }
  };

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      const droppedFile = event.dataTransfer.files[0];
      if (droppedFile) {
        if (!droppedFile.name.endsWith('.xlsx') && !droppedFile.name.endsWith('.xls')) {
          setError(t('invalidFileType'));
          return;
        }
        setFile(droppedFile);
        setError(null);
      }
    },
    [t]
  );

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const fetchRows = async (sessionId: string, p: number, ps: number, showInvalid: boolean) => {
    setRowsLoading(true);
    try {
      const data = await commissionRepository.getProductCommissionImportSessionRows(
        affiliateId,
        sessionId,
        {
          page: p,
          limit: ps,
          isValid: !showInvalid,
        }
      );
      setRowsData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('validationFailed');
      setError(msg);
    } finally {
      setRowsLoading(false);
    }
  };

  const handleValidate = async () => {
    if (!file) return;

    setStep('validating');
    setError(null);

    try {
      const result = await commissionRepository.createProductCommissionImportSession(
        affiliateId,
        file
      );
      setSession(result);
      setStep('preview');
      await fetchRows(result.id, 1, PAGE_SIZE, false);
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : t('validationFailed');
      setError(errorMessage);
      setStep('upload');
    }
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    if (session) fetchRows(session.id, newPage, pageSize, previewTab === 1);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(1);
    if (session) fetchRows(session.id, 1, newPageSize, previewTab === 1);
  };

  const handleTabChange = (_: React.SyntheticEvent, newTab: number) => {
    setPreviewTab(newTab);
    setPage(1);
    if (session) fetchRows(session.id, 1, pageSize, newTab === 1);
  };

  const handleDeleteRow = async (rowId: string) => {
    if (!session) return;
    setDeletingRowId(rowId);
    try {
      const updatedSession = await commissionRepository.deleteProductCommissionImportSessionRow(
        affiliateId,
        session.id,
        rowId
      );
      setSession(updatedSession);
      await fetchRows(session.id, page, pageSize, previewTab === 1);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('unknownError');
      setError(msg);
    } finally {
      setDeletingRowId(null);
    }
  };

  const handleConfirm = async () => {
    if (!session) return;
    setStep('processing');
    setError(null);
    try {
      const { jobId: newJobId } = await commissionRepository.confirmProductCommissionImportSession(
        affiliateId,
        session.id
      );
      setJobId(newJobId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('unknownError');
      setError(msg);
      setStep('preview');
    }
  };

  const getErrorLabel = (errorCode: string): string => {
    switch (errorCode) {
      case 'PRODUCT_NOT_FOUND':
        return t('productNotFound');
      case 'INVALID_RATE':
        return t('invalidCommissionRate');
      case 'DUPLICATE_IN_EXCEL':
        return t('duplicateInExcel');
      case 'INVALID_ROW_FORMAT':
        return t('invalidRowFormat');
      default:
        return t('unknownError');
    }
  };

  const showErrors = previewTab === 1;

  const columns = useMemo<ColumnDef<ImportSessionRow>[]>(
    () => [
      {
        id: 'rowNumber',
        header: t('row'),
        size: 60,
        cell: ({ row }) => <Typography variant="body2">{row.original.rowNumber}</Typography>,
      },
      {
        id: 'image',
        header: t('image'),
        size: 60,
        cell: ({ row }) => (
          <Avatar
            src={row.original.image ?? undefined}
            variant="rounded"
            sx={{ width: 40, height: 40 }}
          />
        ),
      },
      {
        id: 'code',
        header: t('productCode'),
        size: 120,
        cell: ({ row }) => <Typography variant="body2">{row.original.code}</Typography>,
      },
      {
        id: 'name',
        header: t('productName'),
        size: 240,
        cell: ({ row }) => (
          <Box>
            <Typography variant="body2">{row.original.actualName || row.original.name}</Typography>
            {row.original.actualName &&
              row.original.name &&
              row.original.actualName !== row.original.name && (
                <Typography variant="caption" color="text.secondary">
                  Excel: {row.original.name}
                </Typography>
              )}
          </Box>
        ),
      },
      {
        id: 'commissionRate',
        header: t('commissionRate'),
        size: 120,
        cell: ({ row }) => (
          <Typography variant="body2">
            {row.original.commissionRate != null ? `${row.original.commissionRate}%` : '-'}
          </Typography>
        ),
      },
      ...(showErrors
        ? [
            {
              id: 'errors',
              header: t('errors'),
              size: 240,
              cell: ({ row }: { row: { original: ImportSessionRow } }) => (
                <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                  {row.original.errors.map((err, idx) => (
                    <Chip
                      key={idx}
                      label={getErrorLabel(err)}
                      size="small"
                      color="error"
                      variant="outlined"
                    />
                  ))}
                </Stack>
              ),
            } as ColumnDef<ImportSessionRow>,
          ]
        : []),
      {
        id: 'actions',
        header: '',
        size: 50,
        cell: ({ row }) => {
          const isDeleting = deletingRowId === row.original.id;
          return (
            <Tooltip title={t('delete')}>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDeleteRow(row.original.id)}
                disabled={isDeleting}
              >
                {isDeleting ? <CircularProgress size={16} /> : <DeleteIcon fontSize="small" />}
              </IconButton>
            </Tooltip>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, showErrors, deletingRowId, page, pageSize, previewTab]
  );

  const rows = rowsData?.docs ?? [];
  const totalPages = rowsData?.totalPages ?? 1;
  const totalItems = rowsData?.totalDocs ?? 0;

  const table = useReactTable({
    data: rows,
    columns,
    state: {
      pagination: {
        pageIndex: page - 1,
        pageSize,
      },
    },
    onPaginationChange: (updater) => {
      const newPagination =
        typeof updater === 'function' ? updater({ pageIndex: page - 1, pageSize }) : updater;
      if (newPagination.pageSize !== pageSize) {
        handlePageSizeChange(newPagination.pageSize);
      } else {
        handlePageChange(newPagination.pageIndex + 1);
      }
    },
    manualPagination: true,
    pageCount: totalPages,
    getCoreRowModel: getCoreRowModel(),
  });

  const renderUploadStep = () => (
    <Box sx={{ py: 3 }}>
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Link
          href={TEMPLATE_URL}
          download="affiliate-product-commission-template.xlsx"
          sx={{ display: 'inline-flex', alignItems: 'center', gap: 1 }}
        >
          <DownloadIcon fontSize="small" />
          {t('downloadTemplate')}
        </Link>
      </Box>

      <Box
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => fileInputRef.current?.click()}
        sx={{
          border: '2px dashed',
          borderColor: file ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: file ? 'primary.50' : 'grey.50',
          '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.50' },
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.500', mb: 2 }} />
        <Typography variant="body1" sx={{ mb: 1 }}>
          {file ? file.name : t('dropFileHere')}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {t('supportedFormats')}: .xlsx, .xls
        </Typography>
      </Box>

      <Alert severity="info" sx={{ mt: 2 }}>
        {t('affiliateProductCommissionImportNote')}
      </Alert>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  const renderValidatingStep = () => (
    <Box sx={{ py: 6, textAlign: 'center' }}>
      <CircularProgress size={48} sx={{ mb: 2 }} />
      <Typography variant="body1">{t('validatingProducts')}</Typography>
    </Box>
  );

  const renderPreviewStep = () => {
    if (!session) return null;

    return (
      <Box sx={{ py: 2 }}>
        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
          <Chip
            icon={<CheckCircleIcon />}
            label={`${t('validProducts')}: ${session.validCount}`}
            color="success"
            variant="outlined"
          />
          <Chip
            icon={<ErrorIcon />}
            label={`${t('invalidProducts')}: ${session.invalidCount}`}
            color="error"
            variant="outlined"
          />
          <Chip label={`${t('total')}: ${session.totalRows}`} variant="outlined" />
        </Box>

        <Tabs value={previewTab} onChange={handleTabChange} sx={{ mb: 2 }}>
          <Tab
            label={`${t('validProducts')} (${session.validCount})`}
            disabled={session.validCount === 0}
          />
          <Tab
            label={`${t('invalidProducts')} (${session.invalidCount})`}
            disabled={session.invalidCount === 0}
          />
        </Tabs>

        {rowsLoading ? (
          <Box sx={{ py: 4, textAlign: 'center' }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <>
            <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
              <DataTable table={table} compact />
            </Box>
            {totalItems > 0 && (
              <TablePagination
                table={table}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageSizeChange={handlePageSizeChange}
                pageSizeOptions={[10, 20, 50]}
              />
            )}
          </>
        )}

        {session.validCount === 0 && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {t('noValidProducts')}
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    );
  };

  const renderProcessingStep = () => (
    <Box sx={{ py: 4 }}>
      <Typography variant="body1" sx={{ mb: 2, textAlign: 'center' }}>
        {t('processingImport')}
      </Typography>

      {job && (
        <Box sx={{ px: 2 }}>
          <LinearProgress
            variant="determinate"
            value={job.percentComplete}
            sx={{ height: 8, borderRadius: 4, mb: 2 }}
          />
          <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              {t('importProgress', {
                processed: job.processed,
                total: job.total,
              })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(job.percentComplete)}%
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Chip
              icon={<CheckCircleIcon />}
              label={`${t('succeeded')}: ${job.succeeded}`}
              color="success"
              size="small"
              variant="outlined"
            />
            <Chip
              icon={<ErrorIcon />}
              label={`${t('failed')}: ${job.failed}`}
              color="error"
              size="small"
              variant="outlined"
            />
          </Stack>
        </Box>
      )}

      {!job && (
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={32} />
        </Box>
      )}

      <Alert severity="warning" sx={{ mt: 3 }}>
        {t('importProcessingInBackground')}
      </Alert>
    </Box>
  );

  const getJobErrorLabel = (errCode: string): string => {
    const key = `bulkAddReason_${errCode}`;
    const translated = t(key);
    return translated !== key ? translated : errCode;
  };

  const renderCompleteStep = () => {
    const isFailed = job?.status === 'failed';

    return (
      <Box sx={{ py: 4, textAlign: 'center' }}>
        {isFailed ? (
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
        ) : (
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
        )}
        <Typography variant="h6" sx={{ mb: 1 }}>
          {isFailed ? t('importFailed') : t('importComplete')}
        </Typography>
        {job && (
          <Typography variant="body2" color="text.secondary">
            {t('importResultSummary', {
              succeeded: job.succeeded,
              failed: job.failed,
              total: job.total,
            })}
          </Typography>
        )}
        {job && job.jobErrors.length > 0 && (
          <Box sx={{ mt: 2, textAlign: 'left' }}>
            <Typography variant="subtitle2" color="error" sx={{ mb: 1 }}>
              {t('errors')} ({job.jobErrors.length}):
            </Typography>
            <TableContainer
              sx={{ maxHeight: 350, border: 1, borderColor: 'divider', borderRadius: 1 }}
            >
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 'bold', width: '35%' }}>
                      {t('productCode')}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>{t('errorReason')}</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {job.jobErrors.map((e, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {e.itemId}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="error">
                          {getJobErrorLabel(e.error)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        )}
      </Box>
    );
  };

  const getStepIndex = (): number => {
    switch (step) {
      case 'upload':
        return 0;
      case 'validating':
        return 1;
      case 'preview':
        return 2;
      case 'processing':
        return 3;
      case 'complete':
        return 4;
      default:
        return 0;
    }
  };

  const handleCompleteClose = () => {
    resetState();
    onComplete();
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ m: 0, p: 2, display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ flex: 1, fontSize: 20 }}>
          {t('importAffiliateProductCommissions')}
        </Typography>
        {step !== 'processing' && (
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        )}
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={getStepIndex()} sx={{ mb: 3 }}>
          <Step>
            <StepLabel>{t('uploadFile')}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t('validating')}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t('preview')}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t('processing')}</StepLabel>
          </Step>
          <Step>
            <StepLabel>{t('complete')}</StepLabel>
          </Step>
        </Stepper>

        {step === 'upload' && renderUploadStep()}
        {step === 'validating' && renderValidatingStep()}
        {step === 'preview' && renderPreviewStep()}
        {step === 'processing' && renderProcessingStep()}
        {step === 'complete' && renderCompleteStep()}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {step === 'upload' && (
          <>
            <Button onClick={handleClose} color="inherit">
              {t('cancel')}
            </Button>
            <Button variant="contained" onClick={handleValidate} disabled={!file}>
              {t('validate')}
            </Button>
          </>
        )}
        {step === 'preview' && (
          <>
            <Button onClick={() => setStep('upload')} color="inherit">
              {t('back')}
            </Button>
            <Button
              variant="contained"
              onClick={handleConfirm}
              disabled={!session || session.validCount === 0}
            >
              {`${t('importProducts')} (${session?.validCount ?? 0})`}
            </Button>
          </>
        )}
        {step === 'processing' && (
          <Button onClick={handleClose} color="inherit" disabled>
            {t('close')}
          </Button>
        )}
        {step === 'complete' && (
          <Button variant="contained" onClick={handleCompleteClose}>
            {t('close')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
