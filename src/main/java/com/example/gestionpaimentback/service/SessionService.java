package com.example.gestionpaimentback.service;

import com.example.gestionpaimentback.entity.Session;
import com.example.gestionpaimentback.entity.User;
import com.example.gestionpaimentback.repository.SessionRepository;

import com.example.gestionpaimentback.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class SessionService {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private UserRepository userRepository;


    public Session createSession(Session session) {
        return sessionRepository.save(session);
    }


    public List<Session> getAllSessions() {
        return sessionRepository.findAll();
    }

    public Session getSessionById(Long id) {
        Optional<Session> session = sessionRepository.findById(id);
        if (session.isPresent()) {
            return session.get();
        } else {
            throw new RuntimeException("Session non trouvée avec l'ID: " + id);
        }
    }


    public Session updateSession(Long id, Session sessionDetails) {
        Session session = getSessionById(id);

        session.setClasse(sessionDetails.getClasse());
        session.setSpecialite(sessionDetails.getSpecialite());
        session.setPromotion(sessionDetails.getPromotion());
        session.setNiveau(sessionDetails.getNiveau());
        session.setSemestre(sessionDetails.getSemestre());
        session.setDateD(sessionDetails.getDateD());
        session.setDateF(sessionDetails.getDateF());

        return sessionRepository.save(session);
    }

    public void deleteSession(Long id) {
        Session session = getSessionById(id);
        sessionRepository.delete(session);
    }


    public List<Session> getSessionsByFormateur(Long formateurId) {
        try {
            System.out.println("🔍 Recherche sessions pour formateur: " + formateurId);

            List<Session> sessions = sessionRepository.findByFormateurId(formateurId);

            System.out.println("✅ " + sessions.size() + " sessions trouvées pour formateur " + formateurId);

            // Log des sessions trouvées
            for (Session session : sessions) {
                System.out.println("📋 Session " + session.getIdSession() + ": " + session.getClasse() +
                        " - Formateurs: " + session.getFormateurs().size());
            }

            return sessions;
        } catch (Exception e) {
            System.out.println("❌ Erreur getSessionsByFormateur: " + e.getMessage());
            throw e;
        }
    }

    public Session assignerFormateur(Long sessionId, Long formateurId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session non trouvée"));

        // Ajouter le formateur à la session (relation ManyToMany)
        User formateur = userRepository.findById(formateurId)
                .orElseThrow(() -> new RuntimeException("Formateur non trouvé"));

        session.getFormateurs().add(formateur);
        return sessionRepository.save(session);
    }

    public Session retirerFormateur(Long sessionId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session non trouvée"));

        // Vider la liste des formateurs
        session.getFormateurs().clear();
        return sessionRepository.save(session);
    }


    public Session retirerFormateur(Long sessionId, Long formateurId) {
        Session session = getSessionById(sessionId);
        Optional<User> formateurOpt = userRepository.findById(formateurId);

        if (formateurOpt.isPresent()) {
            User formateur = formateurOpt.get();

            if (!session.getFormateurs().contains(formateur)) {
                throw new RuntimeException("Le formateur n'est pas assigné à cette session");
            }

            session.getFormateurs().remove(formateur);
            return sessionRepository.save(session);
        } else {
            throw new RuntimeException("Formateur non trouvé avec l'ID: " + formateurId);
        }
    }


    public boolean isFormateurInSession(Long sessionId, Long formateurId) {
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session non trouvée"));

        return session.getFormateurs().stream()
                .anyMatch(formateur -> formateur.getId().equals(formateurId));
    }
}