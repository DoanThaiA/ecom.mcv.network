import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
  Alert,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useTranslation } from 'react-i18next';

import {
  readExcelFile,
  parseExcelData,
  isValidExcelFile,
  generateSampleExcel,
  type ColumnMapping,
  type ExcelImportResult,
  type ExcelImportError,
} from 'src/utils/excel-import';

// ----------------------------------------------------------------------

export interface ExcelImportDialogProps<T> {
  open: boolean;
  onClose: () => void;
  onImport: (data: T[]) => void;
  /** Title of the dialog */
  title: string;
  /** Column mappings for parsing Excel */
  columnMappings: ColumnMapping[];
  /** Headers for sample file (Vietnamese) */
  sampleHeaders: string[];
  /** Sample data for template file */
  sampleData?: unknown[][];
  /** Sample file name */
  sampleFileName?: string;
  /** Custom validation for the entire dataset */
  validateData?: (data: T[]) => ExcelImportError[];
  /** Info text to display */
  infoText?: string;
  /** Start row for data (skip instruction rows) */
  dataStartRow?: number;
}

type ImportStep = 'upload' | 'preview' | 'importing';

export function ExcelImportDialog<T>({
  open,
  onClose,
  onImport,
  title,
  columnMappings,
  sampleHeaders,
  sampleData = [],
  sampleFileName = 'sample_import.xlsx',
  validateData,
  infoText,
  dataStartRow = 2, // Default: Row 1 = instruction, Row 2 = header, Row 3+ = data
}: ExcelImportDialogProps<T>) {
  const { t } = useTranslation();
  const [step, setStep] = useState<ImportStep>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<ExcelImportResult<T> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetState = useCallback(() => {
    setStep('upload');
    setFile(null);
    setImportResult(null);
    setLoading(false);
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    resetState();
    onClose();
  }, [onClose, resetState]);

  const processFile = useCallback(
    async (uploadedFile: File) => {
      setLoading(true);
      setError(null);

      try {
        if (!isValidExcelFile(uploadedFile)) {
          setError(t('invalidFileType'));
          setLoading(false);
          return;
        }

        const rawData = await readExcelFile(uploadedFile);
        const result = parseExcelData<T>(rawData, columnMappings, dataStartRow);

        // Run custom validation if provided
        if (validateData && result.data.length > 0) {
          const customErrors = validateData(result.data);
          result.errors.push(...customErrors);
          // Recalculate success rows after custom validation
          const errorRows = new Set(customErrors.map((e) => e.row));
          result.data = result.data.filter((_, index) => !errorRows.has(index + dataStartRow + 1));
          result.successRows = result.data.length;
        }

        setImportResult(result);
        setFile(uploadedFile);
        setStep('preview');
      } catch {
        setError(t('failedToReadFile'));
      } finally {
        setLoading(false);
      }
    },
    [columnMappings, dataStartRow, t, validateData]
  );

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0]);
      }
    },
    [processFile]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv'],
    },
    multiple: false,
    disabled: loading,
  });

  const handleDownloadSample = useCallback(() => {
    generateSampleExcel(sampleHeaders, sampleData, sampleFileName);
  }, [sampleHeaders, sampleData, sampleFileName]);

  const handleConfirmImport = useCallback(() => {
    if (importResult && importResult.data.length > 0) {
      setStep('importing');
      onImport(importResult.data);
      handleClose();
    }
  }, [importResult, onImport, handleClose]);

  const handleBackToUpload = useCallback(() => {
    resetState();
  }, [resetState]);

  // Render upload step
  const renderUploadStep = () => (
    <Box>
      {infoText && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {infoText}
        </Alert>
      )}

      {/* Download sample button */}
      <Box sx={{ mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadSample}
          size="small"
        >
          {t('downloadSampleFile')}
        </Button>
      </Box>

      {/* Dropzone */}
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed',
          borderColor: isDragActive ? 'primary.main' : 'grey.300',
          borderRadius: 2,
          p: 4,
          textAlign: 'center',
          cursor: 'pointer',
          bgcolor: isDragActive ? 'action.hover' : 'grey.50',
          transition: 'all 0.2s ease',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
          },
        }}
      >
        <input {...getInputProps()} />
        <CloudUploadIcon sx={{ fontSize: 48, color: 'grey.400', mb: 1 }} />
        <Typography variant="body1" color="text.secondary">
          {isDragActive ? t('dropFileHere') : t('dragDropOrClickToUpload')}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('supportedFormats')}: .xlsx, .xls, .csv
        </Typography>
      </Box>

      {loading && <LinearProgress sx={{ mt: 2 }} />}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  // Render preview step
  const renderPreviewStep = () => (
    <Box>
      {/* File info */}
      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
        <InsertDriveFileIcon color="primary" />
        <Typography variant="body2" fontWeight={500}>
          {file?.name}
        </Typography>
      </Stack>

      {/* Import summary */}
      <Box sx={{ mb: 2 }}>
        <Stack direction="row" spacing={3}>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <CheckCircleOutlineIcon color="success" fontSize="small" />
            <Typography variant="body2">
              {t('successRows')}: {importResult?.successRows || 0}
            </Typography>
          </Stack>
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <ErrorOutlineIcon color="error" fontSize="small" />
            <Typography variant="body2">
              {t('errorRows')}: {importResult?.errors.length || 0}
            </Typography>
          </Stack>
        </Stack>
      </Box>

      {/* Error list */}
      {importResult && importResult.errors.length > 0 && (
        <Alert
          severity="warning"
          sx={{
            mb: 2,
            maxHeight: 200,
            overflow: 'auto',
          }}
        >
          <Typography variant="subtitle2" sx={{ mb: 1 }}>
            {t('importErrors')}:
          </Typography>
          <List dense disablePadding>
            {importResult.errors.slice(0, 10).map((err, index) => (
              <ListItem key={index} disablePadding sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 28 }}>
                  <ErrorOutlineIcon color="error" fontSize="small" />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="caption">
                      {err.row > 0 ? `${t('row')} ${err.row}` : ''}{' '}
                      {err.column ? `[${err.column}]` : ''}: {t(err.message)}
                    </Typography>
                  }
                />
              </ListItem>
            ))}
            {importResult.errors.length > 10 && (
              <ListItem disablePadding>
                <ListItemText
                  primary={
                    <Typography variant="caption" color="text.secondary">
                      {t('andMoreErrors', { count: importResult.errors.length - 10 })}
                    </Typography>
                  }
                />
              </ListItem>
            )}
          </List>
        </Alert>
      )}

      {/* No valid data warning */}
      {importResult && importResult.data.length === 0 && (
        <Alert severity="error">{t('noValidDataToImport')}</Alert>
      )}
    </Box>
  );

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">{title}</Typography>
          <IconButton onClick={handleClose} size="small">
            <CloseIcon />
          </IconButton>
        </Stack>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 2 }}>
        {step === 'upload' && renderUploadStep()}
        {step === 'preview' && renderPreviewStep()}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        {step === 'upload' && (
          <Button onClick={handleClose} color="inherit">
            {t('cancel')}
          </Button>
        )}
        {step === 'preview' && (
          <>
            <Button onClick={handleBackToUpload} color="inherit">
              {t('back')}
            </Button>
            <Button
              onClick={handleConfirmImport}
              variant="contained"
              disabled={!importResult || importResult.data.length === 0}
            >
              {t('import')} ({importResult?.data.length || 0} {t('products').toLowerCase()})
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
