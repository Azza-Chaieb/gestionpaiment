package com.example.gestionpaimentback.repository;

import com.example.gestionpaimentback.entity.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    // ✅ NOUVEAU : Trouver les sessions d'un formateur
    @Query("SELECT s FROM Session s JOIN s.formateurs f WHERE f.id = :formateurId")
    List<Session> findByFormateurId(@Param("formateurId") Long formateurId);

    // ✅ NOUVEAU : Vérifier si un formateur est déjà assigné à une session
    @Query("SELECT CASE WHEN COUNT(s) > 0 THEN true ELSE false END " +
            "FROM Session s JOIN s.formateurs f WHERE s.id = :sessionId AND f.id = :formateurId")
    boolean isFormateurInSession(@Param("sessionId") Long sessionId, @Param("formateurId") Long formateurId);
}
