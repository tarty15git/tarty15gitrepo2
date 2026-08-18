package com.cth.sdm.repository;
import com.cth.sdm.model.SdmDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SdmDocumentRepository extends JpaRepository<SdmDocument, Long> {
    List<SdmDocument> findByAppCode(String appCode);
    List<SdmDocument> findByPhaseId(Long phaseId);
    List<SdmDocument> findByStatus(String status);
    List<SdmDocument> findByAppCodeAndPhaseId(String appCode, Long phaseId);
}
