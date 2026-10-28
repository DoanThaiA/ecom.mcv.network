import * as XLSX from 'xlsx';

// ----------------------------------------------------------------------

/**
 * Excel import result with parsed rows
 */
export interface ExcelImportResult<T> {
  data: T[];
  errors: ExcelImportError[];
  totalRows: number;
  successRows: number;
}

/**
 * Excel import error
 */
export interface ExcelImportError {
  row: number;
  column?: string;
  message: string;
}

/**
 * Column mapping configuration
 */
export interface ColumnMapping {
  /** Excel column header (Vietnamese or English) */
  headers: string[];
  /** Target field name in the result object */
  field: string;
  /** Whether this field is required */
  required: boolean;
  /** Transform function for the value */
  transform?: (value: unknown) => unknown;
  /** Validation function for the value */
  validate?: (value: unknown) => string | null;
}

// ----------------------------------------------------------------------

/**
 * Read Excel file and return raw data
 */
export function readExcelFile(file: File): Promise<unknown[][]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];
        resolve(jsonData);
      } catch (error) {
        reject(new Error('Failed to read Excel file'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };

    reader.readAsBinaryString(file);
  });
}

/**
 * Parse Excel data with column mappings
 */
export function parseExcelData<T>(
  rawData: unknown[][],
  columnMappings: ColumnMapping[],
  startRow: number = 1 // Skip header row by default (0-indexed, so 1 means skip first row)
): ExcelImportResult<T> {
  const errors: ExcelImportError[] = [];
  const data: T[] = [];

  // If no data or only header
  if (rawData.length <= startRow) {
    return {
      data: [],
      errors: [{ row: 0, message: 'noDataInFile' }],
      totalRows: 0,
      successRows: 0,
    };
  }

  // Get header row for column mapping
  const headerRow = rawData[startRow - 1] as string[];

  // Find column indices based on header names
  const columnIndices: Map<string, number> = new Map();
  columnMappings.forEach((mapping) => {
    for (const header of mapping.headers) {
      const index = headerRow.findIndex(
        (h) => h?.toString().toLowerCase().trim() === header.toLowerCase().trim()
      );
      if (index !== -1) {
        columnIndices.set(mapping.field, index);
        break;
      }
    }
  });

  // Check for required columns
  for (const mapping of columnMappings) {
    if (mapping.required && !columnIndices.has(mapping.field)) {
      errors.push({
        row: 0,
        column: mapping.headers[0],
        message: 'missingRequiredColumn',
      });
    }
  }

  // If missing required columns, return early
  if (errors.length > 0) {
    return {
      data: [],
      errors,
      totalRows: rawData.length - startRow,
      successRows: 0,
    };
  }

  // Parse data rows
  for (let i = startRow; i < rawData.length; i++) {
    const row = rawData[i] as unknown[];
    const rowNumber = i + 1; // 1-indexed for user display
    const rowData: Record<string, unknown> = {};
    let hasError = false;

    // Skip empty rows
    if (!row || row.every((cell) => cell === null || cell === undefined || cell === '')) {
      continue;
    }

    // Process each column mapping
    for (const mapping of columnMappings) {
      const columnIndex = columnIndices.get(mapping.field);
      if (columnIndex === undefined) continue;

      let value = row[columnIndex];

      // Trim string values
      if (typeof value === 'string') {
        value = value.trim();
      }

      // Check required
      if (mapping.required && (value === null || value === undefined || value === '')) {
        errors.push({
          row: rowNumber,
          column: mapping.headers[0],
          message: 'requiredFieldEmpty',
        });
        hasError = true;
        continue;
      }

      // Apply transform
      if (mapping.transform && value !== null && value !== undefined && value !== '') {
        try {
          value = mapping.transform(value);
        } catch {
          errors.push({
            row: rowNumber,
            column: mapping.headers[0],
            message: 'invalidValue',
          });
          hasError = true;
          continue;
        }
      }

      // Apply validation
      if (mapping.validate && value !== null && value !== undefined && value !== '') {
        const validationError = mapping.validate(value);
        if (validationError) {
          errors.push({
            row: rowNumber,
            column: mapping.headers[0],
            message: validationError,
          });
          hasError = true;
          continue;
        }
      }

      rowData[mapping.field] = value;
    }

    if (!hasError) {
      data.push(rowData as T);
    }
  }

  return {
    data,
    errors,
    totalRows: rawData.length - startRow,
    successRows: data.length,
  };
}

/**
 * Validate Excel file type
 */
export function isValidExcelFile(file: File): boolean {
  const validTypes = [
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'application/vnd.ms-excel', // xls
    'text/csv', // csv
  ];
  const validExtensions = ['.xlsx', '.xls', '.csv'];

  const hasValidType = validTypes.includes(file.type);
  const hasValidExtension = validExtensions.some((ext) => file.name.toLowerCase().endsWith(ext));

  return hasValidType || hasValidExtension;
}

/**
 * Generate sample Excel file for download
 */
export function generateSampleExcel(
  headers: string[],
  sampleData: unknown[][] = [],
  fileName: string = 'sample.xlsx'
): void {
  const worksheet = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

  // Set column widths
  const colWidths = headers.map((h) => ({ wch: Math.max(h.length + 5, 15) }));
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, fileName);
}
