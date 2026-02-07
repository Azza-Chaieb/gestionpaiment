package com.example.gestionpaimentback.controller;

import com.example.gestionpaimentback.entity.Session;
import com.example.gestionpaimentback.service.SessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sessions")
@CrossOrigin(origins = "*")
public class SessionController {

    @Autowired
    private SessionService sessionService;

    // ✅ GET - Récupérer toutes les sessions AVEC FORMATEURS
    @GetMapping
    public ResponseEntity<?> getAllSessions() {
        try {
            System.out.println("=== 🚀 GET ALL SESSIONS ===");

            List<Session> sessions = sessionService.getAllSessions();

            System.out.println("📊 " + sessions.size() + " sessions trouvées");

            // 🔥 CORRECTION : Formater les données pour inclure les formateurs
            List<Map<String, Object>> formattedSessions = sessions.stream().map(session -> {
                Map<String, Object> sessionMap = new HashMap<>();
                sessionMap.put("idSession", session.getIdSession());
                sessionMap.put("classe", session.getClasse());
                sessionMap.put("specialite", session.getSpecialite());
                sessionMap.put("promotion", session.getPromotion());
                sessionMap.put("niveau", session.getNiveau());
                sessionMap.put("semestre", session.getSemestre());
                sessionMap.put("dateD", session.getDateD() != null ? session.getDateD().toString() : null);
                sessionMap.put("dateF", session.getDateF() != null ? session.getDateF().toString() : null);

                // 🔥 CORRECTION : Inclure les formateurs
                if (session.getFormateurs() != null) {
                    List<Map<String, Object>> formateursList = session.getFormateurs().stream().map(formateur -> {
                        Map<String, Object> formateurMap = new HashMap<>();
                        formateurMap.put("id", formateur.getId());
                        formateurMap.put("firstName", formateur.getFirstName());
                        formateurMap.put("lastName", formateur.getLastName());
                        formateurMap.put("email", formateur.getEmail());
                        return formateurMap;
                    }).collect(Collectors.toList());
                    sessionMap.put("formateurs", formateursList);

                    System.out.println("📋 Session " + session.getIdSession() + " - " + session.getClasse() +
                            " a " + formateursList.size() + " formateur(s)");
                } else {
                    sessionMap.put("formateurs", List.of());
                    System.out.println("📋 Session " + session.getIdSession() + " - " + session.getClasse() + " a 0 formateur");
                }

                return sessionMap;
            }).collect(Collectors.toList());

            System.out.println("=== ✅ FIN GET ALL SESSIONS ===");
            return new ResponseEntity<>(formattedSessions, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("❌ ERREUR GET ALL SESSIONS: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ GET - Récupérer une session par ID
    @GetMapping("/{id}")
    public ResponseEntity<Session> getSessionById(@PathVariable Long id) {
        try {
            Session session = sessionService.getSessionById(id);
            return new ResponseEntity<>(session, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ POST - Créer une nouvelle session
    @PostMapping
    public ResponseEntity<?> createSession(@RequestBody Map<String, Object> sessionData) {
        try {
            System.out.println("📥 Données reçues pour création session: " + sessionData);

            Session session = new Session();
            session.setClasse((String) sessionData.get("classe"));
            session.setSpecialite((String) sessionData.get("specialite"));
            session.setPromotion((String) sessionData.get("promotion"));
            session.setNiveau((String) sessionData.get("niveau"));
            session.setSemestre((String) sessionData.get("semestre"));
            session.setDateD(java.time.LocalDate.parse((String) sessionData.get("dateD")));
            session.setDateF(java.time.LocalDate.parse((String) sessionData.get("dateF")));

            Session newSession = sessionService.createSession(session);
            System.out.println("✅ Session créée avec ID: " + newSession.getIdSession());

            return new ResponseEntity<>(newSession, HttpStatus.CREATED);
        } catch (Exception e) {
            System.out.println("❌ Erreur création session: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ PUT - Modifier une session
    @PutMapping("/{id}")
    public ResponseEntity<Session> updateSession(@PathVariable Long id, @RequestBody Session sessionDetails) {
        try {
            Session updatedSession = sessionService.updateSession(id, sessionDetails);
            return new ResponseEntity<>(updatedSession, HttpStatus.OK);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(null, HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ DELETE - Supprimer une session
    @DeleteMapping("/{id}")
    public ResponseEntity<HttpStatus> deleteSession(@PathVariable Long id) {
        try {
            sessionService.deleteSession(id);
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } catch (RuntimeException e) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        } catch (Exception e) {
            return new ResponseEntity<>(HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ GET - Récupérer les sessions d'un formateur
    // ✅ GET - Récupérer les sessions d'un formateur
    @GetMapping("/formateur/{formateurId}")
    public ResponseEntity<?> getSessionsByFormateur(@PathVariable Long formateurId) {
        try {
            System.out.println("📥 Récupération sessions pour formateur: " + formateurId);

            List<Session> sessions = sessionService.getSessionsByFormateur(formateurId);

            System.out.println("📋 " + sessions.size() + " sessions trouvées pour formateur " + formateurId);

            // Formater les données pour le frontend
            List<Map<String, Object>> formattedSessions = sessions.stream().map(session -> {
                Map<String, Object> sessionMap = new HashMap<>();
                sessionMap.put("idSession", session.getIdSession());
                sessionMap.put("classe", session.getClasse());
                sessionMap.put("specialite", session.getSpecialite());
                sessionMap.put("promotion", session.getPromotion());
                sessionMap.put("niveau", session.getNiveau());
                sessionMap.put("semestre", session.getSemestre());
                sessionMap.put("dateD", session.getDateD() != null ? session.getDateD().toString() : null);
                sessionMap.put("dateF", session.getDateF() != null ? session.getDateF().toString() : null);

                return sessionMap;
            }).collect(Collectors.toList());

            return new ResponseEntity<>(formattedSessions, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("❌ Erreur récupération sessions formateur: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ POST - Assigner un formateur à une session
    @PostMapping("/{sessionId}/affecter")
    public ResponseEntity<?> affecterFormateur(
            @PathVariable Long sessionId,
            @RequestBody Map<String, Long> request) {
        try {
            Long formateurId = request.get("formateurId");
            System.out.println("🎯 Affectation session " + sessionId + " -> formateur " + formateurId);

            Session session = sessionService.assignerFormateur(sessionId, formateurId);

            System.out.println("✅ Formateur affecté avec succès");
            return new ResponseEntity<>(session, HttpStatus.OK);
        } catch (RuntimeException e) {
            System.out.println("❌ Erreur affectation: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.out.println("❌ Erreur serveur affectation: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ DELETE - Retirer un formateur d'une session
    @DeleteMapping("/{sessionId}/retirer/{formateurId}")
    public ResponseEntity<?> retirerFormateur(
            @PathVariable Long sessionId,
            @PathVariable Long formateurId) {
        try {
            System.out.println("🗑️ Retrait formateur " + formateurId + " de session " + sessionId);

            Session session = sessionService.retirerFormateur(sessionId, formateurId);

            System.out.println("✅ Formateur retiré avec succès");
            return new ResponseEntity<>(session, HttpStatus.OK);
        } catch (RuntimeException e) {
            System.out.println("❌ Erreur retrait: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.BAD_REQUEST);
        } catch (Exception e) {
            System.out.println("❌ Erreur serveur retrait: " + e.getMessage());
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    // ✅ GET - Vérifier si un formateur est dans une session
    @GetMapping("/{sessionId}/check-formateur/{formateurId}")
    public ResponseEntity<Boolean> isFormateurInSession(@PathVariable Long sessionId, @PathVariable Long formateurId) {
        try {
            boolean isInSession = sessionService.isFormateurInSession(sessionId, formateurId);
            System.out.println("🔍 Formateur " + formateurId + " dans session " + sessionId + ": " + isInSession);
            return new ResponseEntity<>(isInSession, HttpStatus.OK);
        } catch (Exception e) {
            System.out.println("❌ Erreur vérification formateur: " + e.getMessage());
            return new ResponseEntity<>(false, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}