package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.example.demo.entites.SessionExamen;

@Repository

public interface SessionExamenRepo extends JpaRepository<SessionExamen, Long> {

	@Query("""
			SELECT DISTINCT s FROM SessionExamen s
			WHERE SIZE(s.surveillants) < s.maxSurveillants
			AND :enseignantId NOT IN (
			    SELECT surv.id FROM s.surveillants surv
			)
			AND NOT EXISTS (
			    SELECT m FROM s.matieres m
			    JOIN m.enseignants e
			    WHERE e.id = :enseignantId
			)
			""")
			List<SessionExamen> findAvailableSessions(@Param("enseignantId") Long enseignantId);
	
	@Query(
		    value = "SELECT s.* FROM session_examen s " +
		            "JOIN session_matieres sm ON s.id = sm.session_id " +
		            "JOIN enseignant_matiere em ON em.matiere_id = sm.matiere_id " +
		            "WHERE em.enseignant_id = :enseignantId",
		    nativeQuery = true
		)
	List<SessionExamen> findSessionsWithAllTeacherMatieres(@Param("enseignantId") Long enseignantId);
	
	SessionExamen findFirstByOrderByDateAsc();

}
