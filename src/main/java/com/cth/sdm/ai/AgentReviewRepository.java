package com.cth.sdm.ai;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface AgentReviewRepository extends JpaRepository<AgentReview, Long> {
    List<AgentReview> findByDocumentIdOrderByTimestampAsc(Long documentId);
}
