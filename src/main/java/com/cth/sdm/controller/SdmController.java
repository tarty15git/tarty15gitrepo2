package com.cth.sdm.controller;

import com.cth.sdm.model.*;
import com.cth.sdm.repository.ApprovalHistoryRepository;
import com.cth.sdm.repository.AuditLogRepository;
import com.cth.sdm.service.SdmService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sdm")
public class SdmController {

    @Autowired
    private SdmService sdmService;

    @Autowired
    private ApprovalHistoryRepository approvalRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping("/phases")
    public ResponseEntity<List<SdmPhase>> getPhases() {
        return ResponseEntity.ok(sdmService.getAllPhases());
    }

    @GetMapping("/applications")
    public ResponseEntity<List<Application>> getApplications() {
        return ResponseEntity.ok(sdmService.getAllApplications());
    }

    @PostMapping("/applications")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createApplication(@RequestBody Map<String, String> payload) {
        String appCode = payload.get("appCode");
        String appName = payload.get("appName");
        String desc = payload.get("description");
        return ResponseEntity.ok(sdmService.createApplication(appCode, appName, desc));
    }

    @GetMapping("/documents")
    public ResponseEntity<List<SdmDocument>> getDocuments(
            @RequestParam(required = false) String appCode,
            @RequestParam(required = false) Long phaseId,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(sdmService.getDocumentsByFilter(appCode, phaseId, status));
    }

    @PostMapping("/documents/submit")
    @PreAuthorize("hasAnyRole('MAKER', 'ADMIN')")
    public ResponseEntity<?> submitDocument(
            @RequestParam("appCode") String appCode,
            @RequestParam("phaseId") Long phaseId,
            @RequestParam("documentTitle") String documentTitle,
            @RequestParam("documentCode") String documentCode,
            @RequestParam(value = "versionNumber", defaultValue = "1.0") String versionNumber,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file,
            Authentication auth) {
        try {
            SdmDocument doc = sdmService.submitDocument(appCode, phaseId, documentTitle, documentCode, versionNumber, description, file, auth.getName());
            return ResponseEntity.ok(doc);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/documents/{id}/approval")
    @PreAuthorize("hasAnyRole('CHECKER', 'ADMIN')")
    public ResponseEntity<?> processApproval(
            @PathVariable Long id,
            @RequestBody Map<String, String> payload,
            Authentication auth) {
        try {
            String action = payload.get("action");
            String remarks = payload.get("remarks");
            SdmDocument updated = sdmService.processApproval(id, action, auth.getName(), remarks);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/documents/{id}/history")
    public ResponseEntity<List<ApprovalHistory>> getHistory(@PathVariable Long id) {
        return ResponseEntity.ok(approvalRepository.findByDocumentIdOrderByTimestampDesc(id));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @PostMapping("/admin/templates/upload")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> uploadTemplate(
            @RequestParam("phaseId") Long phaseId,
            @RequestParam("templateCode") String templateCode,
            @RequestParam("documentTitle") String documentTitle,
            @RequestParam(value = "versionNumber", defaultValue = "1.0") String versionNumber,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam("file") MultipartFile file) {
        try {
            DocumentTemplate tmpl = sdmService.uploadTemplate(phaseId, documentTitle, templateCode, versionNumber, description, file);
            return ResponseEntity.ok(tmpl);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/documents/direct-sync")
    public ResponseEntity<?> directSync(@RequestBody Map<String, Object> payload, Authentication auth) {
        String docIdCode = (String) payload.get("docIdCode");
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Direct sync updated successfully for " + docIdCode));
    }
}
