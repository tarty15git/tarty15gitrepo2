package com.cth.sdm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sdm_documents")
public class SdmDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String docIdCode;

    @Column(nullable = false, length = 3)
    private String appCode;

    @ManyToOne(optional = false)
    @JoinColumn(name = "phase_id")
    private SdmPhase phase;

    @ManyToOne
    @JoinColumn(name = "template_id")
    private DocumentTemplate template;

    @Column(nullable = false, length = 150)
    private String documentTitle;

    @Column(nullable = false, length = 50)
    private String documentCode;

    @Column(length = 20)
    private String versionNumber = "1.0";

    @Column(length = 500)
    private String description;

    @Column(nullable = false, length = 500)
    private String filePath;

    @Column(length = 20)
    private String fileType;

    private Long fileSize;

    @Column(nullable = false, length = 30)
    private String status = "PEND"; // PEND, APPROVED, REJECTED

    private boolean deleted = false;

    @Column(nullable = false, length = 50)
    private String makerUsername;

    @Column(length = 50)
    private String checkerUsername;

    @Column(length = 1000)
    private String remarks;

    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt = LocalDateTime.now();

    public SdmDocument() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getDocIdCode() { return docIdCode; }
    public void setDocIdCode(String docIdCode) { this.docIdCode = docIdCode; }

    public String getAppCode() { return appCode; }
    public void setAppCode(String appCode) { this.appCode = appCode; }

    public SdmPhase getPhase() { return phase; }
    public void setPhase(SdmPhase phase) { this.phase = phase; }

    public DocumentTemplate getTemplate() { return template; }
    public void setTemplate(DocumentTemplate template) { this.template = template; }

    public String getDocumentTitle() { return documentTitle; }
    public void setDocumentTitle(String documentTitle) { this.documentTitle = documentTitle; }

    public String getDocumentCode() { return documentCode; }
    public void setDocumentCode(String documentCode) { this.documentCode = documentCode; }

    public String getVersionNumber() { return versionNumber; }
    public void setVersionNumber(String versionNumber) { this.versionNumber = versionNumber; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getFileType() { return fileType; }
    public void setFileType(String fileType) { this.fileType = fileType; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public boolean isDeleted() { return deleted; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getMakerUsername() { return makerUsername; }
    public void setMakerUsername(String makerUsername) { this.makerUsername = makerUsername; }

    public String getCheckerUsername() { return checkerUsername; }
    public void setCheckerUsername(String checkerUsername) { this.checkerUsername = checkerUsername; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
