package com.cth.sdm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_templates")
public class DocumentTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String templateCode;

    @Column(nullable = false, length = 150)
    private String documentTitle;

    @ManyToOne(optional = false)
    @JoinColumn(name = "phase_id")
    private SdmPhase phase;

    private String filePath;
    private String versionNumber = "1.0";

    @Column(length = 500)
    private String description;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public DocumentTemplate() {}

    public DocumentTemplate(String templateCode, String documentTitle, SdmPhase phase, String versionNumber, String description) {
        this.templateCode = templateCode;
        this.documentTitle = documentTitle;
        this.phase = phase;
        this.versionNumber = versionNumber;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTemplateCode() { return templateCode; }
    public void setTemplateCode(String templateCode) { this.templateCode = templateCode; }

    public String getDocumentTitle() { return documentTitle; }
    public void setDocumentTitle(String documentTitle) { this.documentTitle = documentTitle; }

    public SdmPhase getPhase() { return phase; }
    public void setPhase(SdmPhase phase) { this.phase = phase; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getVersionNumber() { return versionNumber; }
    public void setVersionNumber(String versionNumber) { this.versionNumber = versionNumber; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
