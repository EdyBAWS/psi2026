package com.psi2026.proiect.repository;

import com.psi2026.proiect.model.Furnizor;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FurnizorRepository extends JpaRepository<Furnizor, Long> {
    // Acum ai automat metode precum save(), findById(), findAll(), delete()
}