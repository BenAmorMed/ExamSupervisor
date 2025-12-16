package com.example.demo.service;

import java.util.List;

import com.example.demo.entites.Enseignant;
import com.example.demo.entites.SessionExamen;

public interface IEnseignantService {
    Enseignant login(String email, String password);

    List<SessionExamen> getDisponibilite(Long id);

    Enseignant getById(Long id);

    SessionExamen choisirSession(Long enseignantId, Long sessionId);

    void annulerChoix(Long enseignantId, Long sessionId);

    List<SessionExamen> mesSeances(Long enseignantId);

    public void assignRandomSessionsToCompleteCharge();

    List<SessionExamen> getSessionsWithAllMatieres(Long enseignantId);

    org.springframework.data.domain.Page<SessionExamen> getAllSessions(
            org.springframework.data.domain.Pageable pageable);
}
