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
  // Create final results section if provided
  const finalResultsHTML = data.finalResults ? `
    <div class="final-results-section">
      <div class="final-results-header">
        <div class="final-results-title">Final Results</div>
      </div>
      <div class="final-results-content">
        <div class="final-results-grid">
          ${data.finalResults.map(item => `
            <div class="final-result-item">
              <div class="final-result-label">${item.label}</div>
              <div class="final-result-value">${item.value} ${item.unit}</div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  ` : '';
  
  // Create input sections if provided
  const inputsHTML = data.inputs ? `
    <div class="inputs-section">
      <div class="inputs-grid">
        ${data.inputs.map(inputSection => `
          <div class="input-group">
            <div class="input-group-header">
              <div class="input-group-title">${inputSection.title}</div>
            </div>
            <div class="input-group-content">
              <table class="data-table">
                ${inputSection.items.map(item => `
                  <tr>
                    <td class="table-label">${item.label}</td>
                    <td class="table-value">${item.value} ${item.unit}</td>
                  </tr>
                `).join('')}
              </table>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  ` : '';
  
  // Create result sections with proper formatting matching the image
  const sectionsHTML = data.sections.map(section => `
    <div class="section">
      <div class="section-header">
        <div class="section-title">${section.title}</div>
      </div>
      <div class="section-content">
        <table class="data-table">
          ${section.items.map(item => `
            <tr class="${item.isHighlighted ? 'highlighted-row' : ''}">
              <td class="table-label">${item.label}</td>
              <td class="table-value">${item.value} ${item.unit}</td>
            </tr>
          `).join('')}
        </table>
      </div>
    </div>
  `).join('');

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
          margin-bottom: 6mm;
          padding-bottom: 3mm;
          border-bottom: 2px solid #2563eb;
        }
        
        .brand-section {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        
        .logo {
          width: 35px;
          height: 35px;
          border-radius: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #2563eb;
          color: white;
          font-weight: bold;
          font-size: 14px;
        }
        
        .brand-title {
          font-size: 20px;
          font-weight: bold;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .date-section {
          text-align: right;
          font-size: 11px;
          color: #64748b;
        }
        
        /* Main Title */
        .main-title {
          text-align: center;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 6mm;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: #1e40af;
        }
        
        /* Final Results Section */
        .final-results-section {
          margin-bottom: 4mm;
          border: 2px solid #2563eb;
          border-radius: 4px;
          overflow: hidden;
          background: #f8fafc;
        }
        
        .final-results-header {
          background: #2563eb;
          padding: 2mm 3mm;
          text-align: center;
        }
        
        .final-results-title {
          font-size: 12px;
          font-weight: bold;
          color: white;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .final-results-content {
          padding: 2mm;
          background: white;
        }
        
        .final-results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1mm;
        }
        
        .final-result-item {
          padding: 1.5mm;
          background: #eff6ff;
          border-radius: 3px;
          text-align: center;
        }
        
        .final-result-label {
          font-size: 9px;
          color: #1e40af;
          font-weight: 600;
          margin-bottom: 1mm;
        }
        
        .final-result-value {
          font-size: 11px;
          color: #2563eb;
          font-weight: bold;
        }
        
        /* Main Content Grid */
        .main-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 3mm;
        }
        
        /* Sections */
        .section {
          margin-bottom: 3mm;
          border: 1px solid #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .section-header {
          background: #f1f5f9;
          padding: 1.5mm 2mm;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .section-title {
          font-size: 9px;
          font-weight: bold;
          color: #1e40af;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .section-content {
          padding: 1.5mm 2mm;
          background: #fff;
        }
        
        /* Compact Data Table */
        .data-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 8px;
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
          padding: 1mm 1.5mm;
          color: #374151;
          font-size: 8px;
          width: 65%;
        }
        
        .table-value {
          padding: 1mm 1.5mm;
          color: #2563eb;
          font-weight: 600;
          font-size: 8px;
          text-align: right;
          width: 35%;
        }
        
        .highlighted-row .table-label {
          color: #1e40af;
          font-weight: bold;
        }
        
        .highlighted-row .table-value {
          color: #1d4ed8;
          font-weight: bold;
        }
        
        /* Inputs Section - Full Width */
        .inputs-section {
          grid-column: 1 / -1;
          margin-top: 2mm;
        }
        
        .inputs-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 2mm;
        }
        
        .input-group {
          border: 1px solid #e2e8f0;
          border-radius: 3px;
          overflow: hidden;
        }
        
        .input-group-header {
          background: #f8fafc;
          padding: 1mm 2mm;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .input-group-title {
          font-size: 8px;
          font-weight: bold;
          color: #1e40af;
          text-transform: uppercase;
        }
        
        .input-group-content {
          padding: 1mm 2mm;
          background: white;
        }
        
        /* Watermark */
        .watermark {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-45deg);
          font-size: 36px;
          color: rgba(37, 99, 235, 0.08);
          font-weight: bold;
          z-index: -1;
          pointer-events: none;
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
            font-size: 8px; 
            -webkit-print-color-adjust: exact;
            color-adjust: exact;
            max-height: 277mm;
          }
          
          .brand-title { font-size: 16px; }
          .main-title { font-size: 14px; }
          .section-title { font-size: 8px; }
          .table-label, .table-value { font-size: 7px; }
          .final-result-label { font-size: 8px; }
          .final-result-value { font-size: 10px; }
          .input-group-title { font-size: 7px; }
          
          .main-content {
            gap: 2mm;
          }
          
          .inputs-grid {
            gap: 1.5mm;
          }
          
          .section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
          
          .watermark {
            display: block;
            color: rgba(37, 99, 235, 0.05);
          }
        }
      </style>
    </head>
    <body>
      <!-- Watermark -->
      <div class="watermark">EXPO</div>
      
      <!-- Header -->
      <div class="header">
        <div class="brand-section">
          <div class="logo">E</div>
          <div class="brand-title">Enzo CoolCalc</div>
        </div>
        <div class="date-section">
          ${new Date().toLocaleDateString()}
        </div>
      </div>
      
      <!-- Main Title -->
      <div class="main-title">${data.title}</div>
      
      <!-- Final Results Section -->
      ${finalResultsHTML}
      
      <!-- Main Content Grid -->
      <div class="main-content">
        <!-- Result Sections -->
        ${sectionsHTML}
      </div>
      
      <!-- Input Sections -->
      ${inputsHTML}
      
      <!-- Footer Note -->
      <div class="footer-note">
        <div class="footer-text">Professional Heat Load Calculations - Powered by Enzo</div>
      </div>
    </body>
    </html>
  `;
};
