import { Lead } from '@prisma/client';
import * as ExcelJS from 'exceljs';

export async function buildLeadsXlsx(leads: Lead[]): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Jetsonic Trading FZCO';
  wb.created = new Date();

  const ws = wb.addWorksheet('Leads');

  ws.columns = [
    { header: 'ID', key: 'id', width: 6 },
    { header: 'Created', key: 'createdAt', width: 19 },
    { header: 'Status', key: 'status', width: 14 },
    { header: 'Request type', key: 'requestType', width: 18 },
    { header: 'Urgency', key: 'urgency', width: 14 },
    { header: 'Name', key: 'name', width: 22 },
    { header: 'Company', key: 'company', width: 22 },
    { header: 'Role', key: 'role', width: 18 },
    { header: 'Email', key: 'email', width: 28 },
    { header: 'Phone', key: 'phone', width: 18 },
    { header: 'Part #', key: 'partNumber', width: 16 },
    { header: 'Alt part #', key: 'altPartNumber', width: 16 },
    { header: 'ATA', key: 'ataChapter', width: 8 },
    { header: 'Aircraft', key: 'aircraftType', width: 14 },
    { header: 'Tail #', key: 'tailNumber', width: 12 },
    { header: 'Qty', key: 'quantity', width: 10 },
    { header: 'Condition', key: 'condition', width: 14 },
    { header: 'Certificate', key: 'certificate', width: 16 },
    { header: 'Target date', key: 'targetDate', width: 14 },
    { header: 'Delivery', key: 'deliveryLocation', width: 26 },
    { header: 'Message', key: 'message', width: 48 },
    { header: 'Source', key: 'source', width: 18 },
  ];

  ws.getRow(1).font = { bold: true };
  ws.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF05365C' },
  };
  ws.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };

  for (const lead of leads) {
    ws.addRow({
      ...lead,
      createdAt: lead.createdAt ? new Date(lead.createdAt).toISOString().slice(0, 19).replace('T', ' ') : '',
      targetDate: lead.targetDate ? new Date(lead.targetDate).toISOString().slice(0, 10) : '',
    });
  }

  const buf = await wb.xlsx.writeBuffer();
  return Buffer.from(buf);
}
