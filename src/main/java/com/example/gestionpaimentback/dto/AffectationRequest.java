package com.example.gestionpaimentback.dto;


public class AffectationRequest {
    private Long formateurId;

    // Constructeurs
    public AffectationRequest() {}

    public AffectationRequest(Long formateurId) {
        this.formateurId = formateurId;
    }

    // Getters et Setters
    public Long getFormateurId() {
        return formateurId;
    }

    public void setFormateurId(Long formateurId) {
        this.formateurId = formateurId;
    }
}


