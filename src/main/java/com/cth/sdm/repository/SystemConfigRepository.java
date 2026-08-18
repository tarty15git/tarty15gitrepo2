package com.cth.sdm.repository;
import com.cth.sdm.model.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
public interface SystemConfigRepository extends JpaRepository<SystemConfig, String> {
}
