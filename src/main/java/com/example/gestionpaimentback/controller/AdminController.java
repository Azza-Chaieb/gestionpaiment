package com.example.gestionpaimentback.controller;

import com.example.gestionpaimentback.entity.Role;
import com.example.gestionpaimentback.entity.User;
import com.example.gestionpaimentback.service.AdminService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }
    @GetMapping("/users")
    public List<User> getAllUsers() {
        return adminService.getAllUsers();
    }


    @GetMapping("/formateurs")
    public ResponseEntity<?> getFormateurs() {
        try {
            System.out.println("=== 🚀 GET /admin/formateurs ===");

            List<User> formateurs = adminService.getFormateurs();

            System.out.println("📊 " + formateurs.size() + " formateurs trouvés dans le controller");

            // 🔥 LOG DÉTAILLÉ
            for (User formateur : formateurs) {
                System.out.println("👨‍🏫 Formateur: " + formateur.getId() + " - " +
                        formateur.getFirstName() + " " + formateur.getLastName() +
                        " - " + formateur.getEmail());

                // Afficher les rôles
                if (formateur.getRoles() != null) {
                    System.out.println("   Rôles: " + formateur.getRoles().size());
                    for (Role role : formateur.getRoles()) {
                        System.out.println("   - " + role.getName());
                    }
                } else {
                    System.out.println("   ❌ Aucun rôle trouvé");
                }
            }

            // 🔥 FORMATER les données pour le frontend
            List<Map<String, Object>> formattedFormateurs = formateurs.stream().map(formateur -> {
                Map<String, Object> formateurMap = new HashMap<>();
                formateurMap.put("id", formateur.getId());
                formateurMap.put("firstName", formateur.getFirstName());
                formateurMap.put("lastName", formateur.getLastName());
                formateurMap.put("email", formateur.getEmail());

                // Inclure les rôles
                if (formateur.getRoles() != null) {
                    List<String> roles = formateur.getRoles().stream()
                            .map(role -> role.getName().name())
                            .collect(Collectors.toList());
                    formateurMap.put("roles", roles);
                } else {
                    formateurMap.put("roles", List.of());
                }

                return formateurMap;
            }).collect(Collectors.toList());

            System.out.println("📤 Envoi de " + formattedFormateurs.size() + " formateurs formatés");
            System.out.println("=== ✅ FIN GET /admin/formateurs ===");

            return new ResponseEntity<>(formattedFormateurs, HttpStatus.OK);

        } catch (Exception e) {
            System.out.println("❌ ERREUR GET FORMATEURS: " + e.getMessage());
            e.printStackTrace();
            return new ResponseEntity<>(null, HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @GetMapping("/coordinateurs")
    public List<User> getCoordinateurs() {
        return adminService.getCoordinateurs();
    }

    @DeleteMapping("/users/{id}")
    public String deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return "Utilisateur supprimé avec succès";
    }

}
