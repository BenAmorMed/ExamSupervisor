package com.example.demo.entites;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = "surveillants")
@EqualsAndHashCode(of = { "date", "heureDebut", "heureFin" })
public class SessionExamen {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDate date;
    private LocalTime heureDebut;
    private LocalTime heureFin;

    @ElementCollection
    @CollectionTable(name = "session_salles", joinColumns = @JoinColumn(name = "session_id"))
    @Column(name = "salle")
    private Set<String> salles = new HashSet<>();

    private int maxSurveillants;
    @OneToMany
    @JoinTable(name = "session_matieres", joinColumns = @JoinColumn(name = "session_id"), inverseJoinColumns = @JoinColumn(name = "matiere_id"))
    private Set<Matiere> matieres = new HashSet<>();

    @ManyToMany
    @JoinTable(name = "session_surveillant", joinColumns = @JoinColumn(name = "session_id"), inverseJoinColumns = @JoinColumn(name = "enseignant_id"))
    private Set<Enseignant> surveillants = new HashSet<>();

    // utilitaires
    public boolean estDisponible() {
        return surveillants.size() < maxSurveillants;
    }

    public int placesRestantes() {
        return maxSurveillants - surveillants.size();
    }
    public void addSuerveillant(Enseignant e) {
    	this.surveillants.add(e);
    	e.getSurveillances().add(this);
    }

    // helper pour vérifier overlap temporel (simple)
    public boolean overlapWith(LocalDate otherDate, LocalTime otherStart, LocalTime otherEnd) {
        if (!this.date.equals(otherDate))
            return false;
        // overlap if start < otherEnd && otherStart < end
        return this.heureDebut.isBefore(otherEnd) && otherStart.isBefore(this.heureFin);
    }

}
