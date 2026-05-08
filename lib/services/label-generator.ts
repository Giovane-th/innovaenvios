import JsBarcode from "jsbarcode";

/**
 * Dados da etiqueta de envio
 */
export interface LabelData {
  // Remetente
  senderName: string;
  senderAddress: string;
  senderNumber: string;
  senderCity: string;
  senderState: string;
  senderCEP: string;

  // Destinatário
  recipientName: string;
  recipientAddress: string;
  recipientNumber: string;
  recipientComplement?: string;
  recipientCity: string;
  recipientState: string;
  recipientCEP: string;
  recipientPhone: string;

  // Objeto
  weight: number;
  serviceType: string;
  description: string;
  declaredValue?: number;

  // Rastreamento
  trackingCode: string;
}

/**
 * Gera HTML para etiqueta térmica WLP-200
 * Dimensões: 10cm x 15cm (100mm x 150mm)
 * Resolução: 203 DPI
 */
export function generateLabelHTML(data: LabelData): string {
  const trackingCode = data.trackingCode || "AA123456789BR";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: Arial, sans-serif;
          width: 100mm;
          height: 150mm;
          padding: 3mm;
          background: white;
          color: black;
        }

        .label-container {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          border: 1px solid #000;
          padding: 3mm;
        }

        /* Header com logo/info */
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 2mm;
          margin-bottom: 2mm;
        }

        .header-title {
          font-size: 10pt;
          font-weight: bold;
          margin-bottom: 1mm;
        }

        /* Código de rastreamento em destaque */
        .tracking-section {
          text-align: center;
          margin-bottom: 2mm;
          padding: 2mm;
          border: 2px solid #000;
          background: #f0f0f0;
        }

        .tracking-code {
          font-size: 14pt;
          font-weight: bold;
          font-family: "Courier New", monospace;
          letter-spacing: 1px;
          margin-bottom: 2mm;
        }

        .barcode-container {
          text-align: center;
          margin-bottom: 2mm;
        }

        .barcode-container svg {
          max-width: 100%;
          height: auto;
        }

        /* Seção de destinatário */
        .recipient-section {
          margin-bottom: 2mm;
          padding: 2mm;
          border: 1px solid #000;
          flex-grow: 1;
        }

        .section-label {
          font-size: 8pt;
          font-weight: bold;
          margin-bottom: 1mm;
          text-transform: uppercase;
        }

        .recipient-name {
          font-size: 11pt;
          font-weight: bold;
          margin-bottom: 1mm;
        }

        .recipient-address {
          font-size: 9pt;
          margin-bottom: 1mm;
          line-height: 1.2;
        }

        .recipient-city {
          font-size: 9pt;
          margin-bottom: 1mm;
        }

        .recipient-phone {
          font-size: 8pt;
          margin-bottom: 1mm;
        }

        /* Seção de serviço */
        .service-section {
          display: flex;
          gap: 2mm;
          margin-bottom: 2mm;
          font-size: 9pt;
        }

        .service-item {
          flex: 1;
          padding: 1mm;
          border: 1px solid #000;
          text-align: center;
        }

        .service-label {
          font-size: 7pt;
          font-weight: bold;
          margin-bottom: 1mm;
        }

        .service-value {
          font-size: 10pt;
          font-weight: bold;
        }

        /* Seção de remetente */
        .sender-section {
          font-size: 7pt;
          padding: 1mm;
          border-top: 1px solid #000;
          margin-top: 1mm;
        }

        .sender-label {
          font-weight: bold;
          margin-bottom: 1mm;
        }

        .sender-info {
          line-height: 1.1;
        }

        /* Rodapé */
        .footer {
          font-size: 6pt;
          text-align: center;
          margin-top: 1mm;
          padding-top: 1mm;
          border-top: 1px solid #000;
        }

        .weight-info {
          font-size: 8pt;
          font-weight: bold;
          margin-bottom: 1mm;
        }
      </style>
    </head>
    <body>
      <div class="label-container">
        <!-- Header -->
        <div class="header">
          <div class="header-title">IN'NOVA ENVIOS</div>
          <div style="font-size: 7pt;">Sistema de Etiquetas</div>
        </div>

        <!-- Código de Rastreamento -->
        <div class="tracking-section">
          <div class="tracking-code">${trackingCode}</div>
          <div id="barcode" style="text-align: center;"></div>
        </div>

        <!-- Destinatário -->
        <div class="recipient-section">
          <div class="section-label">📬 Destinatário</div>
          <div class="recipient-name">${data.recipientName}</div>
          <div class="recipient-address">
            ${data.recipientAddress}, ${data.recipientNumber}
            ${data.recipientComplement ? `<br/>${data.recipientComplement}` : ""}
          </div>
          <div class="recipient-city">
            ${data.recipientCEP} - ${data.recipientCity}, ${data.recipientState}
          </div>
          <div class="recipient-phone">Tel: ${data.recipientPhone}</div>
        </div>

        <!-- Serviço e Peso -->
        <div class="service-section">
          <div class="service-item">
            <div class="service-label">Serviço</div>
            <div class="service-value">${data.serviceType}</div>
          </div>
          <div class="service-item">
            <div class="service-label">Peso</div>
            <div class="service-value">${data.weight}kg</div>
          </div>
          <div class="service-item">
            <div class="service-label">Valor</div>
            <div class="service-value">R$ ${(data.declaredValue || 0).toFixed(2)}</div>
          </div>
        </div>

        <!-- Descrição -->
        <div style="font-size: 8pt; padding: 1mm; border: 1px solid #000; margin-bottom: 1mm;">
          <strong>Conteúdo:</strong> ${data.description}
        </div>

        <!-- Remetente -->
        <div class="sender-section">
          <div class="sender-label">De: ${data.senderName}</div>
          <div class="sender-info">
            ${data.senderAddress}, ${data.senderNumber}<br/>
            ${data.senderCEP} - ${data.senderCity}, ${data.senderState}
          </div>
        </div>

        <!-- Rodapé -->
        <div class="footer">
          <div>Gerado em: ${new Date().toLocaleString("pt-BR")}</div>
          <div>Impressora: WLP-200 Elgin</div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/jsbarcode@3.11.5/dist/JsBarcode.all.min.js"></script>
      <script>
        JsBarcode("#barcode", "${trackingCode}", {
          format: "CODE128",
          width: 2,
          height: 30,
          displayValue: false,
          margin: 0
        });
      </script>
    </body>
    </html>
  `;
}

/**
 * Gera ZPL (Zebra Programming Language) para impressoras térmicas
 * Compatível com WLP-200
 */
export function generateLabelZPL(data: LabelData): string {
  const trackingCode = data.trackingCode || "AA123456789BR";

  return `
^XA
^MMT
^PW812
^LL1218
^LS0
^FT50,50^A0N,28,28^FH\\^FDINNOVA ENVIOS^FS
^FT50,100^A0N,20,20^FH\\^FDCódigo: ${trackingCode}^FS

^FT50,150^BY2,3,100^BC^FH\\^FD${trackingCode}^FS

^FT50,300^A0N,24,24^FH\\^FDPara:^FS
^FT50,330^A0N,20,20^FH\\^FD${data.recipientName}^FS
^FT50,360^A0N,18,18^FH\\^FD${data.recipientAddress}, ${data.recipientNumber}^FS
${data.recipientComplement ? `^FT50,385^A0N,18,18^FH\\^FD${data.recipientComplement}^FS` : ""}
^FT50,410^A0N,18,18^FH\\^FD${data.recipientCEP} - ${data.recipientCity}, ${data.recipientState}^FS
^FT50,435^A0N,16,16^FH\\^FDTel: ${data.recipientPhone}^FS

^FT50,500^A0N,18,18^FH\\^FDServiço: ${data.serviceType}^FS
^FT50,530^A0N,18,18^FH\\^FDPeso: ${data.weight}kg^FS
^FT50,560^A0N,18,18^FH\\^FDValor: R$ ${(data.declaredValue || 0).toFixed(2)}^FS

^FT50,600^A0N,16,16^FH\\^FDConteúdo: ${data.description.substring(0, 50)}^FS

^FT50,700^A0N,14,14^FH\\^FDDe: ${data.senderName}^FS
^FT50,730^A0N,12,12^FH\\^FD${data.senderAddress}, ${data.senderNumber}^FS
^FT50,755^A0N,12,12^FH\\^FD${data.senderCEP} - ${data.senderCity}, ${data.senderState}^FS

^FT50,850^A0N,10,10^FH\\^FDGerado em: ${new Date().toLocaleString("pt-BR")}^FS
^FT50,870^A0N,10,10^FH\\^FDImpressora: WLP-200 Elgin^FS

^XZ
  `;
}

/**
 * Gera dados para impressão via expo-print
 */
export function generatePrintData(data: LabelData): {
  html: string;
  zpl: string;
} {
  return {
    html: generateLabelHTML(data),
    zpl: generateLabelZPL(data),
  };
}
