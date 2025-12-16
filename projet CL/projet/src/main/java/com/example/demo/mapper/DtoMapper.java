package com.example.demo.mapper;

import java.util.stream.Collectors;

import com.example.demo.dto.EnseignantDto;
import com.example.demo.dto.SessionExamenDto;
import com.example.demo.entites.Enseignant;
import com.example.demo.entites.Matiere;
import com.example.demo.entites.SessionExamen;

public class DtoMapper {

    public static EnseignantDto toEnseignantDto(Enseignant e) {
        EnseignantDto dto = new EnseignantDto();
        dto.setId(e.getId());
        dto.setPrenom(e.getPrenom());
        dto.setNom(e.getNom());
        dto.setEmail(e.getEmail());
        dto.setGrade(e.getGrade().getNom());
        dto.setGradeCharge(e.getGrade().getChargeH());
        dto.setCharge(e.getCharge());
        dto.getMatieres().addAll(
                e.getMatieres().stream()
                        .map(Matiere::getNom)
                        .collect(Collectors.toSet()));
        dto.setActuelHoursSelected(e.calculeHoursSelcted());
        dto.setIsFull(e.isFullCharge());

        return dto;
    }

    public static SessionExamenDto toSessionDto(SessionExamen s) {
        SessionExamenDto dto = new SessionExamenDto();
        dto.setId(s.getId());
        dto.setDate(s.getDate());
        dto.setHeureDebut(s.getHeureDebut());
        dto.setHeureFin(s.getHeureFin());

        dto.getSalle().addAll(s.getSalles());

        // نسخ أسماء المواد فقط
        dto.getMatieres().addAll(
                s.getMatieres().stream()
                        .map(e -> e.getNom())
                        .collect(Collectors.toSet()));

        dto.setMaxSurveillants(s.getMaxSurveillants());
        dto.setSurveillantsCount(s.getSurveillants().size());
        dto.getSurveillants().addAll(
                s.getSurveillants().stream()
                        .map(ens -> ens.getNom() + " " + ens.getPrenom())
                        .collect(Collectors.toSet()));

        return dto;
    }

}
