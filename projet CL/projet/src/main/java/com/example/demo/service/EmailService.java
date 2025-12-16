package com.example.demo.service;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.example.demo.entites.Enseignant;
import com.example.demo.entites.SessionExamen;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    public void sendCalendar(Enseignant teacher) {
        String subject = "Votre calendrier de surveillance d'examen";
        StringBuilder body = new StringBuilder();

        body.append("Bonjour ").append(teacher.getPrenom()).append(" ").append(teacher.getNom()).append(",\n\n");
        body.append("Voici votre calendrier de surveillance mis à jour :\n\n");

        // Sort sessions by date and time
        List<SessionExamen> sessions = teacher.getSurveillances().stream()
                .sorted((s1, s2) -> {
                    int c = s1.getDate().compareTo(s2.getDate());
                    if (c == 0) {
                        return s1.getHeureDebut().compareTo(s2.getHeureDebut());
                    }
                    return c;
                })
                .toList();

        if (sessions.isEmpty()) {
            body.append("Aucune session de surveillance assignée pour le moment.\n");
        } else {
            for (SessionExamen s : sessions) {
                body.append("- Date: ").append(s.getDate())
                        .append(" | Heure: ").append(s.getHeureDebut()).append(" - ").append(s.getHeureFin())
                        .append(" | Salle: ").append(String.join(", ", s.getSalles()))
                        .append("\n");
            }
        }

        body.append("\nCordialement,\nService des Examens");

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom("exam-service@fsegs.tn");
            message.setTo(teacher.getEmail());
            message.setBcc("chef.department@fsegs.tn"); // Send copy to admin
            message.setSubject(subject);
            message.setText(body.toString());

            mailSender.send(message);
            log.info("Email sent successfully to {}", teacher.getEmail());
        } catch (Exception e) {
            log.error("Failed to send email to {}: {}", teacher.getEmail(), e.getMessage());
        }
    }
}
