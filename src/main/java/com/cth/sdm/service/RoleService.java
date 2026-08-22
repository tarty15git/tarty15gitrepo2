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
        seedRoleIfAbsent("ADMIN", "System Administrator with full access rights");
        seedRoleIfAbsent("MAKER", "Deliverable document creator and submitter");
        seedRoleIfAbsent("CHECKER", "Approver responsible for sign-off hard gates");
        seedRoleIfAbsent("USER", "Read-only system viewer");
    }

    private void seedRoleIfAbsent(String name, String desc) {
        if (!roleRepository.existsByRoleName(name)) {
            roleRepository.save(new AppRole(name, desc));
        }
    }

    public List<AppRole> getAllRoles() {
        return roleRepository.findAll();
    }

    public AppRole createRole(String roleName, String description) {
        String upperName = roleName.toUpperCase().trim();
        if (roleRepository.existsByRoleName(upperName)) {
            throw new IllegalArgumentException("Role already exists: " + upperName);
        }
        return roleRepository.save(new AppRole(upperName, description));
    }

    public AppRole updateRole(Long roleId, String newDescription) {
        AppRole role = roleRepository.findById(roleId)
                .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleId));
        role.setDescription(newDescription);
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
