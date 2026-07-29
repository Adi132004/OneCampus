package com.OneCampus.identity.entity;

import com.OneCampus.identity.entity.Campus;
import jakarta.persistence.*;
import java.util.UUID;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String passwordHash;

    @ManyToOne
    @JoinColumn(name = "campus_id", nullable = false)
    private Campus campus;

    protected User() {
        // JPA
    }

    public User(String name, String email, String passwordHash, Campus campus) {
        this.name = name;
        this.email = email;
        this.passwordHash = passwordHash;
        this.campus = campus;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public Campus getCampus() {
        return campus;
    }
}
