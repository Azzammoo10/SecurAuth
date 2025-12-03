package com.secureauth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * SecureAuth+ Application Main Class
 * Plateforme IAM centralisée et sécurisée
 */
@SpringBootApplication
@EnableJpaAuditing
public class SecureAuthApplication {

    public static void main(String[] args) {
        SpringApplication.run(SecureAuthApplication.class, args);
    }
}
