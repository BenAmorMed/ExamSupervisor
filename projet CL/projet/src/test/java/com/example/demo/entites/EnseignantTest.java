package com.example.demo.entites;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Tests for Enseignant Entity")
class EnseignantTest {

    private Enseignant enseignant;
    private Grade grade;
    private Set<Matiere> matieres;
    private Set<SessionExamen> surveillances;

    @BeforeEach
    void setUp() {
        // Setup Grade
        grade = new Grade();
        grade.setId(1L);
        grade.setNom("Professeur");
        grade.setChargeH(20); // 20 hours charge

        // Setup Matieres
        matieres = new HashSet<>();
        Matiere matiere1 = new Matiere();
        matiere1.setId(1L);
        matiere1.setNom("Mathématiques");
        matieres.add(matiere1);

        Matiere matiere2 = new Matiere();
        matiere2.setId(2L);
        matiere2.setNom("Physique");
        matieres.add(matiere2);

        // Setup Enseignant
        enseignant = new Enseignant();
        enseignant.setId(1L);
        enseignant.setNom("Doe");
        enseignant.setPrenom("John");
        enseignant.setEmail("john.doe@example.com");
        enseignant.setPassword("password123");
        enseignant.setGrade(grade);
        enseignant.setMatieres(matieres);

        // Setup Surveillances (sessions)
        surveillances = new HashSet<>();
        enseignant.setSurveillances(surveillances);
    }

    @Test
    @DisplayName("Test getCharge calculation")
    void testGetCharge() {
        // charge = grade.getChargeH() * 1.5 - matieres.size()
        // charge = 20 * 1.5 - 2 = 30 - 2 = 28
        double expectedCharge = 20 * 1.5 - 2;
        double actualCharge = enseignant.getCharge();
        
        assertEquals(expectedCharge, actualCharge, 0.01, 
            "Charge should be calculated as grade charge * 1.5 - number of matieres");
    }

    @Test
    @DisplayName("Test getCharge with no matieres")
    void testGetChargeWithNoMatieres() {
        enseignant.setMatieres(new HashSet<>());
        
        double expectedCharge = 20 * 1.5 - 0; // 30
        double actualCharge = enseignant.getCharge();
        
        assertEquals(expectedCharge, actualCharge, 0.01, 
            "Charge should be calculated correctly when there are no matieres");
    }

    @Test
    @DisplayName("Test calculeHoursSelcted with no sessions")
    void testCalculeHoursSelctedWithNoSessions() {
        long totalMinutes = enseignant.calculeHoursSelcted();
        
        assertEquals(0, totalMinutes, 
            "Total minutes should be 0 when there are no sessions");
    }

    @Test
    @DisplayName("Test calculeHoursSelcted with one session")
    void testCalculeHoursSelctedWithOneSession() {
        SessionExamen session = new SessionExamen();
        session.setId(1L);
        session.setDate(LocalDate.now());
        session.setHeureDebut(LocalTime.of(10, 0)); // 10:00
        session.setHeureFin(LocalTime.of(12, 0));   // 12:00
        
        surveillances.add(session);
        
        long totalMinutes = enseignant.calculeHoursSelcted();
        // 2 hours = 120 minutes
        assertEquals(120, totalMinutes, 
            "Total minutes should be 120 for a 2-hour session");
    }

    @Test
    @DisplayName("Test calculeHoursSelcted with multiple sessions")
    void testCalculeHoursSelctedWithMultipleSessions() {
        // Session 1: 10:00 - 12:00 (2 hours = 120 minutes)
        SessionExamen session1 = new SessionExamen();
        session1.setId(1L);
        session1.setDate(LocalDate.now());
        session1.setHeureDebut(LocalTime.of(10, 0));
        session1.setHeureFin(LocalTime.of(12, 0));
        surveillances.add(session1);

        // Session 2: 14:00 - 16:30 (2.5 hours = 150 minutes)
        SessionExamen session2 = new SessionExamen();
        session2.setId(2L);
        session2.setDate(LocalDate.now());
        session2.setHeureDebut(LocalTime.of(14, 0));
        session2.setHeureFin(LocalTime.of(16, 30));
        surveillances.add(session2);

        long totalMinutes = enseignant.calculeHoursSelcted();
        // 120 + 150 = 270 minutes
        assertEquals(270, totalMinutes, 
            "Total minutes should be the sum of all session durations");
    }

    @Test
    @DisplayName("Test isFullCharge when not full")
    void testIsFullChargeWhenNotFull() {
        // charge = 20 hours = 1200 minutes
        // selected = 0 minutes
        boolean isFull = enseignant.isFullCharge();
        
        assertFalse(isFull, 
            "Teacher should not be at full charge when no sessions selected");
    }

    @Test
    @DisplayName("Test isFullCharge when exactly full")
    void testIsFullChargeWhenExactlyFull() {
        // charge = 20 hours = 1200 minutes
        // Create sessions totaling exactly 1200 minutes (20 hours)
        for (int i = 0; i < 10; i++) {
            SessionExamen session = new SessionExamen();
            session.setId((long) i);
            session.setDate(LocalDate.now().plusDays(i));
            session.setHeureDebut(LocalTime.of(8, 0));
            session.setHeureFin(LocalTime.of(10, 0)); // 2 hours = 120 minutes each
            surveillances.add(session);
        }
        // 10 * 120 = 1200 minutes = 20 hours
        
        boolean isFull = enseignant.isFullCharge();
        
        assertTrue(isFull, 
            "Teacher should be at full charge when selected hours equal charge");
    }

    @Test
    @DisplayName("Test isFullCharge when over full")
    void testIsFullChargeWhenOverFull() {
        // charge = 20 hours = 1200 minutes
        // Create sessions totaling more than 1200 minutes
        for (int i = 0; i < 11; i++) {
            SessionExamen session = new SessionExamen();
            session.setId((long) i);
            session.setDate(LocalDate.now().plusDays(i));
            session.setHeureDebut(LocalTime.of(8, 0));
            session.setHeureFin(LocalTime.of(10, 0)); // 2 hours = 120 minutes each
            surveillances.add(session);
        }
        // 11 * 120 = 1320 minutes > 1200 minutes
        
        boolean isFull = enseignant.isFullCharge();
        
        assertTrue(isFull, 
            "Teacher should be at full charge when selected hours exceed charge");
    }

    @Test
    @DisplayName("Test isFullCharge with partial charge")
    void testIsFullChargeWithPartialCharge() {
        // charge = 20 hours = 1200 minutes
        // Add 5 sessions of 2 hours each = 600 minutes = 10 hours
        for (int i = 0; i < 5; i++) {
            SessionExamen session = new SessionExamen();
            session.setId((long) i);
            session.setDate(LocalDate.now().plusDays(i));
            session.setHeureDebut(LocalTime.of(8, 0));
            session.setHeureFin(LocalTime.of(10, 0)); // 2 hours = 120 minutes each
            surveillances.add(session);
        }
        // 5 * 120 = 600 minutes < 1200 minutes
        
        boolean isFull = enseignant.isFullCharge();
        
        assertFalse(isFull, 
            "Teacher should not be at full charge when selected hours are less than charge");
    }
}

