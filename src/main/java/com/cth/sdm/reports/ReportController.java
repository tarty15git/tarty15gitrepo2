package com.cth.sdm.reports;

import com.cth.sdm.model.SdmDocument;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayInputStream;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/online")
    public ResponseEntity<List<SdmDocument>> getOnlineReport(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(reportService.getReportData(status));
    }

    @GetMapping("/download/pdf")
    public ResponseEntity<InputStreamResource> downloadPdfReport(@RequestParam(required = false) String status) {
        ByteArrayInputStream in = reportService.generatePdfReport(status);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=SDM_Approval_Report.pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.APPLICATION_PDF)
                .body(new InputStreamResource(in));
    }

    @GetMapping("/download/excel")
    public ResponseEntity<InputStreamResource> downloadExcelReport(@RequestParam(required = false) String status) {
        ByteArrayInputStream in = reportService.generateExcelReport(status);
        HttpHeaders headers = new HttpHeaders();
        headers.add("Content-Disposition", "attachment; filename=SDM_Approval_Report.xlsx");

        return ResponseEntity.ok()
                .headers(headers)
                .contentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(new InputStreamResource(in));
    }
}
