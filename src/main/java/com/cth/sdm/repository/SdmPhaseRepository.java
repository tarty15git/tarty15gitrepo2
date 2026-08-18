package com.cth.sdm.repository;
import com.cth.sdm.model.SdmPhase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface SdmPhaseRepository extends JpaRepository<SdmPhase, Long> {
    Optional<SdmPhase> findByPhaseNumber(Integer phaseNumber);
}
