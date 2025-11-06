import * as XLSX from 'xlsx';

type ReportType = string;

interface AcademicYearOption {
  id: number;
  year_name: string;
  is_active?: boolean;
}

interface ExportOptions {
  reportType: ReportType;
  reportData: any;
  academicYears?: AcademicYearOption[];
  selectedYear?: number | null;
  filenamePrefix?: string;
}

const YES = 'Yes';
const NO = 'No';

function buildPreferencesMatrixRows(matrix: any[]): any[] {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    return [];
  }

  return matrix.flatMap((prof) => {
    const baseRow = {
      'Professor ID': prof?.professor_id ?? '',
      'Professor Name': prof?.professor_name ?? '',
      'Arabic Name': prof?.professor_name_arabic ?? '',
      Department: prof?.department ?? '',
      Rank: prof?.academic_rank ?? '',
      'Total Preferences': prof?.total_preferences ?? 0,
    };

    const preferenceRows = Array.isArray(prof?.preferences)
      ? prof.preferences
          .filter((pref: any) => pref?.has_preference)
          .map((pref: any) => ({
            ...baseRow,
            Module: pref?.module_name ?? '',
            'Teaching Type': pref?.teaching_type ?? '',
            Priority: pref?.priority_level ?? '',
            'Has Preference': pref?.has_preference ? YES : NO,
          }))
      : [];

    if (preferenceRows.length === 0) {
      return [
        {
          ...baseRow,
          Module: '',
          'Teaching Type': '',
          Priority: '',
          'Has Preference': NO,
        },
      ];
    }

    return preferenceRows;
  });
}

export function buildRowsForReport(reportType: ReportType, reportData: any): any[] {
  if (!reportData) {
    return [];
  }

  const data = reportData?.data ?? reportData;

  if (reportType === 'preferences-matrix') {
    const matrix = data?.matrix ?? [];
    return buildPreferencesMatrixRows(matrix);
  }

  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(reportData)) {
    return reportData;
  }

  if (typeof data === 'object' && data !== null) {
    const arrayValue = Object.values(data).find((value) => Array.isArray(value));
    if (Array.isArray(arrayValue)) {
      return arrayValue;
    }
  }

  return [];
}

export function exportReportToExcel({
  reportType,
  reportData,
  academicYears,
  selectedYear,
  filenamePrefix,
}: ExportOptions): boolean {
  const rows = buildRowsForReport(reportType, reportData);

  if (!rows || rows.length === 0) {
    return false;
  }

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

  const yearName = academicYears?.find((year) => year.id === selectedYear)?.year_name;
  const parts = [filenamePrefix ?? reportType, yearName].filter(Boolean);
  const fileName = `${parts.join('_') || 'report'}.xlsx`.replace(/\s+/g, '-');

  XLSX.writeFile(workbook, fileName);
  return true;
}
