package com.example.demo.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.LoginRequest;
import com.example.demo.entites.Admin;
import com.example.demo.entites.Enseignant;
import com.example.demo.entites.Matiere;
import com.example.demo.entites.SessionExamen;
import com.example.demo.service.IAdminService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final IAdminService adminService;

    // --- Auth ---
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Admin admin = adminService.login(request.getEmail(), request.getPassword());
        if (admin != null) {
            return ResponseEntity.ok(admin);
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
    }

    @PostMapping("/register")
    public ResponseEntity<?> createAdmin(@RequestBody Admin admin) {
        return ResponseEntity.ok(adminService.createAdmin(admin));
    }

    // --- Enseignant ---
    @GetMapping("/enseignants")
    public ResponseEntity<List<Enseignant>> getAllEnseignants() {
        return ResponseEntity.ok(adminService.getAllEnseignants());
    }

    @PostMapping("/enseignants")
    public ResponseEntity<Enseignant> addEnseignant(@RequestBody Enseignant enseignant) {
        return ResponseEntity.ok(adminService.addEnseignant(enseignant));
    }

    @DeleteMapping("/enseignants/{id}")
    public ResponseEntity<?> deleteEnseignant(@PathVariable Long id) {
        adminService.deleteEnseignant(id);
        return ResponseEntity.ok("Enseignant deleted");
    }

    // --- Matiere ---
    @GetMapping("/matieres")
    public ResponseEntity<List<Matiere>> getAllMatieres() {
        return ResponseEntity.ok(adminService.getAllMatieres());
    }

    @PostMapping("/matieres")
    public ResponseEntity<Matiere> addMatiere(@RequestBody Matiere matiere) {
        return ResponseEntity.ok(adminService.addMatiere(matiere));
    }

    @DeleteMapping("/matieres/{id}")
    public ResponseEntity<?> deleteMatiere(@PathVariable Long id) {
        adminService.deleteMatiere(id);
        return ResponseEntity.ok("Matiere deleted");
    }

    // --- SessionExamen ---
    @GetMapping("/sessions")
    public ResponseEntity<List<SessionExamen>> getAllSessions() {
        return ResponseEntity.ok(adminService.getAllSessions());
    }

    @PostMapping("/sessions")
    public ResponseEntity<SessionExamen> addSessionExamen(@RequestBody SessionExamen session) {
        return ResponseEntity.ok(adminService.addSessionExamen(session));
    }

    @DeleteMapping("/sessions/{id}")
    public ResponseEntity<?> deleteSessionExamen(@PathVariable Long id) {
        adminService.deleteSessionExamen(id);
        return ResponseEntity.ok("SessionExamen deleted");
    }
}
