package com.cth.sdm.service;

import com.cth.sdm.model.AppUser;
import com.cth.sdm.repository.AppUserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private AppUserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ConfigService configService;

    @PostConstruct
    public void initSeedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            createUser("admin", "Admin123!", "admin@cth.com", "System Admin", "ADMIN");
        }
        if (!userRepository.existsByUsername("maker1")) {
            createUser("maker1", "Maker123!", "maker1@cth.com", "Maker One", "MAKER");
        }
        if (!userRepository.existsByUsername("checker1")) {
            createUser("checker1", "Checker123!", "checker1@cth.com", "Checker One", "CHECKER");
        }
    }

    public AppUser createUser(String username, String rawPassword, String email, String fullName, String role) {
        if (userRepository.existsByUsername(username)) {
            throw new IllegalArgumentException("Username already exists: " + username);
        }
        String encoded = passwordEncoder.encode(rawPassword);
        AppUser user = new AppUser(username, encoded, email, fullName, role);
        AppUser saved = userRepository.save(user);

        triggerNotification("ACCOUNT_CREATED", saved, "Welcome to SDME! Account created successfully.");
        return saved;
    }

    public List<AppUser> getAllUsers() {
        return userRepository.findAll();
    }

    public AppUser toggleLock(Long userId) {
        AppUser user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setLocked(!user.isLocked());
        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public AppUser resetPassword(Long userId, String newPassword) {
        AppUser user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setFailedAttempts(0);
        user.setPasswordExpiryDate(LocalDateTime.now().plusDays(90));
        user.setUpdatedAt(LocalDateTime.now());
        AppUser saved = userRepository.save(user);

        triggerNotification("PASSWORD_RESET", saved, "Your password has been reset by Administrator.");
        return saved;
    }

    public void deleteUser(Long userId) {
        AppUser user = userRepository.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found"));
        if ("admin".equalsIgnoreCase(user.getUsername())) {
            throw new IllegalArgumentException("Cannot delete default admin user");
        }
        userRepository.delete(user);
    }

    public void triggerNotification(String type, AppUser user, String message) {
        boolean smsEnabled = configService.getBooleanConfig("NOTIF_SMS_ENABLED", false);
        boolean emailEnabled = configService.getBooleanConfig("NOTIF_EMAIL_ENABLED", false);

        if (smsEnabled && user.getMobileNumber() != null) {
            System.out.println("[SMS NOTIFICATION SENT] To: " + user.getMobileNumber() + " | Msg: " + message);
        }
        if (emailEnabled && user.getEmail() != null) {
            System.out.println("[EMAIL NOTIFICATION SENT] To: " + user.getEmail() + " | Msg: " + message);
        }
    }
}
