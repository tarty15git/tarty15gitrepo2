package com.cth.sdm.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "approval_histories")
public class ApprovalHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "document_id")
    private SdmDocument document;

    @Column(nullable = false, length = 30)
    private String action;

    @Column(nullable = false, length = 50)
    private String actorUsername;

    @Column(length = 1000)
    private String remarks;

    private LocalDateTime timestamp = LocalDateTime.now();

    public ApprovalHistory() {}

    public ApprovalHistory(SdmDocument document, String action, String actorUsername, String remarks) {
        this.document = document;
        this.action = action;
        this.actorUsername = actorUsername;
        this.remarks = remarks;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SdmDocument getDocument() { return document; }
    public void setDocument(SdmDocument document) { this.document = document; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getActorUsername() { return actorUsername; }
    public void setActorUsername(String actorUsername) { this.actorUsername = actorUsername; }

    public String getRemarks() { return remarks; }
    public void setRemarks(String remarks) { this.remarks = remarks; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
