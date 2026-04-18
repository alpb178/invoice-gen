// src/utils/pdfGenerator.js
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

function fmt(n) {
  return (n || 0).toFixed(2);
}

function calcSubtotal(section) {
  return (section.tasks || []).reduce((a, t) => a + (t.amount || 0), 0);
}

function generateHTML(invoice, showHours = false) {
  const cur = invoice.currency || 'USD';
  const total = (invoice.sections || []).reduce((a, s) => a + calcSubtotal(s), 0);

  const sectionsHTML = (invoice.sections || []).map((sec, sIdx) => {
    const subtotal = calcSubtotal(sec);
    const tasksHTML = (sec.tasks || []).map((t, tIdx) => `
      <tr>
        <td style="padding:6px 4px;border-bottom:1px solid #eee;font-size:10px;">${t.number || tIdx + 1}</td>
        <td style="padding:6px 4px;border-bottom:1px solid #eee;font-size:10px;">${t.code ? t.code + ' ' : ''}${t.description}</td>
        ${showHours ? `<td style="padding:6px 4px;border-bottom:1px solid #eee;font-size:10px;text-align:right;">${t.hours ? t.hours.toFixed(1) : '-'}</td>` : ''}
        <td style="padding:6px 4px;border-bottom:1px solid #eee;font-size:10px;text-align:right;">${fmt(t.amount)}</td>
      </tr>
    `).join('');

    return `
      <h3 style="font-size:14px;margin:20px 0 8px;font-weight:bold;">${sec.title}${sec.subtitle ? ' ' + sec.subtitle : ''}</h3>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f4f4f4;">
            <th style="padding:5px 4px;text-align:left;font-size:8px;text-transform:uppercase;color:#555;border-bottom:1px solid #ccc;width:6%;">Nº</th>
            <th style="padding:5px 4px;text-align:left;font-size:8px;text-transform:uppercase;color:#555;border-bottom:1px solid #ccc;">Tarea</th>
            ${showHours ? '<th style="padding:5px 4px;text-align:right;font-size:8px;text-transform:uppercase;color:#555;border-bottom:1px solid #ccc;width:10%;">Horas</th>' : ''}
            <th style="padding:5px 4px;text-align:right;font-size:8px;text-transform:uppercase;color:#555;border-bottom:1px solid #ccc;width:15%;">Estimación (${cur})</th>
          </tr>
        </thead>
        <tbody>${tasksHTML}</tbody>
      </table>
      <div style="text-align:right;margin:6px 0 12px;font-size:11px;">
        <strong>Subtotal Sección ${sIdx + 1}: ${fmt(subtotal)} ${cur}</strong>
      </div>
    `;
  }).join('');

  const subtotalsHTML = (invoice.sections || []).map((sec, i) => 
    `<div style="margin:2px 0;font-size:10px;">• Subtotal Sección ${i + 1}: <strong>${fmt(calcSubtotal(sec))} ${cur}</strong></div>`
  ).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><style>body{font-family:Helvetica,Arial,sans-serif;padding:30px;color:#1a1a1a;font-size:11px;}</style></head>
    <body>
      <h1 style="font-size:24px;margin:0;">FACTURA - No. ${invoice.number}</h1>
      <hr style="border:1px solid #000;margin:10px 0 16px;">

      <div style="margin-bottom:14px;">
        <div style="font-size:13px;font-weight:bold;">${invoice.companyName}</div>
        ${invoice.companyCIF ? `<div style="font-size:9px;color:#444;">CIF: <strong>${invoice.companyCIF}</strong></div>` : ''}
        ${invoice.companyAddress ? `<div style="font-size:9px;color:#444;">${invoice.companyAddress}</div>` : ''}
      </div>

      <div style="margin-bottom:20px;">
        <div style="font-weight:bold;font-size:10px;">Emitido a favor de:</div>
        <div style="font-size:12px;font-weight:bold;">${invoice.clientName}</div>
        ${invoice.clientIBAN ? `<div style="font-size:9px;">IBAN: <strong>${invoice.clientIBAN}</strong></div>` : ''}
        ${invoice.clientSwift ? `<div style="font-size:9px;">Swift/BIC: <strong>${invoice.clientSwift}</strong></div>` : ''}
        ${invoice.clientBank ? `<div style="font-size:9px;">Nombre y dirección del Banco: <strong>${invoice.clientBank}</strong></div>` : ''}
      </div>

      ${sectionsHTML}

      <div style="margin-top:24px;padding:14px;background:#f9f9f9;border:1px solid #ddd;border-radius:4px;">
        <h3 style="font-size:14px;margin:0 0 8px;font-weight:bold;">TOTAL GENERAL</h3>
        ${subtotalsHTML}
        <hr style="margin:8px 0;">
        <div style="font-size:14px;font-weight:bold;">💰 TOTAL GENERAL A PAGAR: ${fmt(total)} ${cur}</div>
      </div>

      ${invoice.notes ? `<div style="margin-top:14px;font-size:9px;color:#666;">Notas: ${invoice.notes}</div>` : ''}

      <div style="text-align:center;margin-top:30px;font-size:8px;color:#999;">Factura generada automáticamente · ${invoice.date}</div>
    </body>
    </html>
  `;
}

export async function generateAndSharePDF(invoice, showHours = false) {
  const html = generateHTML(invoice, showHours);

  const { uri } = await Print.printToFileAsync({
    html,
    base64: false,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: `Factura ${invoice.number}`,
      UTI: 'com.adobe.pdf',
    });
  }

  return uri;
}
