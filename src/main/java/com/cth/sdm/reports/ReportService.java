package com.cth.sdm.reports;

import com.cth.sdm.model.SdmDocument;
import com.cth.sdm.repository.SdmDocumentRepository;
import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.apache.poi.ss.usermodel.CellStyle;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.util.List;

@Service
public class ReportService {

    @Autowired
    private SdmDocumentRepository documentRepository;

    public List<SdmDocument> getReportData(String statusFilter) {
        if (statusFilter != null && !statusFilter.isBlank() && !"ALL".equalsIgnoreCase(statusFilter)) {
            return documentRepository.findByStatusAndDeletedFalse(statusFilter.toUpperCase());
        }
        return documentRepository.findByDeletedFalse();
    }

    public ByteArrayInputStream generatePdfReport(String statusFilter) {
        List<SdmDocument> docs = getReportData(statusFilter);
        Document pdfDoc = new Document(PageSize.A4.rotate());
        ByteArrayOutputStream out = new ByteArrayOutputStream();

        try {
            PdfWriter.getInstance(pdfDoc, out);
            pdfDoc.open();

            com.lowagie.text.Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph("Software Development Document Environment - Approval Status Report", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            pdfDoc.add(title);
            pdfDoc.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(7);
            table.setWidthPercentage(100);

            String[] headers = {"Doc ID", "App Code", "Document Title", "Version", "Status", "Maker", "Checker / Approver"};
            for (String header : headers) {
                PdfPCell cell = new PdfPCell(new Phrase(header, FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10)));
                cell.setHorizontalAlignment(Element.ALIGN_CENTER);
                cell.setBackgroundColor(java.awt.Color.LIGHT_GRAY);
                table.addCell(cell);
            }

            for (SdmDocument d : docs) {
                table.addCell(d.getDocIdCode());
                table.addCell(d.getAppCode());
                table.addCell(d.getDocumentTitle());
                table.addCell(d.getVersionNumber());
                table.addCell(d.getStatus());
                table.addCell(d.getMakerUsername());
                table.addCell(d.getCheckerUsername() != null ? d.getCheckerUsername() : "-");
            }

            pdfDoc.add(table);
            pdfDoc.close();

        } catch (DocumentException e) {
            throw new RuntimeException("Error generating PDF report: " + e.getMessage(), e);
        }

        return new ByteArrayInputStream(out.toByteArray());
    }

    public ByteArrayInputStream generateExcelReport(String statusFilter) {
        List<SdmDocument> docs = getReportData(statusFilter);

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("SDM Approval Report");
            org.apache.poi.ss.usermodel.Row headerRow = sheet.createRow(0);
            String[] columns = {"Doc ID Code", "App Code", "Phase", "Document Title", "Document Code", "Version", "Status", "Maker Username", "Checker Username", "Remarks", "Created Date"};

            for (int i = 0; i < columns.length; i++) {
                org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
                cell.setCellValue(columns[i]);
            }

            int rowIdx = 1;
            for (SdmDocument d : docs) {
                org.apache.poi.ss.usermodel.Row row = sheet.createRow(rowIdx++);
                row.createCell(0).setCellValue(d.getDocIdCode());
                row.createCell(1).setCellValue(d.getAppCode());
                row.createCell(2).setCellValue(d.getPhase() != null ? d.getPhase().getPhaseName() : "");
                row.createCell(3).setCellValue(d.getDocumentTitle());
                row.createCell(4).setCellValue(d.getDocumentCode());
                row.createCell(5).setCellValue(d.getVersionNumber());
                row.createCell(6).setCellValue(d.getStatus());
                row.createCell(7).setCellValue(d.getMakerUsername());
                row.createCell(8).setCellValue(d.getCheckerUsername() != null ? d.getCheckerUsername() : "-");
                row.createCell(9).setCellValue(d.getRemarks() != null ? d.getRemarks() : "");
                row.createCell(10).setCellValue(d.getCreatedAt().toString());
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());

        } catch (IOException e) {
            throw new RuntimeException("Error generating Excel report: " + e.getMessage(), e);
        }
    }
}
