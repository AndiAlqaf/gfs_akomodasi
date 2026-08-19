import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';

export const exportToExcel = async (data: any[], fileName: string, sheetName: string = 'Data') => {
  if (!data || data.length === 0) {
    Swal.fire('No Data', 'There is no data to export.', 'warning');
    return;
  }

  // Create a new workbook and worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  // Append worksheet to workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  try {
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    if ('showSaveFilePicker' in window) {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: `${fileName}.xlsx`,
        types: [{
          description: 'Excel Workbook',
          accept: { 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'] },
        }],
      });
      const writable = await handle.createWritable();
      await writable.write(excelBuffer);
      await writable.close();
      
      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: 'File has been saved successfully.',
        timer: 1500,
        showConfirmButton: false
      });
    } else {
      // Fallback
      XLSX.writeFile(workbook, `${fileName}.xlsx`);
      Swal.fire({
        icon: 'success',
        title: 'Export Successful',
        text: 'File has been downloaded.',
        timer: 1500,
        showConfirmButton: false
      });
    }
  } catch (error: any) {
    if (error.name !== 'AbortError') {
      Swal.fire('Export Failed', error.message || 'Failed to save the file.', 'error');
    }
  }
};
