package com.cth.sdm.service;

import com.cth.sdm.model.DocumentTemplate;
import com.cth.sdm.model.SdmPhase;
import com.cth.sdm.repository.DocumentTemplateRepository;
import com.cth.sdm.repository.SdmPhaseRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class TemplateService {

    private final DocumentTemplateRepository templateRepository;
    private final SdmPhaseRepository phaseRepository;

    @Value("${app.upload.dir:./uploads/templates}")
    private String uploadDir;

    public TemplateService(DocumentTemplateRepository templateRepository, SdmPhaseRepository phaseRepository) {
        this.templateRepository = templateRepository;
        this.phaseRepository = phaseRepository;
    }

    public List<DocumentTemplate> getAllTemplates() {
        return templateRepository.findAll();
    }

    public List<DocumentTemplate> getTemplatesByPhase(Long phaseId) {
        return templateRepository.findByPhaseId(phaseId);
    }

    public Optional<DocumentTemplate> getTemplateById(Long id) {
        return templateRepository.findById(id);
    }

    public DocumentTemplate uploadTemplate(Long phaseId, String templateCode, String documentTitle,
                                           String versionNumber, String description, MultipartFile file) throws IOException {
        SdmPhase phase = phaseRepository.findById(phaseId)
                .orElseThrow(() -> new IllegalArgumentException("Invalid Phase ID: " + phaseId));

        File dir = new File(uploadDir);
        if (!dir.exists()) {
            dir.mkdirs();
        }

        String fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
        File destFile = new File(dir, fileName);
        file.transferTo(destFile);

        DocumentTemplate template = new DocumentTemplate();
        template.setTemplateCode(templateCode);
        template.setDocumentTitle(documentTitle);
        template.setPhase(phase);
        template.setVersionNumber(versionNumber != null ? versionNumber : "1.0");
        template.setDescription(description);
        template.setFilePath(destFile.getAbsolutePath());
        template.setCreatedAt(LocalDateTime.now());
        template.setUpdatedAt(LocalDateTime.now());

        return templateRepository.save(template);
    }

    public boolean deleteTemplate(Long id) {
        Optional<DocumentTemplate> opt = templateRepository.findById(id);
        if (opt.isPresent()) {
            DocumentTemplate template = opt.get();
            if (template.getFilePath() != null) {
                File f = new File(template.getFilePath());
                if (f.exists()) {
                    f.delete();
                }
            }
            templateRepository.deleteById(id);
            return true;
        }
        return false;
    }
}
