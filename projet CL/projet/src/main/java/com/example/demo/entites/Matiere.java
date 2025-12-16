package com.example.demo.entites;

import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "enseignants")
@EqualsAndHashCode(of = "nom")
public class Matiere {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String nom;

    // liste des enseignants qui enseignent cette matière
    @JsonIgnore
    @ManyToMany(mappedBy = "matieres")
    private Set<Enseignant> enseignants = new HashSet<>();

}
