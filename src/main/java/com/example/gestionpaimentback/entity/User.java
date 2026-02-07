package com.example.gestionpaimentback.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users", uniqueConstraints = {
        @UniqueConstraint(columnNames = "email")
})
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(name = "first_name")
    private String firstName;

    @NotBlank
    @Size(max = 50)
    @Column(name = "last_name")
    private String lastName;

    @NotBlank
    @Size(max = 100)
    @Email
    private String email;

    @NotBlank
    @Size(min = 6)
    private String password;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "status", nullable = false)
    private Integer status = 0;

    @Size(min = 8, max = 8, message = "Le CIN doit contenir exactement 8 chiffres")
    @Pattern(regexp = "^[0-9]{8}$", message = "Le CIN doit contenir uniquement des chiffres")
    @Column(name = "cin", length = 8)
    private String cin;

    @Size(min = 20, max = 20, message = "Le RIB doit contenir exactement 20 chiffres")
    @Pattern(regexp = "^[0-9]{20}$", message = "Le RIB doit contenir uniquement des chiffres")
    @Column(name = "rib", length = 20)
    private String rib;

    @Size(max = 100)
    @Column(name = "bank_name")
    private String bankName;



    // NOUVEAU CHAMP FONCTIONNALITE
    @Size(max = 100)
    @Column(name = "fonctionnalite")
    private String fonctionnalite;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id"))
    private Set<Role> roles = new HashSet<>();


    @ManyToMany(mappedBy = "formateurs")
    private Set<Session> sessions = new HashSet<>();
    // Constructeurs
    public User() {}

    public User(String firstName, String lastName, String email, String password) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
        this.createdAt = LocalDateTime.now();
        this.status = 0;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public Integer getStatus() { return status; }
    public void setStatus(Integer status) { this.status = status; }

    public String getCin() { return cin; }
    public void setCin(String cin) { this.cin = cin; }

    public String getRib() { return rib; }
    public void setRib(String rib) { this.rib = rib; }

    public String getBankName() { return bankName; }
    public void setBankName(String bankName) { this.bankName = bankName; }


    // NOUVEAU GETTER/SETTER FONCTIONNALITE
    public String getFonctionnalite() { return fonctionnalite; }
    public void setFonctionnalite(String fonctionnalite) { this.fonctionnalite = fonctionnalite; }

    public Set<Role> getRoles() { return roles; }
    public void setRoles(Set<Role> roles) { this.roles = roles; }
    public Set<Session> getSessions() { return sessions; }
    public void setSessions(Set<Session> sessions) { this.sessions = sessions; }
}