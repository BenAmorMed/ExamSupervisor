package com.example.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.entites.Grade;
import com.example.demo.repository.GradeRepo;

@Component
public class DataFixer implements CommandLineRunner {

    private final GradeRepo gradeRepo;

    public DataFixer(GradeRepo gradeRepo) {
        this.gradeRepo = gradeRepo;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        System.out.println("--- STARTING DATA FIXER ---");

        updateGrade(1L, 10); // Professeur
        updateGrade(2L, 8); // Maître de conférences
        updateGrade(3L, 6); // Maître assistant
        updateGrade(4L, 4); // Assistant

        System.out.println("--- DATA FIXER COMPLETED ---");
    }

    private void updateGrade(Long id, int charge) {
        Grade g = gradeRepo.findById(id).orElse(null);
        if (g != null) {
            g.setChargeH(charge);
            gradeRepo.save(g);
            System.out.println("Updated Grade " + id + " to " + charge + "h");
        } else {
            System.out.println("Grade " + id + " not found!");
        }
    }
}
