package com.example.gestionpaimentback.entity;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "sessions")
public class Session {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long idSession;

    private String classe;
    private String specialite;
    private String promotion;
    private String niveau;
    private String semestre;
    private LocalDate dateD;
    private LocalDate dateF;

    // 🔥 CORRECTION : Chargement EAGER obligatoire
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "session_formateurs",
            joinColumns = @JoinColumn(name = "session_id"),
            inverseJoinColumns = @JoinColumn(name = "formateur_id")
    )
    private Set<User> formateurs = new HashSet<>();

    // Constructeurs
    public Session() {}

    public Session(Long idSession, String classe, String specialite, String promotion,
                   String niveau, String semestre, LocalDate dateD, LocalDate dateF) {
        this.idSession = idSession;
        this.classe = classe;
        this.specialite = specialite;
        this.promotion = promotion;
        this.niveau = niveau;
        this.semestre = semestre;
        this.dateD = dateD;
        this.dateF = dateF;
    }

    // Getters et Setters
    public Long getIdSession() { return idSession; }
    public void setIdSession(Long idSession) { this.idSession = idSession; }

    public String getClasse() { return classe; }
    public void setClasse(String classe) { this.classe = classe; }

    public String getSpecialite() { return specialite; }
    public void setSpecialite(String specialite) { this.specialite = specialite; }

    public String getPromotion() { return promotion; }
    public void setPromotion(String promotion) { this.promotion = promotion; }

    public String getNiveau() { return niveau; }
    public void setNiveau(String niveau) { this.niveau = niveau; }

    public String getSemestre() { return semestre; }
    public void setSemestre(String semestre) { this.semestre = semestre; }

    public LocalDate getDateD() { return dateD; }
    public void setDateD(LocalDate dateD) { this.dateD = dateD; }

    public LocalDate getDateF() { return dateF; }
    public void setDateF(LocalDate dateF) { this.dateF = dateF; }

    public Set<User> getFormateurs() { return formateurs; }
    public void setFormateurs(Set<User> formateurs) { this.formateurs = formateurs; }
}