package com.example.demo.entites;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@ToString(exclude = {"matieres", "surveillances"})
@EqualsAndHashCode(of = "email")
public class Enseignant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    
    @ManyToOne
    private Grade grade;

    @ManyToMany
    @JoinTable(
        name = "enseignant_matiere",
        joinColumns = @JoinColumn(name = "enseignant_id"),
        inverseJoinColumns = @JoinColumn(name = "matiere_id")
    )
    private Set<Matiere> matieres = new HashSet<>();
    // sessions où il est surveillant (ManyToMany with SessionExamen)
    @ManyToMany(mappedBy = "surveillants")
    private Set<SessionExamen> surveillances = new HashSet<>();
    public double getCharge(){
    	
    	return grade.getChargeH()*1.5-matieres.size();
    }
    public long calculeHoursSelcted() {
  	  long totalMinutes = 0;

  	    for (SessionExamen session : surveillances) {
  	        long minutes = java.time.Duration.between(session.getHeureDebut(), session.getHeureFin()).toMinutes();
  	        totalMinutes += minutes;
  	    }

  	    return totalMinutes;
  }
  public Boolean isFullCharge() {
  	  long chosenMinutes = calculeHoursSelcted();
  	    long chargeMinutes = this.grade.getChargeH() * 60L;

  	    return chosenMinutes >= chargeMinutes;
  }

    

    
}
