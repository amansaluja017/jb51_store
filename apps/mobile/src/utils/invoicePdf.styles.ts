/**
 * Print & Display Styles for JB51 Invoice and Credit Ledger Statements
 */
export const INVOICE_PDF_CSS = `
  @page {
    size: A4;
    margin: 14mm 14mm 14mm 14mm;
  }
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #18181b;
    padding: 24px;
    margin: 0;
    line-height: 1.45;
    background-color: #f4f4f5;
  }
  .page-box {
    max-width: 820px;
    margin: 0 auto 32px auto;
    border: 1px solid #e4e4e7;
    position: relative;
    background-color: #ffffff;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  .page-break {
    page-break-before: always !important;
    break-before: page !important;
  }
  @media print {
    body {
      background-color: #ffffff;
      padding: 0;
    }
    .page-box {
      border: none;
      box-shadow: none;
      margin: 0;
      border-radius: 0;
      max-width: 100%;
    }
    .page-break {
      page-break-before: always !important;
      break-before: page !important;
    }
  }
  .top-accent-bar {
    height: 5px;
    background-color: #FF5E36;
    width: 100%;
  }
  .page-content {
    padding: 36px 40px;
  }
  .header-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid #f4f4f5;
    padding-bottom: 22px;
    margin-bottom: 24px;
  }
  .brand-title {
    font-size: 26px;
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
    margin: 3px 0 10px 0;
  }
  .brand-details {
    font-size: 11px;
    color: #71717a;
    line-height: 16px;
  }
  .invoice-details {
    text-align: right;
    font-size: 11px;
    line-height: 19px;
  }
  .invoice-title {
    font-size: 22px;
    font-weight: 900;
    color: #18181b;
    letter-spacing: 1.5px;
    margin: 0 0 6px 0;
  }
  .page-badge {
    display: inline-block;
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 2px 8px;
    border-radius: 4px;
    background-color: #f4f4f5;
    color: #52525b;
    margin-bottom: 4px;
  }
  .page-badge-credit {
    background-color: #ffedd5;
    color: #c2410c;
  }
  .client-block {
    margin-bottom: 24px;
    padding: 16px 20px;
    background-color: #fafafa;
    border-radius: 6px;
    border-left: 3px solid #FF5E36;
  }
  .bill-to {
    font-size: 9px;
    font-weight: 700;
    color: #71717a;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-bottom: 4px;
  }
  .client-name {
    font-size: 15px;
    font-weight: 700;
    color: #18181b;
  }
  .client-meta {
    font-size: 11px;
    color: #52525b;
    margin-top: 2px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
  }
  th {
    background-color: #fafafa;
    color: #52525b;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 1px;
    padding: 10px 12px;
    border-bottom: 2px solid #e4e4e7;
    text-align: left;
  }
  td {
    padding: 10px 12px;
    border-bottom: 1px solid #f4f4f5;
    font-size: 11px;
  }
  .text-center { text-align: center; }
  .text-right { text-align: right; }
  .totals-table {
    width: 380px;
    margin-left: auto;
    margin-top: 8px;
    margin-bottom: 18px;
  }
  .totals-table td {
    padding: 5px 12px;
    border: none;
    font-size: 11px;
  }
  .grand-total-row td {
    border-top: 2px solid #18181b;
    font-size: 13px;
    padding-top: 8px;
  }
  .grand-total-val {
    color: #FF5E36;
    font-size: 15px;
  }
  .credit-notice-banner {
    margin-top: 18px;
    padding: 12px 16px;
    background-color: #fffaf5;
    border: 1px solid #fed7aa;
    border-radius: 6px;
    font-size: 11px;
    color: #9a3412;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .credit-notice-badge {
    font-weight: 700;
    background-color: #ffedd5;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 10px;
    color: #c2410c;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 22px;
  }
  .metric-card {
    border: 1px solid #e4e4e7;
    border-radius: 6px;
    padding: 12px 14px;
    background-color: #fafafa;
  }
  .metric-card-highlight {
    border-color: #fed7aa;
    background-color: #fff7ed;
  }
  .metric-title {
    font-size: 9px;
    font-weight: 700;
    text-transform: uppercase;
    color: #71717a;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }
  .metric-value {
    font-size: 15px;
    font-weight: 800;
    color: #18181b;
  }
  .metric-val-green {
    color: #16a34a;
  }
  .metric-val-orange {
    color: #c2410c;
  }
  .metric-sub {
    font-size: 9px;
    color: #71717a;
    margin-top: 2px;
  }
  .tx-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 22px;
  }
  .tx-table th {
    background-color: #fff7ed;
    color: #9a3412;
    font-size: 10px;
    font-weight: 700;
    padding: 9px 12px;
    border-bottom: 1px solid #fed7aa;
  }
  .tx-table td {
    padding: 9px 12px;
    border-bottom: 1px solid #fed7aa;
    font-size: 11px;
    color: #18181b;
  }
  .tx-type-tag {
    display: inline-block;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 3px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .tag-adv {
    background-color: #dcfce7;
    color: #15803d;
  }
  .tag-pay {
    background-color: #e0f2fe;
    color: #0369a1;
  }
  .terms-box {
    margin-top: 18px;
    padding: 12px 16px;
    background-color: #fafafa;
    border-radius: 6px;
    font-size: 10px;
    color: #52525b;
    border: 1px solid #e4e4e7;
    line-height: 16px;
  }
  .signatures-row {
    display: flex;
    justify-content: space-between;
    margin-top: 36px;
    padding-top: 16px;
  }
  .signature-box {
    width: 220px;
    text-align: center;
  }
  .signature-line {
    border-top: 1px dashed #a1a1aa;
    margin-bottom: 6px;
  }
  .signature-title {
    font-size: 10px;
    font-weight: 600;
    color: #52525b;
  }
  .page-footer {
    margin-top: 30px;
    padding-top: 12px;
    border-top: 1px solid #f4f4f5;
    display: flex;
    justify-content: space-between;
    font-size: 10px;
    color: #a1a1aa;
  }
`;
