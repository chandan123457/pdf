import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Alert, Platform } from 'react-native';

export interface PDFData {
  title: string;
  subtitle: string;
  finalResults?: Array<{
    label: string;
    value: string;
    unit: string;
  }>;
  sections: Array<{
    title: string;
    items: Array<{
      label: string;
      value: string;
      unit: string;
      isHighlighted?: boolean;
    }>;
  }>;
  inputs?: Array<{
    title: string;
    items: Array<{
      label: string;
      value: string;
      unit: string;
    }>;
  }>;
}

export const generateAndSharePDF = async (data: PDFData) => {
  try {
    const htmlContent = generateHTMLContent(data);
    
    // Generate PDF
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
    });

    // Share the PDF
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, {
        mimeType: 'application/pdf',
        dialogTitle: `Share ${data.title}`,
        UTI: 'com.adobe.pdf',
      });
    } else {
      Alert.alert('Error', 'Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    Alert.alert('Error', 'Failed to generate PDF. Please try again.');
  }
};

const generateHTMLContent = (data: PDFData): string => {
  // Create main results section if provided
  const mainResultsHTML = data.finalResults ? `
    <div class="main-results-section">
      <div class="main-results-header">
        <div class="main-results-title">Main Results</div>
      </div>
      <div class="main-results-content">
        <div class="main-results-grid">
          ${data.finalResults.map(item => `
            <div class="main-result-item">
              <div class="main-result-label">${item.label}</div>
              <div class="main-result-value">${item.value} ${item.unit}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  ` : '';
  
  // Create outputs section
  const outputsHTML = data.sections.length > 0 ? `
    <div class="outputs-section">
      <div class="section-header">
        <div class="section-title">Outputs</div>
      </div>
      <div class="section-content">
        ${data.sections.map(section => `
          <div style="margin-bottom: 1mm;">
            <div style="font-size: 6px; font-weight: bold; color: #1e40af; margin-bottom: 0.5mm; text-transform: uppercase;">${section.title}</div>
            <table class="data-table">
              ${section.items.map(item => `
                <tr class="${item.isHighlighted ? 'highlighted-row' : ''}">
                  <td class="table-label">${item.label}</td>
                  <td class="table-value">${item.value} ${item.unit}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';
  
  // Create inputs section
  const inputsHTML = data.inputs ? `
    <div class="inputs-section">
      <div class="section-header">
        <div class="section-title">Inputs</div>
      </div>
      <div class="section-content">
        ${data.inputs.map(inputSection => `
          <div style="margin-bottom: 1mm;">
            <div style="font-size: 6px; font-weight: bold; color: #1e40af; margin-bottom: 0.5mm; text-transform: uppercase;">${inputSection.title}</div>
            <table class="data-table">
              ${inputSection.items.map(item => `
                <tr>
                  <td class="table-label">${item.label}</td>
                  <td class="table-value">${item.value} ${item.unit}</td>
                </tr>
              `).join('')}
            </table>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${data.title}</title>
      <style>
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
        }
        
        @page { 
          size: A4; 
          margin: 10mm; 
        }
        
        body {
          font-family: 'Arial', 'Helvetica', sans-serif;
          line-height: 1.3;
          color: #000;
          background: #ffffff;
          font-size: 11px;
          height: 100vh;
          display: flex;
          flex-direction: column;
          max-height: 277mm;
        }
        
        /* Header Section */
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 4mm;
          padding-bottom: 2mm;
          border-bottom: 1px solid #2563eb;
        }
        
        .brand-section {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        
        .logo {
          width: 30px;
          height: 30px;
          border-radius: 3px;
          background-image: url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==');
          background-size: contain;
          background-repeat: no-repeat;
          background-position: center;
        }
        
        .brand-title {
          font-size: 16px;
          font-weight: bold;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .date-section {
          text-align: right;
          font-size: 10px;
          color: #64748b;
        }
        
        /* Main Title */
        .main-title {
          text-align: center;
          font-size: 14px;
          font-weight: bold;
          margin-bottom: 3mm;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #1e40af;
        }
        
        /* Main Results Section */
        .main-results-section {
          margin-bottom: 3mm;
          border: 1px solid #2563eb;
          border-radius: 3px;
          overflow: hidden;
          background: #f8fafc;
        }
        
        .main-results-header {
          background: #2563eb;
          padding: 1.5mm 2mm;
          text-align: center;
        }
        
        .main-results-title {
          font-size: 10px;
          font-weight: bold;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .main-results-content {
          padding: 2mm;
          background: white;
        }
        
        .main-results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr 1fr;
          gap: 1mm;
        }
        
        .main-result-item {
          padding: 1mm;
          background: #eff6ff;
          border-radius: 2px;
          text-align: center;
          border: 1px solid #dbeafe;
        }
        
        .main-result-label {
          font-size: 7px;
          color: #1e40af;
          font-weight: 600;
          margin-bottom: 0.5mm;
        }
        
        .main-result-value {
          font-size: 9px;
          color: #2563eb;
          font-weight: bold;
        }
        
        /* Main Content Grid */
        .main-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2mm;
          margin-bottom: 2mm;
        }
        
        /* Outputs and Inputs Sections */
        .outputs-section, .inputs-section {
          border: 1px solid #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .section-header {
          background: #f1f5f9;
          padding: 1mm 1.5mm;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .section-title {
          font-size: 8px;
          font-weight: bold;
          color: #1e40af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .section-content {
          padding: 1mm 1.5mm;
          background: #fff;
        }
        
        /* Compact Data Table */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 7px;
        }
        
        .data-table tr {
          border-bottom: 1px solid #f1f5f9;
        }
        
        .data-table tr:last-child {
          border-bottom: none;
        }
        
        .data-table tr.highlighted-row {
          background: #eff6ff;
          font-weight: bold;
        }
        
        .table-label {
          padding: 0.5mm 1mm;
          color: #374151;
          font-size: 7px;
          width: 70%;
        }
        
        .table-value {
          padding: 0.5mm 1mm;
          color: #2563eb;
          font-weight: 600;
          font-size: 7px;
          text-align: right;
          width: 30%;
        }
        
        .highlighted-row .table-label {
          color: #1e40af;
          font-weight: bold;
        }
        
        .highlighted-row .table-value {
          color: #1d4ed8;
          font-weight: bold;
        }
        
        /* Watermark */
        .watermark {
          position: fixed;
          top: 60%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 120px;
          color: rgba(37, 99, 235, 0.08);
          font-weight: bold;
          z-index: -1;
          pointer-events: none;
          text-align: center;
          white-space: nowrap;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        /* Footer Note */
        .footer-note {
          text-align: center;
          margin-top: 3mm;
          padding: 2mm;
          background: #f8fafc;
          border-radius: 4px;
          border: 1px solid #e2e8f0;
        }
        
        .footer-text {
          font-size: 9px;
          color: #64748b;
          font-weight: 500;
        }
        
        /* Print optimizations */
        @media print {
          body { 
            font-size: 7px; 
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            max-height: 277mm;
          }
          
          .brand-title { font-size: 14px; }
          .main-title { font-size: 12px; }
          .section-title { font-size: 7px; }
          .table-label, .table-value { font-size: 6px; }
          .main-result-label { font-size: 6px; }
          .main-result-value { font-size: 8px; }
          
          .main-content {
            gap: 1.5mm;
          }
          
          .section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .watermark {
            display: block;
            color: rgba(37, 99, 235, 0.06);
            font-size: 100px;
          }
        }
      </style>
    </head>
    <body>
      <!-- Watermark -->
      <div class="watermark">ENZO</div>
      
      <!-- Header -->
      <div class="header">
        <div class="brand-section">
          <div class="logo"></div>
          <div class="brand-title">Enzo CoolCalc</div>
        </div>
        <div class="date-section">
          ${new Date().toLocaleDateString()}
        </div>
      </div>
      
      <!-- Main Title -->
      <div class="main-title">${data.title}</div>
      
      <!-- Main Results Section -->
      ${mainResultsHTML}
      
      <!-- Main Content Grid -->
      <div class="main-content">
        <!-- Outputs Section -->
        ${outputsHTML}
        
        <!-- Inputs Section -->
        ${inputsHTML}
      </div>
      
      <!-- Footer Note -->
      <div class="footer-note">
        <div class="footer-text">Professional Heat Load Calculations - Powered by Enzo</div>
      </div>
    </body>
    </html>
  `;
};
