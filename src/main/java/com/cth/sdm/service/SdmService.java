package com.cth.sdm.service;

import com.cth.sdm.model.*;
import com.cth.sdm.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import jakarta.annotation.PostConstruct;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class SdmService {

    @Autowired
    private SdmPhaseRepository phaseRepository;

    @Autowired
    private ApplicationRepository applicationRepository;

    @Autowired
    private DocumentTemplateRepository templateRepository;

    @Autowired
    private SdmDocumentRepository documentRepository;

    @Autowired
    private ApprovalHistoryRepository approvalRepository;

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Autowired
    private ConfigService configService;

    @PostConstruct
    public void initSdmData() {
        if (phaseRepository.count() == 0) {
            phaseRepository.save(new SdmPhase(1L, 1, "Phase 1: Project Initiation & Requirements", "Initial project setup, charter, and scope definitions"));
            phaseRepository.save(new SdmPhase(2L, 2, "Phase 2: System Analysis & Architecture Design", "Functional specification, architectural design, and interface specifications"));
            phaseRepository.save(new SdmPhase(3L, 3, "Phase 3: System Construction & Development", "Codebase implementation, unit testing, and technical documentation"));
            phaseRepository.save(new SdmPhase(4L, 4, "Phase 4: System Integration & Security Testing", "System testing, vulnerability scanning, and performance verification"));
            phaseRepository.save(new SdmPhase(5L, 5, "Phase 5: User Acceptance Testing (UAT)", "Business user acceptance sign-off and defect triage"));
            phaseRepository.save(new SdmPhase(6L, 6, "Phase 6: Deployment & Operational Readiness", "Production deployment scripts, operational guides, and user training"));
            phaseRepository.save(new SdmPhase(7L, 7, "Phase 7: Maintenance & Post-Implementation Review", "System maintenance handoff and post-launch review"));
        }

        if (!applicationRepository.existsByAppCode("CTH")) {
            applicationRepository.save(new Application("CTH", "CTH Banking Core", "Core System Application"));
        }
    }

    public List<SdmPhase> getAllPhases() {
        return phaseRepository.findAll();
    }

    public List<Application> getAllApplications() {
        return applicationRepository.findAll();
    }

    public Application createApplication(String appCode, String appName, String description) {
        if (appCode == null || appCode.length() != 3) {
            throw new IllegalArgumentException("Application Code must be exactly 3 characters");
        }
        Application app = new Application(appCode.toUpperCase(), appName, description);
        return applicationRepository.save(app);
    }

    public SdmDocument submitDocument(String appCode, Long phaseId, String docTitle, String docCode,
                                     String version, String description, MultipartFile file, String makerUsername) throws IOException {

        SdmPhase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new IllegalArgumentException("Phase not found: " + phaseId));

        String storageDir = configService.getConfig("STORAGE_FOLDER", "./sdm_storage");
        File dir = new File(storageDir);
        if (!dir.exists()) dir.mkdirs();

        String filename = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path targetPath = Paths.get(storageDir, filename);
        Files.copy(file.getInputStream(), targetPath);

        String docIdCode = appCode + "-P" + phase.getPhaseNumber() + "-" + System.currentTimeMillis() % 10000;

        SdmDocument doc = new SdmDocument();
        doc.setDocIdCode(docIdCode);
        doc.setAppCode(appCode.toUpperCase());
        doc.setPhase(phase);
        doc.setDocumentTitle(docTitle);
        doc.setDocumentCode(docCode);
        doc.setVersionNumber(version != null ? version : "1.0");
        doc.setDescription(description);
        doc.setFilePath(targetPath.toString());
        doc.setFileType(file.getOriginalFilename().substring(file.getOriginalFilename().lastIndexOf(".") + 1));
        doc.setFileSize(file.getSize());
        doc.setStatus("PEND");
        doc.setMakerUsername(makerUsername);

        SdmDocument saved = documentRepository.save(doc);

        approvalRepository.save(new ApprovalHistory(saved, "SUBMITTED", makerUsername, "Document submitted for checker review"));
        auditLogRepository.save(new AuditLog("DOCUMENT_SUBMITTED", makerUsername, "Submitted document " + docIdCode + " for phase " + phase.getPhaseName()));

        notifyApprovers(saved);
        return saved;
    }

    public SdmDocument processApproval(Long documentId, String action, String checkerUsername, String remarks) {
        SdmDocument doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + documentId));

        if (!"PEND".equals(doc.getStatus())) {
            throw new IllegalStateException("Document is not in PEND status");
        }

        if ("APPROVE".equalsIgnoreCase(action)) {
            doc.setStatus("APPROVED");
        } else if ("REJECT".equalsIgnoreCase(action)) {
            doc.setStatus("REJECTED");
        } else {
            throw new IllegalArgumentException("Invalid action: " + action);
        }

        doc.setCheckerUsername(checkerUsername);
        doc.setRemarks(remarks);
        doc.setUpdatedAt(LocalDateTime.now());

        SdmDocument saved = documentRepository.save(doc);
        approvalRepository.save(new ApprovalHistory(saved, doc.getStatus(), checkerUsername, remarks));
        auditLogRepository.save(new AuditLog("DOCUMENT_" + doc.getStatus(), checkerUsername, "Document " + doc.getDocIdCode() + " status changed to " + doc.getStatus()));

        return saved;
    }

    public void deleteDocument(Long id, String username) {
        SdmDocument doc = documentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Document not found: " + id));

        // Delete physical stored file if present
        try {
            File file = new File(doc.getFilePath());
            if (file.exists()) {
                file.delete();
            }
        } catch (Exception e) {
            System.err.println("Failed to delete physical file: " + e.getMessage());
        }

        documentRepository.delete(doc);
        auditLogRepository.save(new AuditLog("DOCUMENT_DELETED", username, "Deleted document " + doc.getDocIdCode()));
    }

    public DocumentTemplate uploadTemplate(Long phaseId, String title, String code, String version, String desc, MultipartFile file) throws IOException {
        SdmPhase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new IllegalArgumentException("Phase not found: " + phaseId));

        String tmplDir = configService.getConfig("TEMPLATES_FOLDER", "./sdm_templates");
        File dir = new File(tmplDir);
        if (!dir.exists()) dir.mkdirs();

        String filename = "TMPL_" + code + "_" + file.getOriginalFilename();
        Path targetPath = Paths.get(tmplDir, filename);
        Files.copy(file.getInputStream(), targetPath, java.nio.file.StandardCopyOption.REPLACE_EXISTING);

        DocumentTemplate template = new DocumentTemplate(code, title, phase, version, desc);
        template.setFilePath(targetPath.toString());

        return templateRepository.save(template);
    }

    public List<SdmDocument> getDocumentsByFilter(String appCode, Long phaseId, String status) {
        if (appCode != null && phaseId != null) {
            return documentRepository.findByAppCodeAndPhaseId(appCode, phaseId);
        } else if (appCode != null) {
            return documentRepository.findByAppCode(appCode);
        } else if (phaseId != null) {
            return documentRepository.findByPhaseId(phaseId);
        } else if (status != null) {
            return documentRepository.findByStatus(status);
        }
        return documentRepository.findAll();
    }

    private void notifyApprovers(SdmDocument doc) {
        boolean sms = configService.getBooleanConfig("NOTIF_SMS_ENABLED", false);
        boolean email = configService.getBooleanConfig("NOTIF_EMAIL_ENABLED", false);

        if (sms || email) {
            System.out.println("[APPROVER NOTIFICATION TRIGGERED] Document " + doc.getDocIdCode() + " pending approval.");
        }
    }
}
