package com.cth.sdm.controller;

import com.cth.sdm.model.AppRole;
import com.cth.sdm.service.RoleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/roles")
@PreAuthorize("hasRole('ADMIN')")
public class RoleController {

    @Autowired
    private RoleService roleService;

    @GetMapping
    public ResponseEntity<List<AppRole>> getAllRoles() {
        return ResponseEntity.ok(roleService.getAllRoles());
    }

    @PostMapping
    public ResponseEntity<?> createRole(@RequestBody Map<String, String> payload) {
        try {
            String roleName = payload.get("roleName");
            String description = payload.get("description");
            String permittedActions = payload.get("permittedActions");
            AppRole created = roleService.createRole(roleName, description, permittedActions);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateRole(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        try {
            String description = payload.get("description");
            String permittedActions = payload.get("permittedActions");
            AppRole updated = roleService.updateRole(id, description, permittedActions);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteRole(@PathVariable Long id) {
        try {
            roleService.deleteRole(id);
            return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Role deleted successfully"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}
