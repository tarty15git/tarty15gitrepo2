package com.cth.sdm.service;

import com.cth.sdm.model.SystemConfig;
import com.cth.sdm.repository.SystemConfigRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
public class ConfigService {

    @Autowired
    private SystemConfigRepository configRepository;

    @PostConstruct
    public void initDefaults() {
        setDefault("AUTH_LDAP_ENABLED", "false", "Enable LDAP Active Directory Authentication");
        setDefault("AUTH_LDAP_URL", "ldap://localhost:389/dc=example,dc=com", "LDAP Server URL");
        setDefault("NOTIF_SMS_ENABLED", "false", "Enable SMS Notifications");
        setDefault("NOTIF_EMAIL_ENABLED", "false", "Enable Email Notifications");
        setDefault("APP_NAME", "Software Development Document Environment", "Application Name");
        setDefault("WATCH_FOLDER", "./watch_drop_folder", "Folder monitored by file pickup watcher");
        setDefault("MODEL_CHAT", "llama3.2:latest", "Default LLM Chat Model");
        setDefault("MODEL_EMBED", "nomic-embed-text", "Default LLM Embedding Model");
    }

    private void setDefault(String key, String defaultValue, String desc) {
        if (!configRepository.existsById(key)) {
            configRepository.save(new SystemConfig(key, defaultValue, desc));
        }
    }

    public String getConfig(String key, String defaultValue) {
        return configRepository.findById(key).map(SystemConfig::getValue).orElse(defaultValue);
    }

    public boolean getBooleanConfig(String key, boolean defaultValue) {
        String val = getConfig(key, String.valueOf(defaultValue));
        return Boolean.parseBoolean(val);
    }

    public void setConfig(String key, String value) {
        SystemConfig cfg = configRepository.findById(key).orElse(new SystemConfig(key, value, "System Configuration"));
        cfg.setValue(value);
        cfg.setUpdatedAt(LocalDateTime.now());
        configRepository.save(cfg);
    }

    public Map<String, String> getAllConfigs() {
        Map<String, String> map = new HashMap<>();
        configRepository.findAll().forEach(c -> map.put(c.getKey(), c.getValue()));
        return map;
    }
}
