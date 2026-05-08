import { describe, it, expect } from "vitest";
import {
  generateLabelHTML,
  generateLabelZPL,
  generatePrintData,
  LabelData,
} from "./label-generator";

const mockLabelData: LabelData = {
  senderName: "In'Nova Envios",
  senderAddress: "Rua Principal",
  senderNumber: "123",
  senderCity: "São Paulo",
  senderState: "SP",
  senderCEP: "01310100",

  recipientName: "João Silva",
  recipientAddress: "Av. Paulista",
  recipientNumber: "1000",
  recipientComplement: "Apto 501",
  recipientCity: "Rio de Janeiro",
  recipientState: "RJ",
  recipientCEP: "20040020",
  recipientPhone: "21999999999",

  weight: 2.5,
  serviceType: "SEDEX",
  description: "Eletrônicos",
  declaredValue: 150.0,

  trackingCode: "AA123456789BR",
};

describe("Label Generator", () => {
  it("should generate valid HTML label", () => {
    const html = generateLabelHTML(mockLabelData);

    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("IN'NOVA ENVIOS");
    expect(html).toContain(mockLabelData.trackingCode);
    expect(html).toContain(mockLabelData.recipientName);
    expect(html).toContain(mockLabelData.recipientCity);
    expect(html).toContain("WLP-200");
    expect(html).toContain("JsBarcode");
  });

  it("should include recipient information in HTML", () => {
    const html = generateLabelHTML(mockLabelData);

    expect(html).toContain(mockLabelData.recipientName);
    expect(html).toContain(mockLabelData.recipientAddress);
    expect(html).toContain(mockLabelData.recipientNumber);
    expect(html).toContain(mockLabelData.recipientCEP);
    expect(html).toContain(mockLabelData.recipientPhone);
  });

  it("should include sender information in HTML", () => {
    const html = generateLabelHTML(mockLabelData);

    expect(html).toContain(mockLabelData.senderName);
    expect(html).toContain(mockLabelData.senderCity);
    expect(html).toContain(mockLabelData.senderState);
  });

  it("should include service details in HTML", () => {
    const html = generateLabelHTML(mockLabelData);

    expect(html).toContain(mockLabelData.serviceType);
    expect(html).toContain(mockLabelData.weight.toString());
    expect(html).toContain(mockLabelData.description);
  });

  it("should generate valid ZPL command", () => {
    const zpl = generateLabelZPL(mockLabelData);

    expect(zpl).toContain("^XA"); // Start of ZPL
    expect(zpl).toContain("^XZ"); // End of ZPL
    expect(zpl).toContain(mockLabelData.trackingCode);
    expect(zpl).toContain(mockLabelData.recipientName);
    expect(zpl).toContain("^BC"); // Barcode command
  });

  it("should include all ZPL formatting commands", () => {
    const zpl = generateLabelZPL(mockLabelData);

    expect(zpl).toContain("^FT"); // Field position
    expect(zpl).toContain("^A0"); // Font selection
    expect(zpl).toContain("^FD"); // Field data
    expect(zpl).toContain("^FS"); // Field separator
    expect(zpl).toContain("^BY"); // Barcode field default
    expect(zpl).toContain("^BC"); // Code 128 barcode
  });

  it("should generate print data with both HTML and ZPL", () => {
    const printData = generatePrintData(mockLabelData);

    expect(printData).toHaveProperty("html");
    expect(printData).toHaveProperty("zpl");
    expect(printData.html).toContain("<!DOCTYPE html>");
    expect(printData.zpl).toContain("^XA");
  });

  it("should handle missing optional fields", () => {
    const dataWithoutComplement: LabelData = {
      ...mockLabelData,
      recipientComplement: undefined,
    };

    const html = generateLabelHTML(dataWithoutComplement);
    expect(html).toContain(dataWithoutComplement.recipientName);
  });

  it("should format currency correctly", () => {
    const html = generateLabelHTML(mockLabelData);

    expect(html).toContain("R$ 150.00");
  });

  it("should format CEP correctly", () => {
    const html = generateLabelHTML(mockLabelData);

    expect(html).toContain("01310100");
    expect(html).toContain("20040020");
  });

  it("should include timestamp in footer", () => {
    const html = generateLabelHTML(mockLabelData);

    expect(html).toContain("Gerado em:");
  });

  it("should use correct printer model in footer", () => {
    const html = generateLabelHTML(mockLabelData);
    const zpl = generateLabelZPL(mockLabelData);

    expect(html).toContain("WLP-200");
    expect(zpl).toContain("WLP-200");
  });
});
