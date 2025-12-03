package com.secureauth.repositories;

import com.secureauth.entities.ApiKey;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ApiKeyRepository extends JpaRepository<ApiKey, Long> {
    
    Optional<ApiKey> findByKeyHash(String keyHash);
    
    List<ApiKey> findByUserIdAndActiveTrue(Long userId);
    
    List<ApiKey> findByUserId(Long userId);
    
    List<ApiKey> findByExpiresAtBeforeAndActiveTrue(LocalDateTime dateTime);
    
    boolean existsByKeyHash(String keyHash);
}
