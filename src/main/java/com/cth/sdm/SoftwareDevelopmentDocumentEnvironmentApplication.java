package com.cth.sdm;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class SoftwareDevelopmentDocumentEnvironmentApplication {
    public static void main(String[] args) {
        SpringApplication.run(SoftwareDevelopmentDocumentEnvironmentApplication.class, args);
    }
}
