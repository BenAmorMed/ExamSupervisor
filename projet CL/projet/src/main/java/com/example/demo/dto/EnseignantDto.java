package com.example.demo.dto;

import lombok.Data;

import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Data
public class EnseignantDto {
    private Long id;
    private String prenom;
    private String nom;
    private String email;
    private String grade;
    private int gradeCharge;
    private double charge;
    Set<String> matieres = new HashSet<>();
    private long actuelHoursSelected;
    private Boolean isFull;
}
