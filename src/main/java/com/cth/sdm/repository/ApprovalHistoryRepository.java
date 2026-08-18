package com.cth.sdm.repository;
import com.cth.sdm.model.ApprovalHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface ApprovalHistoryRepository extends JpaRepository<ApprovalHistory, Long> {
    List<ApprovalHistory> findByDocumentIdOrderByTimestampDesc(Long documentId);
}
