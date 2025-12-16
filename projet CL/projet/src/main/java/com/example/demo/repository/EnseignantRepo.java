package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entites.Enseignant;

@Repository
public interface EnseignantRepo extends JpaRepository<Enseignant, Long> {
	Enseignant findByEmailAndPassword(String email, String password);

	Enseignant findByNomAndPassword(String nom, String password);

}
