package com.cth.sdm.ai;

import com.cth.sdm.model.SdmDocument;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "agent_reviews")
public class AgentReview {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "document_id")
    private SdmDocument document;

    @Column(nullable = false, length = 50)
    private String agentName;

    @Column(nullable = false, length = 50)
    private String agentRole;

    @Column(columnDefinition = "TEXT")
    private String outputText;

    @Column(length = 20)
    private String score;

    @Column(nullable = false, length = 30)
    private String status;

    private LocalDateTime timestamp = LocalDateTime.now();

    public AgentReview() {}

    public AgentReview(SdmDocument document, String agentName, String agentRole, String outputText, String score, String status) {
        this.document = document;
        this.agentName = agentName;
        this.agentRole = agentRole;
        this.outputText = outputText;
        this.score = score;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SdmDocument getDocument() { return document; }
    public void setDocument(SdmDocument document) { this.document = document; }

    public String getAgentName() { return agentName; }
    public void setAgentName(String agentName) { this.agentName = agentName; }

    public String getAgentRole() { return agentRole; }
    public void setAgentRole(String agentRole) { this.agentRole = agentRole; }

    public String getOutputText() { return outputText; }
    public void setOutputText(String outputText) { this.outputText = outputText; }

    public String getScore() { return score; }
    public void setScore(String score) { this.score = score; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
