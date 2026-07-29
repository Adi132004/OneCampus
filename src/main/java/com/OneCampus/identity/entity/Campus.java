package com.OneCampus.identity.entity;
import jakarta.persistence.*;

import java.util.UUID;

@Entity
@Table(name = "campuses")
public class Campus {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    protected Campus() {
        // JPA
    }

    public Campus(UUID id, String name) {
        this.id = id;
        this.name = name;
    }

    public UUID getId() {
        return id;
    }

    public String getName() {
        return name;
    }
}