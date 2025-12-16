package com.example.demo.service;

import com.example.demo.entites.Enseignant;
import com.example.demo.entites.Grade;
import com.example.demo.entites.Matiere;
import com.example.demo.entites.SessionExamen;
import com.example.demo.repository.EnseignantRepo;
import com.example.demo.repository.SessionExamenRepo;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("Tests for EnseignantService")
class EnseignantServiceTest {

    @Mock
    private EnseignantRepo enseignantRepo;

    @Mock
    private SessionExamenRepo examenRepo;

    @InjectMocks
    private EnseignantService enseignantService;

    private Enseignant enseignant;
    private Grade grade;
    private SessionExamen session;
    private Set<SessionExamen> surveillances;

    @BeforeEach
    void setUp() {
        // Setup Grade
        grade = new Grade();
        grade.setId(1L);
        grade.setNom("Professeur");
        grade.setChargeH(20);

        // Setup Enseignant
        enseignant = new Enseignant();
        enseignant.setId(1L);
        enseignant.setNom("Doe");
        enseignant.setPrenom("John");
        enseignant.setEmail("john.doe@example.com");
        enseignant.setPassword("password123");
        enseignant.setGrade(grade);
        enseignant.setMatieres(new HashSet<>());

        surveillances = new HashSet<>();
        enseignant.setSurveillances(surveillances);

        // Setup Session
        session = new SessionExamen();
        session.setId(1L);
        session.setDate(LocalDate.now());
        session.setHeureDebut(LocalTime.of(10, 0));
        session.setHeureFin(LocalTime.of(12, 0));
        session.setMaxSurveillants(2);
        session.setSurveillants(new HashSet<>());
    }

    @Test
    @DisplayName("Test login with valid credentials")
    void testLoginWithValidCredentials() {
        when(enseignantRepo.findByEmailAndPassword("john.doe@example.com", "password123"))
            .thenReturn(enseignant);

        Enseignant result = enseignantService.login("john.doe@example.com", "password123");

        assertNotNull(result);
        assertEquals(enseignant.getId(), result.getId());
        assertEquals(enseignant.getEmail(), result.getEmail());
        verify(enseignantRepo, times(1)).findByEmailAndPassword(anyString(), anyString());
    }

    @Test
    @DisplayName("Test login with invalid credentials")
    void testLoginWithInvalidCredentials() {
        when(enseignantRepo.findByEmailAndPassword("wrong@example.com", "wrong"))
            .thenReturn(null);

        Enseignant result = enseignantService.login("wrong@example.com", "wrong");

        assertNull(result);
        verify(enseignantRepo, times(1)).findByEmailAndPassword(anyString(), anyString());
    }

    @Test
    @DisplayName("Test getDisponibilite")
    void testGetDisponibilite() {
        List<SessionExamen> availableSessions = Arrays.asList(session);
        when(examenRepo.findAvailableSessions(1L)).thenReturn(availableSessions);

        List<SessionExamen> result = enseignantService.getDisponibilite(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(examenRepo, times(1)).findAvailableSessions(1L);
    }

    @Test
    @DisplayName("Test choisirSession - success")
    void testChoisirSessionSuccess() {
        when(enseignantRepo.findById(1L)).thenReturn(Optional.of(enseignant));
        when(examenRepo.findById(1L)).thenReturn(Optional.of(session));
        when(examenRepo.save(any(SessionExamen.class))).thenReturn(session);

        SessionExamen result = enseignantService.choisirSession(1L, 1L);

        assertNotNull(result);
        verify(enseignantRepo, times(1)).findById(1L);
        verify(examenRepo, times(1)).findById(1L);
        verify(examenRepo, times(1)).save(any(SessionExamen.class));
    }

    @Test
    @DisplayName("Test choisirSession - teacher not found")
    void testChoisirSessionTeacherNotFound() {
        when(enseignantRepo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            enseignantService.choisirSession(1L, 1L);
        }, "Should throw exception when teacher not found");

        verify(enseignantRepo, times(1)).findById(1L);
        verify(examenRepo, never()).findById(anyLong());
    }

    @Test
    @DisplayName("Test choisirSession - session not found")
    void testChoisirSessionSessionNotFound() {
        when(enseignantRepo.findById(1L)).thenReturn(Optional.of(enseignant));
        when(examenRepo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            enseignantService.choisirSession(1L, 1L);
        }, "Should throw exception when session not found");

        verify(enseignantRepo, times(1)).findById(1L);
        verify(examenRepo, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Test choisirSession - session full")
    void testChoisirSessionFull() {
        session.getSurveillants().add(new Enseignant());
        session.getSurveillants().add(new Enseignant()); // 2 surveillants = max

        when(enseignantRepo.findById(1L)).thenReturn(Optional.of(enseignant));
        when(examenRepo.findById(1L)).thenReturn(Optional.of(session));

        assertThrows(RuntimeException.class, () -> {
            enseignantService.choisirSession(1L, 1L);
        }, "Should throw exception when session is full");

        verify(enseignantRepo, times(1)).findById(1L);
        verify(examenRepo, times(1)).findById(1L);
        verify(examenRepo, never()).save(any(SessionExamen.class));
    }

    @Test
    @DisplayName("Test choisirSession - teacher at full charge")
    void testChoisirSessionTeacherAtFullCharge() {
        // Add sessions to make teacher full
        for (int i = 0; i < 10; i++) {
            SessionExamen s = new SessionExamen();
            s.setId((long) (i + 10));
            s.setDate(LocalDate.now().plusDays(i));
            s.setHeureDebut(LocalTime.of(8, 0));
            s.setHeureFin(LocalTime.of(10, 0)); // 2 hours each
            surveillances.add(s);
        }

        when(enseignantRepo.findById(1L)).thenReturn(Optional.of(enseignant));
        when(examenRepo.findById(1L)).thenReturn(Optional.of(session));

        assertThrows(RuntimeException.class, () -> {
            enseignantService.choisirSession(1L, 1L);
        }, "Should throw exception when teacher is at full charge");

        verify(enseignantRepo, times(1)).findById(1L);
        verify(examenRepo, times(1)).findById(1L);
        verify(examenRepo, never()).save(any(SessionExamen.class));
    }

    @Test
    @DisplayName("Test choisirSession - would exceed charge")
    void testChoisirSessionWouldExceedCharge() {
        // Add sessions to almost fill charge
        // 19 hours already selected (1140 minutes)
        for (int i = 0; i < 9; i++) {
            SessionExamen s = new SessionExamen();
            s.setId((long) (i + 10));
            s.setDate(LocalDate.now().plusDays(i));
            s.setHeureDebut(LocalTime.of(8, 0));
            s.setHeureFin(LocalTime.of(10, 0)); // 2 hours each = 120 minutes
            surveillances.add(s);
        }
        // Add one more session of 1 hour (60 minutes)
        SessionExamen s = new SessionExamen();
        s.setId(100L);
        s.setDate(LocalDate.now().plusDays(10));
        s.setHeureDebut(LocalTime.of(8, 0));
        s.setHeureFin(LocalTime.of(9, 0)); // 1 hour = 60 minutes
        surveillances.add(s);
        // Total: 9 * 120 + 60 = 1140 minutes (19 hours)
        // Charge: 20 hours = 1200 minutes
        // Trying to add 2-hour session (120 minutes) would make it 1260 > 1200

        when(enseignantRepo.findById(1L)).thenReturn(Optional.of(enseignant));
        when(examenRepo.findById(1L)).thenReturn(Optional.of(session));

        assertThrows(RuntimeException.class, () -> {
            enseignantService.choisirSession(1L, 1L);
        }, "Should throw exception when adding session would exceed charge");

        verify(enseignantRepo, times(1)).findById(1L);
        verify(examenRepo, times(1)).findById(1L);
        verify(examenRepo, never()).save(any(SessionExamen.class));
    }

    @Test
    @DisplayName("Test choisirSession - time conflict")
    void testChoisirSessionTimeConflict() {
        // Add existing session at same time
        SessionExamen existingSession = new SessionExamen();
        existingSession.setId(2L);
        existingSession.setDate(session.getDate()); // Same date
        existingSession.setHeureDebut(LocalTime.of(10, 30)); // Overlaps with 10:00-12:00
        existingSession.setHeureFin(LocalTime.of(11, 30));
        surveillances.add(existingSession);

        when(enseignantRepo.findById(1L)).thenReturn(Optional.of(enseignant));
        when(examenRepo.findById(1L)).thenReturn(Optional.of(session));

        assertThrows(RuntimeException.class, () -> {
            enseignantService.choisirSession(1L, 1L);
        }, "Should throw exception when there is a time conflict");

        verify(enseignantRepo, times(1)).findById(1L);
        verify(examenRepo, times(1)).findById(1L);
        verify(examenRepo, never()).save(any(SessionExamen.class));
    }

    @Test
    @DisplayName("Test annulerChoix - success")
    void testAnnulerChoixSuccess() {
        surveillances.add(session);
        session.getSurveillants().add(enseignant);

        when(enseignantRepo.findById(1L)).thenReturn(Optional.of(enseignant));
        when(examenRepo.findById(1L)).thenReturn(Optional.of(session));
        when(examenRepo.save(any(SessionExamen.class))).thenReturn(session);

        assertDoesNotThrow(() -> {
            enseignantService.annulerChoix(1L, 1L);
        }, "Should not throw exception when canceling successfully");

        verify(enseignantRepo, times(1)).findById(1L);
        verify(examenRepo, times(1)).findById(1L);
        verify(examenRepo, times(1)).save(any(SessionExamen.class));
    }

    @Test
    @DisplayName("Test annulerChoix - teacher not in session")
    void testAnnulerChoixTeacherNotInSession() {
        when(enseignantRepo.findById(1L)).thenReturn(Optional.of(enseignant));
        when(examenRepo.findById(1L)).thenReturn(Optional.of(session));

        assertThrows(RuntimeException.class, () -> {
            enseignantService.annulerChoix(1L, 1L);
        }, "Should throw exception when teacher is not in session");

        verify(enseignantRepo, times(1)).findById(1L);
        verify(examenRepo, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Test mesSeances")
    void testMesSeances() {
        surveillances.add(session);

        when(enseignantRepo.findById(1L)).thenReturn(Optional.of(enseignant));

        List<SessionExamen> result = enseignantService.mesSeances(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(enseignantRepo, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Test getById")
    void testGetById() {
        when(enseignantRepo.findById(1L)).thenReturn(Optional.of(enseignant));

        Enseignant result = enseignantService.getById(1L);

        assertNotNull(result);
        assertEquals(enseignant.getId(), result.getId());
        verify(enseignantRepo, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Test getById - not found")
    void testGetByIdNotFound() {
        when(enseignantRepo.findById(1L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () -> {
            enseignantService.getById(1L);
        }, "Should throw exception when teacher not found");

        verify(enseignantRepo, times(1)).findById(1L);
    }

    @Test
    @DisplayName("Test getSessionsWithAllMatieres - teacher has no matieres")
    void testGetSessionsWithAllMatieresNoMatieres() {
        enseignant.setMatieres(new HashSet<>());

        when(enseignantRepo.findById(1L)).thenReturn(Optional.of(enseignant));

        List<SessionExamen> result = enseignantService.getSessionsWithAllMatieres(1L);

        assertNotNull(result);
        assertTrue(result.isEmpty(), "Should return empty list when teacher has no matieres");
        verify(enseignantRepo, times(1)).findById(1L);
        verify(examenRepo, never()).findSessionsWithAllTeacherMatieres(anyLong());
    }

    @Test
    @DisplayName("Test getSessionsWithAllMatieres - teacher has matieres")
    void testGetSessionsWithAllMatieresWithMatieres() {
        Matiere matiere = new Matiere();
        matiere.setId(1L);
        matiere.setNom("Mathématiques");
        enseignant.getMatieres().add(matiere);

        List<SessionExamen> sessions = Arrays.asList(session);
        when(enseignantRepo.findById(1L)).thenReturn(Optional.of(enseignant));
        when(examenRepo.findSessionsWithAllTeacherMatieres(1L)).thenReturn(sessions);

        List<SessionExamen> result = enseignantService.getSessionsWithAllMatieres(1L);

        assertNotNull(result);
        assertEquals(1, result.size());
        verify(enseignantRepo, times(1)).findById(1L);
        verify(examenRepo, times(1)).findSessionsWithAllTeacherMatieres(1L);
    }
}

