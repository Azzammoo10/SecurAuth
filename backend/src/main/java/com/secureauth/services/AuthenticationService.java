package com.secureauth.services;

import com.secureauth.config.JwtService;
import com.secureauth.dto.AuthenticationResponse;
import com.secureauth.dto.LoginRequest;
import com.secureauth.dto.RefreshTokenRequest;
import com.secureauth.dto.UserResponse;
import com.secureauth.entities.AuditLog;
import com.secureauth.entities.RefreshToken;
import com.secureauth.entities.User;
import com.secureauth.exceptions.AuthenticationException;
import com.secureauth.exceptions.ResourceNotFoundException;
import com.secureauth.repositories.RefreshTokenRepository;
import com.secureauth.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

/**
 * Service d'authentification
 * Gère le login, logout, refresh token et la sécurité des tentatives de connexion
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class AuthenticationService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final AuditService auditService;
    private final TwoFactorAuthenticationService twoFactorService;

    @Value("${security.max-login-attempts}")
    private int maxLoginAttempts;

    @Value("${security.account-lock-duration}")
    private long accountLockDuration;

    /**
     * Authentifie un utilisateur et retourne les tokens JWT
     */
    @Transactional
    public AuthenticationResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> {
                    auditService.logFailure(request.getUsername(), AuditLog.Action.LOGIN_FAILED, 
                            "Utilisateur non trouvé");
                    return new UsernameNotFoundException("Identifiants invalides");
                });

        // Vérifie si le compte est verrouillé et si le verrouillage peut être levé
        if (!user.isAccountNonLocked()) {
            if (user.isLockExpired(accountLockDuration)) {
                user.unlock();
                userRepository.save(user);
                log.info("Account auto-unlocked: {}", user.getUsername());
            } else {
                auditService.logFailure(user.getUsername(), AuditLog.Action.LOGIN_FAILED, 
                        "Compte verrouillé");
                throw new LockedException("Compte verrouillé. Réessayez plus tard ou contactez un administrateur.");
            }
        }

        try {
            // Authentification
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );

            // Réinitialise les tentatives échouées
            user.resetFailedAttempts();
            userRepository.save(user);

            // Si l'utilisateur a la 2FA activée, on demande le code
            if (user.getTwoFactorEnabled() != null && user.getTwoFactorEnabled()) {
                // Génère un token temporaire (valide 5 minutes)
                String tempToken = jwtService.generateTempToken(user);
                
                auditService.logSuccess(user.getUsername(), AuditLog.Action.LOGIN_SUCCESS, 
                        "Authentification réussie, 2FA requise");
                
                return AuthenticationResponse.builder()
                        .requires2FA(true)
                        .tempToken(tempToken)
                        .tokenType("Bearer")
                        .build();
            }

            // Si pas de 2FA, login normal
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);

            // Génère les tokens
            String accessToken = jwtService.generateToken(user);
            String refreshToken = jwtService.generateRefreshToken(user);

            // Sauvegarde le refresh token
            saveRefreshToken(user, refreshToken);

            // Audit
            auditService.logSuccess(user.getUsername(), AuditLog.Action.LOGIN_SUCCESS, 
                    "Connexion réussie");

            return AuthenticationResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .tokenType("Bearer")
                    .expiresIn(3600L) // 1 heure
                    .user(mapToUserResponse(user))
                    .requires2FA(false)
                    .build();

        } catch (BadCredentialsException e) {
            // Incrémente les tentatives échouées
            user.incrementFailedAttempts();
            
            if (user.getFailedLoginAttempts() >= maxLoginAttempts) {
                user.lock();
                auditService.logFailure(user.getUsername(), AuditLog.Action.USER_LOCKED, 
                        "Trop de tentatives échouées");
                log.warn("Account locked due to failed attempts: {}", user.getUsername());
            } else {
                auditService.logFailure(user.getUsername(), AuditLog.Action.LOGIN_FAILED, 
                        "Mot de passe incorrect");
            }
            
            userRepository.save(user);
            
            throw new AuthenticationException("Identifiants invalides");
        }
    }

    /**
     * Vérifie le code 2FA et complète l'authentification
     */
    @Transactional
    public AuthenticationResponse verify2FALogin(String tempToken, String code) {
        // Extrait le username du token temporaire
        String username = jwtService.extractUsername(tempToken);
        
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new AuthenticationException("Token invalide"));

        // Vérifie le code 2FA
        boolean isValid = twoFactorService.verifyCode(user.getTwoFactorSecret(), code);
        
        if (!isValid) {
            auditService.logFailure(username, AuditLog.Action.LOGIN_FAILED, 
                    "Code 2FA invalide");
            throw new AuthenticationException("Code 2FA invalide");
        }

        // Code valide, génère les tokens JWT
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        saveRefreshToken(user, refreshToken);

        auditService.logSuccess(username, AuditLog.Action.LOGIN_SUCCESS, 
                "Connexion réussie avec 2FA");

        return AuthenticationResponse.builder()
                .accessToken(accessToken)
                .refreshToken(refreshToken)
                .tokenType("Bearer")
                .expiresIn(3600L)
                .user(mapToUserResponse(user))
                .requires2FA(false)
                .build();
    }

    /**
     * Rafraîchit l'access token avec un refresh token
     */
    @Transactional
    public AuthenticationResponse refreshToken(RefreshTokenRequest request) {
        RefreshToken refreshToken = refreshTokenRepository.findByToken(request.getRefreshToken())
                .orElseThrow(() -> new AuthenticationException("Refresh token invalide"));

        // Vérifie si le token est révoqué ou expiré
        if (refreshToken.getRevoked()) {
            throw new AuthenticationException("Refresh token révoqué");
        }

        if (refreshToken.isExpired()) {
            refreshTokenRepository.delete(refreshToken);
            throw new AuthenticationException("Refresh token expiré");
        }

        User user = refreshToken.getUser();

        // Génère un nouveau access token
        String newAccessToken = jwtService.generateToken(user);

        return AuthenticationResponse.builder()
                .accessToken(newAccessToken)
                .refreshToken(request.getRefreshToken())
                .tokenType("Bearer")
                .expiresIn(3600L)
                .user(mapToUserResponse(user))
                .build();
    }

    /**
     * Déconnecte un utilisateur (révoque le refresh token)
     */
    @Transactional
    public void logout(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        // Révoque tous les refresh tokens de l'utilisateur
        refreshTokenRepository.findByUser(user).forEach(token -> {
            token.revoke();
            refreshTokenRepository.save(token);
        });

        auditService.logSuccess(username, AuditLog.Action.LOGOUT, "Déconnexion réussie");
    }

    /**
     * Sauvegarde un refresh token
     */
    private void saveRefreshToken(User user, String token) {
        RefreshToken refreshToken = RefreshToken.builder()
                .token(token)
                .user(user)
                .expiryDate(LocalDateTime.now().plusNanos(jwtService.getRefreshExpiration() * 1_000_000))
                .build();

        refreshTokenRepository.save(refreshToken);
    }

    /**
     * Mappe User vers UserResponse
     */
    private UserResponse mapToUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .phoneNumber(user.getPhoneNumber())
                .enabled(user.getEnabled())
                .accountNonLocked(user.getAccountNonLocked())
                .roles(user.getRoles().stream()
                        .map(role -> role.getName())
                        .collect(Collectors.toSet()))
                .createdAt(user.getCreatedAt())
                .lastLoginAt(user.getLastLoginAt())
                .build();
    }
}
