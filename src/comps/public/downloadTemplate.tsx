import ExcelJS from "exceljs";
import { saveAs } from "file-saver";

export const downloadTemplate = async (columns : any, fileName : string) => {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Template");

  // set columns
  worksheet.columns = columns.map((col : any) => ({
    header: col.header,
    key: col.key,
    width: col.width
  }));


  for (let i = 0; i < 20; i++) {
    worksheet.addRow({});
  }

  columns.forEach((col : any, colIndex : any) => {
    if (col.dropdown) {
      for (let row = 2; row <= 21; row++) {
        worksheet.getCell(row, colIndex + 1).dataValidation = {
          type: "list",
          allowBlank: true,
          formulae: [`"${col.dropdown.join(",")}"`]
        };
      }
    }
  });

  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer]);
  saveAs(blob, fileName);
};
