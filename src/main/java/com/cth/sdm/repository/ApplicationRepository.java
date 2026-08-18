package com.cth.sdm.repository;
import com.cth.sdm.model.Application;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
public interface ApplicationRepository extends JpaRepository<Application, Long> {
    Optional<Application> findByAppCode(String appCode);
    boolean existsByAppCode(String appCode);
}
