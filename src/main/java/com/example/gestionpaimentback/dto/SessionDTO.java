package com.example.gestionpaimentback.dto;

import java.time.LocalDate;
import java.util.Set;

public class SessionDTO {
    private Long idSession;
    private String classe;
    private String specialite;
    private String promotion;
    private String niveau;
    private String semestre;
    private LocalDate dateD;
    private LocalDate dateF;
    private Set<FormateurDTO> formateurs;
    private boolean formateurAssigne; // Pour le formateur connecté

    // Constructeurs
    public SessionDTO() {}

    public Long getIdSession() {
        return idSession;
    }

    public void setIdSession(Long idSession) {
        this.idSession = idSession;
    }

    public String getClasse() {
        return classe;
    }

    public void setClasse(String classe) {
        this.classe = classe;
    }

    public String getSpecialite() {
        return specialite;
    }

    public void setSpecialite(String specialite) {
        this.specialite = specialite;
    }

    public String getPromotion() {
        return promotion;
    }

    public void setPromotion(String promotion) {
        this.promotion = promotion;
    }

    public String getNiveau() {
        return niveau;
    }

    public void setNiveau(String niveau) {
        this.niveau = niveau;
    }

    public String getSemestre() {
        return semestre;
    }

    public void setSemestre(String semestre) {
        this.semestre = semestre;
    }

    public LocalDate getDateD() {
        return dateD;
    }

    public void setDateD(LocalDate dateD) {
        this.dateD = dateD;
    }

    public LocalDate getDateF() {
        return dateF;
    }

    public void setDateF(LocalDate dateF) {
        this.dateF = dateF;
    }

    public Set<FormateurDTO> getFormateurs() {
        return formateurs;
    }

    public void setFormateurs(Set<FormateurDTO> formateurs) {
        this.formateurs = formateurs;
    }

    public boolean isFormateurAssigne() {
        return formateurAssigne;
    }

    public void setFormateurAssigne(boolean formateurAssigne) {
        this.formateurAssigne = formateurAssigne;
    }
}

