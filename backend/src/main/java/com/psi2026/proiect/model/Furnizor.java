package com.psi2026.proiect.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;

@Entity // Ii spune lui Spring sa creeze un tabel "Furnizor" in baza de date
public class Furnizor extends AbstractEntity {

    @Column(unique = true)
    private String cod;
    
    private String nume;
    private String adresa;
    private String CUI;
    private String banca;
    private String contBancar;
    private Double sold = 0.0; // Valoare default

    // Generam Gettere si Settere.
    // Daca ai bifat "Lombok" cand ai generat proiectul, poti sterge getterele 
    // de mai jos si sa pui pur si simplu adnotarea @Data deasupra clasei.
    
    public String getCod() { return cod; }
    public void setCod(String cod) { this cod = cod; }

    public String getNume() { return nume; }
    public void setNume(String nume) { this.nume = nume; }

    public String getAdresa() { return adresa; }
    public void setAdresa(String adresa) { this.adresa = adresa; }

    public String getCUI() { return CUI; }
    public void setCUI(String CUI) { this.CUI = CUI; }

    public String getBanca() { return banca; }
    public void setBanca(String banca) { this.banca = banca; }

    public String getContBancar() { return contBancar; }
    public void setContBancar(String contBancar) { this.contBancar = contBancar; }

    public Double getSold() { return sold; }
    public void setSold(Double sold) { this.sold = sold; }
}