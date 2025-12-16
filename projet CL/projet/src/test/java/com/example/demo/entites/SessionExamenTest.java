package com.example.demo.entites;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@DisplayName("Tests for SessionExamen Entity")
class SessionExamenTest {

    private SessionExamen session;
    private Set<Enseignant> surveillants;

    @BeforeEach
    void setUp() {
        session = new SessionExamen();
        session.setId(1L);
        session.setDate(LocalDate.now());
        session.setHeureDebut(LocalTime.of(10, 0));
        session.setHeureFin(LocalTime.of(12, 0));
        session.setMaxSurveillants(2);

        surveillants = new HashSet<>();
        session.setSurveillants(surveillants);
    }

    @Test
    @DisplayName("Test estDisponible when available")
    void testEstDisponibleWhenAvailable() {
        assertTrue(session.estDisponible(), 
            "Session should be available when surveillants count is less than max");
    }

    @Test
    @DisplayName("Test estDisponible when full")
    void testEstDisponibleWhenFull() {
        Enseignant e1 = new Enseignant();
        e1.setId(1L);
        Enseignant e2 = new Enseignant();
        e2.setId(2L);
        
        surveillants.add(e1);
        surveillants.add(e2);

        assertFalse(session.estDisponible(), 
            "Session should not be available when surveillants count equals max");
    }

    @Test
    @DisplayName("Test estDisponible when over capacity")
    void testEstDisponibleWhenOverCapacity() {
        Enseignant e1 = new Enseignant();
        e1.setId(1L);
        Enseignant e2 = new Enseignant();
        e2.setId(2L);
        Enseignant e3 = new Enseignant();
        e3.setId(3L);
        
        surveillants.add(e1);
        surveillants.add(e2);
        surveillants.add(e3);

        assertFalse(session.estDisponible(), 
            "Session should not be available when surveillants count exceeds max");
    }

    @Test
    @DisplayName("Test placesRestantes when empty")
    void testPlacesRestantesWhenEmpty() {
        int places = session.placesRestantes();
        
        assertEquals(2, places, 
            "Places remaining should equal maxSurveillants when no surveillants");
    }

    @Test
    @DisplayName("Test placesRestantes when partially filled")
    void testPlacesRestantesWhenPartiallyFilled() {
        Enseignant e1 = new Enseignant();
        e1.setId(1L);
        surveillants.add(e1);

        int places = session.placesRestantes();
        
        assertEquals(1, places, 
            "Places remaining should be maxSurveillants - current count");
    }

    @Test
    @DisplayName("Test placesRestantes when full")
    void testPlacesRestantesWhenFull() {
        Enseignant e1 = new Enseignant();
        e1.setId(1L);
        Enseignant e2 = new Enseignant();
        e2.setId(2L);
        
        surveillants.add(e1);
        surveillants.add(e2);

        int places = session.placesRestantes();
        
        assertEquals(0, places, 
            "Places remaining should be 0 when session is full");
    }

    @Test
    @DisplayName("Test addSuerveillant - adds to both sides")
    void testAddSuerveillant() {
        Enseignant enseignant = new Enseignant();
        enseignant.setId(1L);
        enseignant.setSurveillances(new HashSet<>());

        session.addSuerveillant(enseignant);

        assertTrue(session.getSurveillants().contains(enseignant), 
            "Session should contain the enseignant");
        assertTrue(enseignant.getSurveillances().contains(session), 
            "Enseignant should contain the session");
    }

    @Test
    @DisplayName("Test overlapWith - same date and time overlap")
    void testOverlapWithSameDateAndTime() {
        LocalDate date = LocalDate.now();
        LocalTime start = LocalTime.of(10, 30);
        LocalTime end = LocalTime.of(11, 30);

        boolean overlap = session.overlapWith(date, start, end);

        assertTrue(overlap, 
            "Sessions should overlap when on same date and times overlap");
    }

    @Test
    @DisplayName("Test overlapWith - same date but no overlap")
    void testOverlapWithSameDateNoOverlap() {
        LocalDate date = LocalDate.now();
        LocalTime start = LocalTime.of(13, 0); // After session ends
        LocalTime end = LocalTime.of(14, 0);

        boolean overlap = session.overlapWith(date, start, end);

        assertFalse(overlap, 
            "Sessions should not overlap when on same date but times don't overlap");
    }

    @Test
    @DisplayName("Test overlapWith - different date")
    void testOverlapWithDifferentDate() {
        LocalDate differentDate = LocalDate.now().plusDays(1);
        LocalTime start = LocalTime.of(10, 30);
        LocalTime end = LocalTime.of(11, 30);

        boolean overlap = session.overlapWith(differentDate, start, end);

        assertFalse(overlap, 
            "Sessions should not overlap when on different dates");
    }

    @Test
    @DisplayName("Test overlapWith - touching boundaries")
    void testOverlapWithTouchingBoundaries() {
        LocalDate date = LocalDate.now();
        // Session: 10:00-12:00
        LocalTime start = LocalTime.of(12, 0); // Exactly at end
        LocalTime end = LocalTime.of(13, 0);

        boolean overlap = session.overlapWith(date, start, end);

        assertFalse(overlap, 
            "Sessions should not overlap when one ends exactly when other starts");
    }

    @Test
    @DisplayName("Test overlapWith - one session inside another")
    void testOverlapWithOneInsideAnother() {
        LocalDate date = LocalDate.now();
        // Session: 10:00-12:00
        LocalTime start = LocalTime.of(10, 30); // Inside
        LocalTime end = LocalTime.of(11, 30);   // Inside

        boolean overlap = session.overlapWith(date, start, end);

        assertTrue(overlap, 
            "Sessions should overlap when one is completely inside another");
    }
}

