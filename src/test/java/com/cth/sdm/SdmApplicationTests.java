package com.cth.sdm;

import com.cth.sdm.model.AppUser;
import com.cth.sdm.model.SdmDocument;
import com.cth.sdm.model.SdmPhase;
import com.cth.sdm.service.ConfigService;
import com.cth.sdm.service.SdmService;
import com.cth.sdm.service.UserService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;

import java.io.IOException;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("default")
public class SdmApplicationTests {

    @Autowired
    private UserService userService;

    @Autowired
    private com.cth.sdm.ai.AgentOrchestratorService agentOrchestratorService;

    @Autowired
    private SdmService sdmService;

    @Autowired
    private ConfigService configService;

    @Test
    void testUserManagementAndAuthToggles() {
        assertNotNull(userService);
        AppUser user = userService.createUser("testmaker", "Pass123!", "test@cth.com", "Test Maker", "MAKER");
        assertNotNull(user.getId());
        assertEquals("MAKER", user.getRole());

        // Test lock toggle
        AppUser lockedUser = userService.toggleLock(user.getId());
        assertTrue(lockedUser.isLocked());

        // Test config toggles
        configService.setConfig("AUTH_LDAP_ENABLED", "true");
        assertTrue(configService.getBooleanConfig("AUTH_LDAP_ENABLED", false));
    }

    @Test
    void test7SdmPhasesInitialized() {
        List<SdmPhase> phases = sdmService.getAllPhases();
        assertEquals(7, phases.size());
    }

    @Test
    void testDocumentSubmissionAndMakerCheckerFlow() throws IOException {
        MockMultipartFile mockFile = new MockMultipartFile(
                "file",
                "Phase1_Charter.docx",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "Test Deliverable Content".getBytes()
        );

        SdmDocument doc = sdmService.submitDocument(
                "CTH",
                1L,
                "Project Charter Deliverable",
                "DOC-CHARTER-01",
                "1.0",
                "Initial Project Charter",
                mockFile,
                "maker1"
        );

        assertNotNull(doc.getId());
        assertEquals("PEND", doc.getStatus());
        assertTrue(doc.getDocIdCode().startsWith("CTH-P1-"));

        // Process Maker-Checker Approval
        SdmDocument approvedDoc = sdmService.processApproval(doc.getId(), "APPROVE", "checker1", "Hard gate verified.");
        assertEquals("APPROVED", approvedDoc.getStatus());
        assertEquals("checker1", approvedDoc.getCheckerUsername());
    }
}
