package com.example.demo.dto;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

import lombok.Data;

@Data
public class SessionExamenDto {
    private Long id;
    private LocalDate date;
    private LocalTime heureDebut;
    private LocalTime heureFin;
    private Set<String> salle=new HashSet<>();
    private Set<String> matieres=new HashSet<>();
    private Set<String> surveillants = new HashSet<>();
    private int maxSurveillants;
    private int surveillantsCount;
   
}
