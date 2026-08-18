package com.cth.sdm.controller;

import com.cth.sdm.service.ConfigService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/config")
public class ConfigController {

    @Autowired
    private ConfigService configService;

    @GetMapping("/public")
    public ResponseEntity<Map<String, String>> getPublicConfigs() {
        return ResponseEntity.ok(configService.getAllConfigs());
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, String>> getAllConfigs() {
        return ResponseEntity.ok(configService.getAllConfigs());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateConfig(@RequestBody Map<String, String> configs) {
        configs.forEach((k, v) -> configService.setConfig(k, v));
        return ResponseEntity.ok(Map.of("status", "SUCCESS", "message", "Configurations updated successfully"));
    }
}
