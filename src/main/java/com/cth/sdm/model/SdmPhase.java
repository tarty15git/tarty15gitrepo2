package com.cth.sdm.model;

import jakarta.persistence.*;

@Entity
@Table(name = "sdm_phases")
public class SdmPhase {

    @Id
    private Long id;

    @Column(nullable = false, unique = true)
    private Integer phaseNumber;

    @Column(nullable = false, length = 100)
    private String phaseName;

    private String description;

    public SdmPhase() {}

    public SdmPhase(Long id, Integer phaseNumber, String phaseName, String description) {
        this.id = id;
        this.phaseNumber = phaseNumber;
        this.phaseName = phaseName;
        this.description = description;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Integer getPhaseNumber() { return phaseNumber; }
    public void setPhaseNumber(Integer phaseNumber) { this.phaseNumber = phaseNumber; }

    public String getPhaseName() { return phaseName; }
    public void setPhaseName(String phaseName) { this.phaseName = phaseName; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
}
