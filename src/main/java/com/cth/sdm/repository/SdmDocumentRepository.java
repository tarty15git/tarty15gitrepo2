package com.cth.sdm.repository;
import com.cth.sdm.model.SdmDocument;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface SdmDocumentRepository extends JpaRepository<SdmDocument, Long> {
    List<SdmDocument> findByDeletedFalse();
    List<SdmDocument> findByAppCodeAndDeletedFalse(String appCode);
    List<SdmDocument> findByPhaseIdAndDeletedFalse(Long phaseId);
    List<SdmDocument> findByStatusAndDeletedFalse(String status);
    List<SdmDocument> findByAppCodeAndPhaseIdAndDeletedFalse(String appCode, Long phaseId);
}
