package com.example.gestionpaimentback.service;

import com.example.gestionpaimentback.entity.Role;
import com.example.gestionpaimentback.entity.User;
import com.example.gestionpaimentback.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            System.out.println("✅ " + users.size() + " utilisateurs trouvés");
            return users;
        } catch (Exception e) {
            System.out.println("❌ Erreur dans getAllUsers: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public List<User> getFormateurs() {
        try {
            // Méthode 1: Via le repository avec une requête personnalisée
            List<User> formateurs = userRepository.findByRoles_Name(Role.ERole.ROLE_FORMATEUR);

            // Si la méthode 1 ne fonctionne pas, utilisez la méthode 2
            if (formateurs == null || formateurs.isEmpty()) {
                System.out.println("🔄 Méthode 1 échouée, utilisation méthode 2...");

                // Méthode 2: Filtrer manuellement
                List<User> allUsers = userRepository.findAll();
                formateurs = allUsers.stream()
                        .filter(user -> user.getRoles().stream()
                                .anyMatch(role -> role.getName() == Role.ERole.ROLE_FORMATEUR))
                        .collect(Collectors.toList());
            }

            System.out.println("✅ " + formateurs.size() + " formateurs trouvés dans le service");

            // Debug: afficher les formateurs
            for (User formateur : formateurs) {
                System.out.println("👨‍🏫 Formateur: " + formateur.getFirstName() + " " + formateur.getLastName() +
                        " - " + formateur.getEmail() + " - ID: " + formateur.getId());
            }

            return formateurs;
        } catch (Exception e) {
            System.out.println("❌ Erreur dans getFormateurs: " + e.getMessage());
            e.printStackTrace();
            return new ArrayList<>();
        }
    }

    public List<User> getCoordinateurs() {
        try {
            // Méthode 1: Via le repository avec une requête personnalisée
            List<User> coordinateurs = userRepository.findByRoles_Name(Role.ERole.ROLE_COORDINATEUR);

            // Si la méthode 1 ne fonctionne pas, utilisez la méthode 2
            if (coordinateurs == null || coordinateurs.isEmpty()) {
                System.out.println("🔄 Méthode 1 échouée, utilisation méthode 2...");

                // Méthode 2: Filtrer manuellement
                List<User> allUsers = userRepository.findAll();
                coordinateurs = allUsers.stream()
                        .filter(user -> user.getRoles().stream()
                                .anyMatch(role -> role.getName() == Role.ERole.ROLE_COORDINATEUR))
                        .collect(Collectors.toList());
            }

            System.out.println("✅ " + coordinateurs.size() + " coordinateurs trouvés dans le service");
            return coordinateurs;
        } catch (Exception e) {
            System.out.println("❌ Erreur dans getCoordinateurs: " + e.getMessage());
            return new ArrayList<>();
        }
    }

    public void deleteUser(Long id) {
        try {
            if (userRepository.existsById(id)) {
                userRepository.deleteById(id);
                System.out.println("✅ Utilisateur " + id + " supprimé avec succès");
            } else {
                System.out.println("❌ Utilisateur " + id + " non trouvé");
                throw new RuntimeException("Utilisateur non trouvé");
            }
        } catch (Exception e) {
            System.out.println("❌ Erreur dans deleteUser: " + e.getMessage());
            throw new RuntimeException("Erreur lors de la suppression: " + e.getMessage());
        }
    }
}