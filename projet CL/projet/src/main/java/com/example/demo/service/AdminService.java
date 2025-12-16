package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entites.Admin;
import com.example.demo.entites.Enseignant;
import com.example.demo.entites.Matiere;
import com.example.demo.entites.SessionExamen;
import com.example.demo.repository.AdminRepo;
import com.example.demo.repository.EnseignantRepo;
import com.example.demo.repository.MatiereRepo;
import com.example.demo.repository.SessionExamenRepo;

import lombok.RequiredArgsConstructor;
@Transactional
@Service
@RequiredArgsConstructor
public class AdminService implements IAdminService {

    private final AdminRepo adminRepo;
    private final EnseignantRepo enseignantRepo;
    private final MatiereRepo matiereRepo;
    private final SessionExamenRepo sessionRepo;

    // --- Admin ---
    @Override
    public Admin createAdmin(Admin admin) {
        return adminRepo.save(admin);
    }

    @Override
    public Admin login(String email, String password) {
        return adminRepo.findByEmailAndPassword(email, password);
    }

    // --- Enseignant ---
    @Override
    public Enseignant addEnseignant(Enseignant enseignant) {
        return enseignantRepo.save(enseignant);
    }

    @Override
    public void deleteEnseignant(Long id) {
        enseignantRepo.deleteById(id);
    }

    @Override
    public List<Enseignant> getAllEnseignants() {
        return enseignantRepo.findAll();
    }

    // --- Matiere ---
    @Override
    public Matiere addMatiere(Matiere matiere) {
        return matiereRepo.save(matiere);
    }

    @Override
    public void deleteMatiere(Long id) {
        matiereRepo.deleteById(id);
    }

    @Override
    public List<Matiere> getAllMatieres() {
        return matiereRepo.findAll();
    }

    // --- SessionExamen ---
    @Override
    public SessionExamen addSessionExamen(SessionExamen session) {
        return sessionRepo.save(session);
    }

    @Override
    public void deleteSessionExamen(Long id) {
        sessionRepo.deleteById(id);
    }

    @Override
    public List<SessionExamen> getAllSessions() {
        return sessionRepo.findAll();
    }
}
