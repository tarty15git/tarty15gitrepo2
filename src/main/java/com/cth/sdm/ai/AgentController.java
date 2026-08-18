package com.cth.sdm.ai;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ai/agents")
public class AgentController {

    @Autowired
    private AgentOrchestratorService agentOrchestratorService;

    @PostMapping("/process/{documentId}")
    public ResponseEntity<List<AgentReview>> processDocumentWithAgents(@PathVariable Long documentId) {
        List<AgentReview> reviews = agentOrchestratorService.orchestrateDocumentPipeline(documentId);
        return ResponseEntity.ok(reviews);
    }

    @GetMapping("/reviews/{documentId}")
    public ResponseEntity<List<AgentReview>> getReviewsForDocument(@PathVariable Long documentId) {
        return ResponseEntity.ok(agentOrchestratorService.getDocumentReviews(documentId));
    }
}
