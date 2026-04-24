package com.psi2026.proiect.model;

import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;

@MappedSuperclass // Important: ii spune lui Spring ca NU e tabel separat, ci este mostenita
public abstract class AbstractEntity {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // ID-ul creste automat (1, 2, 3...)
    private Long id;

    // Gettere si settere
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }
}