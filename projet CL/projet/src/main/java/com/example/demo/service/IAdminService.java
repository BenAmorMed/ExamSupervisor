package com.example.demo.service;

import java.util.List;

import com.example.demo.entites.Admin;
import com.example.demo.entites.Enseignant;
import com.example.demo.entites.Matiere;
import com.example.demo.entites.SessionExamen;

public interface IAdminService {
    // Admin
    Admin createAdmin(Admin admin);

    Admin login(String email, String password);

    // Enseignant
    Enseignant addEnseignant(Enseignant enseignant);

    void deleteEnseignant(Long id);

    List<Enseignant> getAllEnseignants();

    // Matiere
    Matiere addMatiere(Matiere matiere);

    void deleteMatiere(Long id);

    List<Matiere> getAllMatieres();

    // SessionExamen
    SessionExamen addSessionExamen(SessionExamen session);

    void deleteSessionExamen(Long id);

    List<SessionExamen> getAllSessions();
}
