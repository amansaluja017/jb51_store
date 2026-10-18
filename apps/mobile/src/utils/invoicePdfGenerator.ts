import { InvoiceItem } from '../screens/InvoiceScreen';

export interface GenerateInvoicePdfData {
  id: string;
  clientName: string;
  clientPhone?: string;
  clientEmail?: string;
  clientAddress?: string;
  date: string;
  items: InvoiceItem[];
  subtotal: number;
  taxRate: string;
  taxAmount: number;
  discount: number;
  totalAmount: number;
  paymentMethod: string;
  notes?: string;
}

export const generateInvoiceHtml = (inv: GenerateInvoicePdfData) => {
    const escapeHtml = (unsafe: any) => {
      if (unsafe === null || unsafe === undefined) return '';
      return String(unsafe)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    };

    const escapedNotes = inv.notes
      ? escapeHtml(inv.notes).replace(/\r?\n/g, '<br>')
      : '';

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Invoice ${escapeHtml(inv.id)}</title>
        <style>
          body {
            font-family: 'Helvetica Neue', 'Helvetica', Helvetica, Arial, sans-serif;
            color: #18181b;
            padding: 36px;
            line-height: 1.4;
            background-color: #fff;
          }
          .invoice-box {
            max-width: 800px;
            margin: auto;
            border: 1px solid #e4e4e7;
            position: relative;
            background-color: #fff;
            border-radius: 8px;
            overflow: hidden;
          }
          .top-border {
            height: 6px;
            background-color: #FF5E36;
            width: 100%;
          }
          .content-box {
            padding: 36px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            border-bottom: 2px solid #f4f4f5;
            padding-bottom: 24px;
            margin-bottom: 28px;
          }
          .brand-title {
            font-size: 28px;
            font-weight: 800;
            letter-spacing: 2px;
            margin: 0;
            color: #18181b;
          }
          .brand-subtitle {
            font-size: 8px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 3px;
            color: #FF5E36;
            margin: 3px 0 12px 0;
          }
          .brand-details {
            font-size: 11px;
            color: #71717a;
            line-height: 16px;
          }
          .invoice-details {
            text-align: right;
            font-size: 12px;
            line-height: 20px;
          }
          .invoice-title {
            font-size: 22px;
            font-weight: 900;
            color: #18181b;
            letter-spacing: 1px;
            margin: 0 0 8px 0;
          }
          .client-block {
            margin-bottom: 30px;
            padding: 16px 20px;
            background-color: #fafafa;
            border-radius: 6px;
            border-left: 3px solid #FF5E36;
          }
          .bill-to {
            font-size: 10px;
            font-weight: 700;
            color: #71717a;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            margin-bottom: 4px;
          }
          .client-name {
            font-size: 16px;
            font-weight: 700;
            color: #18181b;
          }
          .client-meta {
            font-size: 12px;
            color: #52525b;
            margin-top: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
          }
          th {
            background-color: #fafafa;
            color: #52525b;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 12px;
            border-bottom: 2px solid #e4e4e7;
            text-align: left;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #f4f4f5;
            font-size: 12px;
          }
          .text-center { text-align: center; }
          .text-right { text-align: right; }
          .totals-table {
            width: 320px;
            margin-left: auto;
            margin-top: 12px;
          }
          .totals-table td {
            padding: 6px 12px;
            border: none;
            font-size: 12px;
          }
          .grand-total-row td {
            border-top: 2px solid #18181b;
            font-size: 14px;
            padding-top: 10px;
          }
          .grand-total-val {
            color: #FF5E36;
            font-size: 16px;
          }
          .notes-box {
            margin-top: 24px;
            padding: 14px 18px;
            background-color: #fafafa;
            border-radius: 6px;
            font-size: 12px;
            color: #52525b;
            border: 1px solid #f4f4f5;
          }
          .footer {
            margin-top: 36px;
            padding-top: 16px;
            border-top: 1px solid #f4f4f5;
            text-align: center;
            font-size: 11px;
            color: #a1a1aa;
          }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="top-border"></div>
          <div class="content-box">
            <div class="header">
              <div>
                <h1 class="brand-title">JB51</h1>
                <div class="brand-subtitle">EST. 1951 - ATELIER</div>
                <div class="brand-details">
                  Chandni Chowk, New Delhi, India<br>
                  atelier@jb51.store | +91 98100 00051
                </div>
              </div>
              <div class="invoice-details">
                <div class="invoice-title">INVOICE</div>
                <strong>Invoice #:</strong> ${escapeHtml(inv.id)}<br>
                <strong>Date:</strong> ${escapeHtml(inv.date)}<br>
                <strong>Payment Mode:</strong> ${escapeHtml(inv.paymentMethod)}
              </div>
            </div>
            
            <div class="client-block">
              <div class="bill-to">BILL TO</div>
              <div class="client-name">${escapeHtml(inv.clientName)}</div>
              ${inv.clientPhone ? `<div class="client-meta">Phone: ${escapeHtml(inv.clientPhone)}</div>` : ''}
              ${inv.clientEmail ? `<div class="client-meta">Email: ${escapeHtml(inv.clientEmail)}</div>` : ''}
              ${inv.clientAddress ? `<div class="client-meta">Address: ${escapeHtml(inv.clientAddress)}</div>` : ''}
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th class="text-center" style="width: 70px;">Qty</th>
                  <th class="text-right" style="width: 110px;">Rate</th>
                  <th class="text-right" style="width: 120px;">Amount</th>
                </tr>
              </thead>
              <tbody>
                ${inv.items
                  .map(
                    (item: any) => `
                  <tr>
                    <td>${escapeHtml(item.name)}</td>
                    <td class="text-center">${item.quantity}</td>
                    <td class="text-right">&#8377;${item.price.toLocaleString('en-IN')}</td>
                    <td class="text-right" style="font-weight: 700;">&#8377;${item.total.toLocaleString('en-IN')}</td>
                  </tr>
                `
                  )
                  .join('')}
              </tbody>
            </table>
            
            <table class="totals-table">
              <tbody>
                <tr>
                  <td>Subtotal:</td>
                  <td class="text-right">&#8377;${inv.subtotal.toLocaleString('en-IN')}</td>
                </tr>
                <tr>
                  <td>GST (${escapeHtml(inv.taxRate)}%):</td>
                  <td class="text-right">&#8377;${inv.taxAmount.toLocaleString('en-IN')}</td>
                </tr>
                ${
                  inv.discount > 0
                    ? `
                  <tr>
                    <td>Discount:</td>
                    <td class="text-right" style="color: #16a34a;">- &#8377;${inv.discount.toLocaleString('en-IN')}</td>
                  </tr>
                `
                    : ''
                }
                <tr class="grand-total-row">
                  <td><strong>Grand Total:</strong></td>
                  <td class="text-right"><strong class="grand-total-val">&#8377;${inv.totalAmount.toLocaleString('en-IN')}</strong></td>
                </tr>
              </tbody>
            </table>

            ${
              inv.notes
                ? `
              <div class="notes-box">
                <strong>Notes / Instructions:</strong><br>
                ${escapedNotes}
              </div>
            `
                : ''
            }
            
            <div class="footer">
              Thank you for shopping with JB51. All rights reserved.
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  };

export default generateInvoiceHtml;
