package com.cth.sdm.service;

import com.cth.sdm.model.AppRole;
import com.cth.sdm.repository.AppRoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RoleService {

    @Autowired
    private AppRoleRepository roleRepository;

    @PostConstruct
    public void initSeedRoles() {
        seedRoleIfAbsent("ADMIN", "System Administrator with full access rights", "SUBMIT_DOC,APPROVE_DOC,DELETE_DOC,EXPORT_REPORT,MANAGE_USERS,MANAGE_ROLES");
        seedRoleIfAbsent("MAKER", "Deliverable document creator and submitter", "SUBMIT_DOC,VIEW_DOC,EXPORT_REPORT");
        seedRoleIfAbsent("CHECKER", "Approver responsible for sign-off hard gates", "APPROVE_DOC,VIEW_DOC,EXPORT_REPORT");
        seedRoleIfAbsent("USER", "Read-only system viewer", "VIEW_DOC,EXPORT_REPORT");
    }

    private void seedRoleIfAbsent(String name, String desc, String defaultActions) {
        if (!roleRepository.existsByRoleName(name)) {
            AppRole r = new AppRole(name, desc);
            r.setPermittedActions(defaultActions);
            roleRepository.save(r);
        }
    }

    public List<AppRole> getAllRoles() {
        return roleRepository.findAll();
    }

    public AppRole createRole(String roleName, String description, String permittedActions) {
        String upperName = roleName.toUpperCase().trim();
        if (roleRepository.existsByRoleName(upperName)) {
            throw new IllegalArgumentException("Role already exists: " + upperName);
        }
        AppRole role = new AppRole(upperName, description);
        if (permittedActions != null && !permittedActions.isBlank()) {
            role.setPermittedActions(permittedActions);
        }
        return roleRepository.save(role);
    }

    public AppRole updateRole(Long roleId, String newDescription, String permittedActions) {
        AppRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));
        if (newDescription != null) role.setDescription(newDescription);
        if (permittedActions != null) role.setPermittedActions(permittedActions);
        role.setUpdatedAt(LocalDateTime.now());
        return roleRepository.save(role);
    }

    public void deleteRole(Long roleId) {
        AppRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));

        if ("ADMIN".equalsIgnoreCase(role.getRoleName()) ||
            "MAKER".equalsIgnoreCase(role.getRoleName()) ||
            "CHECKER".equalsIgnoreCase(role.getRoleName())) {
            throw new IllegalArgumentException("Cannot delete system default role: " + role.getRoleName());
        }

        roleRepository.delete(role);
    }
}
