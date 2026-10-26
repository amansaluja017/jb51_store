import { InvoiceItem } from '../screens/InvoiceScreen';
import { formatDateSafe } from './date';
import { INVOICE_PDF_CSS } from './invoicePdf.styles';

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
  paidAmount?: number;
  dueAmount?: number;
  dueDate?: string | null;
  paymentDate?: string | null;
  advancePaymentMode?: string | null;
  transactions?: any[];
  creditTransactions?: any[];
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

  const isCredit = (inv.paymentMethod || '').toLowerCase() === 'credit';
  const totalPaid =
    inv.paidAmount !== undefined && inv.paidAmount !== null
      ? Number(inv.paidAmount)
      : isCredit
        ? 0
        : inv.totalAmount;
  const balanceDue =
    inv.dueAmount !== undefined && inv.dueAmount !== null
      ? Number(inv.dueAmount)
      : Math.max(0, inv.totalAmount - totalPaid);

  // Consolidate credit transactions list
  const txList =
    Array.isArray(inv.creditTransactions) && inv.creditTransactions.length > 0
      ? inv.creditTransactions
      : Array.isArray(inv.transactions) && inv.transactions.length > 0
        ? inv.transactions
        : [];

  // Fallback: If credit invoice has paidAmount > 0 but no transaction rows yet, synthesize the advance row
  const displayTransactions = [...txList];
  if (isCredit && displayTransactions.length === 0 && totalPaid > 0) {
    displayTransactions.push({
      createdAt: inv.date,
      transactionType: 'advance',
      paymentMode: inv.advancePaymentMode || 'cash',
      amount: totalPaid,
      notes: 'Initial advance payment on invoice creation',
    });
  }

  // Sort transactions chronologically (oldest to newest)
  displayTransactions.sort((a: any, b: any) => {
    const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return timeA - timeB;
  });

  // Calculate totals for advance and installments
  const totalAdvance = displayTransactions
    .filter((tx: any) => (tx.transactionType || '').toLowerCase() === 'advance')
    .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);

  const totalInstallments = displayTransactions
    .filter((tx: any) => (tx.transactionType || '').toLowerCase() !== 'advance')
    .reduce((sum: number, tx: any) => sum + Number(tx.amount || 0), 0);

  // Calculate running balance for each transaction
  let runningDue = inv.totalAmount;
  const enrichedTransactions = displayTransactions.map((tx: any) => {
    const amt = Number(tx.amount || 0);
    runningDue = Math.max(0, runningDue - amt);
    return {
      ...tx,
      runningBalance: runningDue,
    };
  });

  const currentDateStr = formatDateSafe(new Date());

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${escapeHtml(inv.id)}</title>
      <style>
        ${INVOICE_PDF_CSS}
      </style>
    </head>
    <body>

      <!-- PAGE 1: TAX INVOICE -->
      <div class="page-box">
        <div class="top-accent-bar"></div>
        <div class="page-content">
          <div class="header-row">
            <div>
              <h1 class="brand-title">JB51</h1>
              <div class="brand-subtitle">EST. 1951</div>
              <div class="brand-details">
                Chandni Chowk, New Delhi, India<br>
                support@jb51.shop | +91 98100 00051
              </div>
            </div>
            <div class="invoice-details">
              <div class="invoice-title">INVOICE</div>
              <strong>Invoice #:</strong> ${escapeHtml(inv.id)}<br>
              <strong>Invoice Date:</strong> ${escapeHtml(inv.date)}<br>
              ${inv.paymentDate ? `<strong>Payment Date:</strong> ${escapeHtml(inv.paymentDate)}<br>` : ''}
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
                  <td>${escapeHtml(item.name || item.productName)}</td>
                  <td class="text-center">${item.quantity}</td>
                  <td class="text-right">&#8377;${(Number(item.price || item.unitPrice) || 0).toLocaleString('en-IN')}</td>
                  <td class="text-right" style="font-weight: 700;">&#8377;${(Number(item.total) || 0).toLocaleString('en-IN')}</td>
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
              ${
                isCredit
                  ? `
                <tr style="border-top: 1px dashed #cbd5e1;">
                  <td style="color: #16a34a; font-weight: 600;">Advance Paid:</td>
                  <td class="text-right" style="color: #16a34a; font-weight: 700;">&#8377;${totalPaid.toLocaleString('en-IN')}</td>
                </tr>
                <tr style="background-color: #fff7ed;">
                  <td style="color: #c2410c; font-weight: 700;">Remaining Balance Due:</td>
                  <td class="text-right" style="color: #c2410c; font-weight: 800; font-size: 13px;">&#8377;${balanceDue.toLocaleString('en-IN')}</td>
                </tr>
                ${
                  inv.dueDate
                    ? `
                <tr>
                  <td style="color: #64748b; font-size: 11px;">Payment Due By:</td>
                  <td class="text-right" style="color: #64748b; font-size: 11px; font-weight: 600;">${escapeHtml(formatDateSafe(inv.dueDate))}</td>
                </tr>
                `
                    : ''
                }
              `
                  : ''
              }
            </tbody>
          </table>

          ${
            isCredit
              ? `
            <div class="credit-notice-banner">
              <div>
                <strong>Credit Sale Notice:</strong> Complete statement of installments and transaction history is documented on <strong>Page 2</strong>.
              </div>
              <span class="credit-notice-badge">See Page 2</span>
            </div>
          `
              : ''
          }

          ${
            inv.notes
              ? `
            <div style="margin-top: 16px; padding: 12px 16px; background-color: #fafafa; border-radius: 6px; font-size: 11px; color: #52525b; border: 1px solid #f4f4f5;">
              <strong>Notes / Instructions:</strong><br>
              ${escapedNotes}
            </div>
          `
              : ''
          }
          
          <div class="page-footer">
            <span>Thank you for your purchasing at JB51. All goods sold are subject to store policies.</span>
            <span>${isCredit ? 'Page 1 of 2' : 'Page 1 of 1'}</span>
          </div>
        </div>
      </div>

      ${
        isCredit
          ? `
      <!-- PAGE 2: PAYMENT & CREDIT TRANSACTION LEDGER -->
      <div class="page-box page-break">
        <div class="top-accent-bar"></div>
        <div class="page-content">
          <div class="header-row">
            <div>
              <h1 class="brand-title">JB51</h1>
              <div class="brand-subtitle">EST. 1951</div>
              <div class="brand-details">
                Chandni Chowk, New Delhi, India<br>
                support@jb51.shop | +91 98100 00051
              </div>
            </div>
            <div class="invoice-details">
              <div class="invoice-title" style="font-size: 18px; color: #c2410c;">STATEMENT OF CREDIT</div>
              <strong>Ref Invoice #:</strong> ${escapeHtml(inv.id)}<br>
              <strong>Invoice Date:</strong> ${escapeHtml(inv.date)}<br>
              <strong>Statement Date:</strong> ${escapeHtml(currentDateStr)}<br>
              <strong>Customer:</strong> ${escapeHtml(inv.clientName)}
            </div>
          </div>

          <!-- Account Overview Cards -->
          <div class="summary-grid">
            <div class="metric-card">
              <div class="metric-title">Total Invoice Value</div>
              <div class="metric-value">&#8377;${inv.totalAmount.toLocaleString('en-IN')}</div>
              <div class="metric-sub">Principal Amount</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Advance Paid</div>
              <div class="metric-value metric-val-green">&#8377;${totalAdvance.toLocaleString('en-IN')}</div>
              <div class="metric-sub">${escapeHtml((inv.advancePaymentMode || 'Cash').toUpperCase())}</div>
            </div>
            <div class="metric-card">
              <div class="metric-title">Installments Paid</div>
              <div class="metric-value metric-val-green">&#8377;${totalInstallments.toLocaleString('en-IN')}</div>
              <div class="metric-sub">${enrichedTransactions.filter((t: any) => (t.transactionType || '').toLowerCase() !== 'advance').length} Payments</div>
            </div>
            <div class="metric-card metric-card-highlight">
              <div class="metric-title" style="color: #c2410c;">Remaining Balance</div>
              <div class="metric-value metric-val-orange">&#8377;${balanceDue.toLocaleString('en-IN')}</div>
              <div class="metric-sub">${inv.dueDate ? `Due: ${escapeHtml(formatDateSafe(inv.dueDate))}` : 'On Account'}</div>
            </div>
          </div>

          <!-- Ledger Table -->
          <table class="tx-table">
            <thead>
              <tr>
                <th style="width: 40px;" class="text-center">#</th>
                <th style="width: 100px;">Date</th>
                <th style="width: 140px;">Type</th>
                <th style="width: 80px;">Mode</th>
                <th>Notes / Reference</th>
                <th class="text-right" style="width: 110px;">Amount Paid</th>
                <th class="text-right" style="width: 110px;">Balance Due</th>
              </tr>
            </thead>
            <tbody>
              ${
                enrichedTransactions.length === 0
                  ? `
                <tr>
                  <td colspan="7" class="text-center" style="padding: 24px; color: #a1a1aa;">
                    No payment transactions recorded yet.
                  </td>
                </tr>
              `
                  : enrichedTransactions
                      .map((tx: any, idx: number) => {
                        const type = (tx.transactionType || 'payment').toLowerCase();
                        const isAdvance = type === 'advance';
                        const txDate = formatDateSafe(tx.createdAt) || inv.date;
                        const modeLabel = (tx.paymentMode || 'cash').toUpperCase();
                        const amt = Number(tx.amount || 0);
                        const rowBalance = Number(tx.runningBalance || 0);

                        return `
                          <tr>
                            <td class="text-center" style="color: #71717a; font-weight: 600;">${idx + 1}</td>
                            <td><strong>${escapeHtml(txDate)}</strong></td>
                            <td>
                              <span class="tx-type-tag ${isAdvance ? 'tag-adv' : 'tag-pay'}">
                                ${isAdvance ? 'Advance Payment' : 'Installment Payment'}
                              </span>
                            </td>
                            <td><strong>${escapeHtml(modeLabel)}</strong></td>
                            <td style="color: #52525b; font-size: 10px;">
                              ${tx.notes ? escapeHtml(tx.notes) : isAdvance ? 'Initial advance paid on creation' : 'Installment towards outstanding balance'}
                            </td>
                            <td class="text-right" style="font-weight: 700; color: #16a34a;">
                              + &#8377;${amt.toLocaleString('en-IN')}
                            </td>
                            <td class="text-right" style="font-weight: 800; color: ${rowBalance > 0 ? '#c2410c' : '#16a34a'};">
                              &#8377;${rowBalance.toLocaleString('en-IN')}
                            </td>
                          </tr>
                        `;
                      })
                      .join('')
              }
            </tbody>
          </table>

          <!-- Terms and Settling Policy -->
          <div class="terms-box">
            <strong>Credit Settlement Terms:</strong><br>
            • All payments received are credited towards Invoice #${escapeHtml(inv.id)} upon verification.<br>
            ${inv.dueDate ? `• Complete outstanding balance of &#8377;${balanceDue.toLocaleString('en-IN')} must be settled on or before <strong>${escapeHtml(formatDateSafe(inv.dueDate))}</strong>.<br>` : ''}
            • For any clarifications regarding this ledger statement, please contact support@jb51.shop or call +91 98100 00051.
          </div>

          <div class="page-footer">
            <span>Official JB51 Credit Ledger Statement • Computer Generated</span>
            <span>Page 2 of 2</span>
          </div>
        </div>
      </div>
      `
          : ''
      }

    </body>
    </html>
  `;
};

export default generateInvoiceHtml;
