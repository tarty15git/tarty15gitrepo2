package com.cth.sdm.controller;

import com.cth.sdm.model.DocumentTemplate;
import com.cth.sdm.service.TemplateService;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api")
public class TemplateController {

    private final TemplateService templateService;

    public TemplateController(TemplateService templateService) {
        this.templateService = templateService;
    }

    @GetMapping("/sdm/templates")
    public ResponseEntity<List<DocumentTemplate>> getTemplates(@RequestParam(required = false) Long phaseId) {
        if (phaseId != null) {
            return ResponseEntity.ok(templateService.getTemplatesByPhase(phaseId));
        }
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @GetMapping("/admin/templates")
    public ResponseEntity<List<DocumentTemplate>> getAllAdminTemplates() {
        return ResponseEntity.ok(templateService.getAllTemplates());
    }

    @PostMapping("/admin/templates/upload")
    public ResponseEntity<?> uploadTemplate(@RequestParam("phaseId") Long phaseId,
                                             @RequestParam("templateCode") String templateCode,
                                             @RequestParam("documentTitle") String documentTitle,
                                             @RequestParam(value = "versionNumber", defaultValue = "1.0") String versionNumber,
                                             @RequestParam(value = "description", required = false) String description,
                                             @RequestParam("file") MultipartFile file) {
        try {
            DocumentTemplate template = templateService.uploadTemplate(phaseId, templateCode, documentTitle, versionNumber, description, file);
            return ResponseEntity.ok(Map.of("success", true, "message", "Template uploaded successfully", "template", template));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "error", e.getMessage()));
        }
    }

    @DeleteMapping("/admin/templates/{id}")
    public ResponseEntity<?> deleteTemplate(@PathVariable Long id) {
        boolean deleted = templateService.deleteTemplate(id);
        if (deleted) {
            return ResponseEntity.ok(Map.of("success", true, "message", "Template deleted successfully"));
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "error", "Template not found"));
    }

    @GetMapping("/sdm/templates/{id}/download")
    public ResponseEntity<Resource> downloadTemplate(@PathVariable Long id) {
        Optional<DocumentTemplate> opt = templateService.getTemplateById(id);
        if (opt.isEmpty() || opt.get().getFilePath() == null) {
            return ResponseEntity.notFound().build();
        }

        File file = new File(opt.get().getFilePath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + file.getName() + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(resource);
    }
}
