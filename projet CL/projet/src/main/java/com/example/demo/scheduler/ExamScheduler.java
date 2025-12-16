package com.example.demo.scheduler;

import java.time.LocalDate;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import com.example.demo.repository.SessionExamenRepo;
import com.example.demo.entites.SessionExamen;
import com.example.demo.service.EnseignantService;

import lombok.extern.slf4j.Slf4j;

@Component
@Slf4j
public class ExamScheduler {

    @Autowired
    private EnseignantService enseignantService;

    @Autowired
    private SessionExamenRepo examenRepo;

    // Run every day at 08:00 AM
    @Scheduled(cron = "0 0 8 * * *")
    public void checkAndAssignSessions() {
        log.info("Checking for auto-assignment trigger...");

        SessionExamen firstSession = examenRepo.findFirstByOrderByDateAsc();
        if (firstSession == null) {
            log.info("No exams found.");
            return;
        }

        LocalDate firstExamDate = firstSession.getDate();
        LocalDate today = LocalDate.now();

        // Check if today is exactly 2 days before the first exam
        if (today.plusDays(2).equals(firstExamDate)) {
            log.info("It is 2 days before the first exam ({}), triggering auto-assignment...", firstExamDate);
            try {
                enseignantService.assignRandomSessionsToCompleteCharge();
                log.info("Auto-assignment completed successfully.");
            } catch (Exception e) {
                log.error("Error during auto-assignment: {}", e.getMessage());
            }
        } else {
            log.info("Not time yet. First exam is on {}", firstExamDate);
        }
    }
}
