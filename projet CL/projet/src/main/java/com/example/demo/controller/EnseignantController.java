package com.example.demo.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.demo.dto.LoginRequest;
import com.example.demo.dto.SessionExamenDto;
import com.example.demo.mapper.DtoMapper;
import com.example.demo.entites.Enseignant;
import com.example.demo.entites.SessionExamen;
import com.example.demo.service.EnseignantService;

import lombok.RequiredArgsConstructor;
import org.springframework.orm.ObjectOptimisticLockingFailureException;

@CrossOrigin(origins = "http://localhost:5173")
@RestController
@RequestMapping("/enseignant")
@RequiredArgsConstructor
public class EnseignantController {

    private final EnseignantService enseignantService;

    // -------------------------------------
    // 1) LOGIN
    // -------------------------------------
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            Enseignant e = enseignantService.login(request.getEmail(), request.getPassword());
            return ResponseEntity.ok(e); // <-- Keep entity for JWT later
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ex.getMessage());
        }
    }

    // -------------------------------------
    // 2) LISTE DES SESSIONS DISPONIBLES
    // -------------------------------------
    @GetMapping("/{id}/disponibilite")
    public ResponseEntity<?> getDisponibilite(@PathVariable Long id) {
        List<SessionExamen> list = enseignantService.getDisponibilite(id);

        // convert to DTOs
        List<SessionExamenDto> dtoList = list.stream()
                .map(DtoMapper::toSessionDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

    // -------------------------------------
    // 3) CHOISIR UNE SESSION → returns DTO
    // -------------------------------------
    @PostMapping("/{enseignantId}/choisir/{sessionId}")
    public ResponseEntity<?> choisirSession(
            @PathVariable Long enseignantId,
            @PathVariable Long sessionId) {

        try {
            SessionExamen result = enseignantService.choisirSession(enseignantId, sessionId);
            SessionExamenDto dto = DtoMapper.toSessionDto(result);
            return ResponseEntity.ok(dto);
        } catch (ObjectOptimisticLockingFailureException e) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("La session a été modifiée par un autre utilisateur. Veuillez réessayer.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------
    // 4) ANNULER CHOIX
    // -------------------------------------
    @PostMapping("/{enseignantId}/annuler/{sessionId}")
    public ResponseEntity<?> annulerChoix(
            @PathVariable Long enseignantId,
            @PathVariable Long sessionId) {

        try {
            enseignantService.annulerChoix(enseignantId, sessionId);
            return ResponseEntity.ok("Choix annulé");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------
    // 5) MES SÉANCES → return DTO
    // -------------------------------------
    @GetMapping("/{id}/mesSeances")
    public ResponseEntity<?> mesSeances(@PathVariable Long id) {
        List<SessionExamen> list = enseignantService.mesSeances(id);

        List<SessionExamenDto> dtoList = list.stream()
                .map(DtoMapper::toSessionDto)
                .collect(Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

    @PostMapping("/admin/assign-auto")
    public ResponseEntity<String> manualAutoAssign() {
        enseignantService.assignRandomSessionsToCompleteCharge();
        return ResponseEntity.ok("Auto assignment done successfully!");
    }

    @PostMapping("/assign-auto/{id}")
    public ResponseEntity<String> autoAssign(@PathVariable Long id) {
        enseignantService.assignSessionsForTeacher(id);
        return ResponseEntity.ok("Auto assignment done successfully!");
    }

    @GetMapping("/{id}/fullCharge")
    public ResponseEntity<Boolean> isFullCharge(@PathVariable Long id) {
        Enseignant e = enseignantService.getById(id);
        return ResponseEntity.ok(e.isFullCharge());
    }

    // -------------------------------------
    // 7) SESSIONS WITH ALL TEACHER MATIERES
    // -------------------------------------
    @GetMapping("/{id}/sessionsWithAllMatieres")
    public ResponseEntity<?> getSessionsWithAllMatieres(@PathVariable Long id) {
        try {
            List<SessionExamen> list = enseignantService.getSessionsWithAllMatieres(id);

            List<SessionExamenDto> dtoList = list.stream()
                    .map(DtoMapper::toSessionDto)
                    .collect(Collectors.toList());

            return ResponseEntity.ok(dtoList);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // -------------------------------------
    // 8) GET TEACHER INFO
    // -------------------------------------
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        try {
            Enseignant e = enseignantService.getById(id);
            // Convert to DTO to avoid recursion and send calculated fields (like charge)
            // properly
            return ResponseEntity.ok(DtoMapper.toEnseignantDto(e));
        } catch (Exception ex) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
        }
    }

    @GetMapping("/sessions")
    public ResponseEntity<?> getAllSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {

        org.springframework.data.domain.Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size,
                org.springframework.data.domain.Sort.by("date").ascending()
                        .and(org.springframework.data.domain.Sort.by("heureDebut").ascending()));

        org.springframework.data.domain.Page<SessionExamen> pageResult = enseignantService.getAllSessions(pageable);

        org.springframework.data.domain.Page<SessionExamenDto> dtoPage = pageResult.map(DtoMapper::toSessionDto);

        return ResponseEntity.ok(dtoPage);
    }

}
