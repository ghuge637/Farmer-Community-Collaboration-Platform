package com.example.socialbackend.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "schemes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Scheme {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(name = "title_mr")
    private String titleMr;

    @Column(nullable = false)
    private String category; // DIRECT_BENEFIT, SOLAR_POWER, CROP_INSURANCE, IRRIGATION, MACHINERY, CREDIT_WAIVER

    @Column(nullable = false)
    private String level; // CENTRAL, STATE

    @Column(name = "subsidy_amount")
    private String subsidyAmount;

    @Column(length = 2000)
    private String description;

    @Column(name = "description_mr", length = 2000)
    private String descriptionMr;

    @Column(name = "eligibility_criteria", length = 1000)
    private String eligibilityCriteria;

    @Column(name = "required_documents", length = 1000)
    private String requiredDocuments;

    @Column(name = "portal_url")
    private String portalUrl;

    @Column(name = "max_land_acres")
    private Double maxLandAcres;

    @Column(name = "is_new")
    private Boolean isNew = true;

    @Column(name = "created_at")
    private Instant createdAt = Instant.now();

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getTitleMr() { return titleMr; }
    public void setTitleMr(String titleMr) { this.titleMr = titleMr; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getSubsidyAmount() { return subsidyAmount; }
    public void setSubsidyAmount(String subsidyAmount) { this.subsidyAmount = subsidyAmount; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getDescriptionMr() { return descriptionMr; }
    public void setDescriptionMr(String descriptionMr) { this.descriptionMr = descriptionMr; }

    public String getEligibilityCriteria() { return eligibilityCriteria; }
    public void setEligibilityCriteria(String eligibilityCriteria) { this.eligibilityCriteria = eligibilityCriteria; }

    public String getRequiredDocuments() { return requiredDocuments; }
    public void setRequiredDocuments(String requiredDocuments) { this.requiredDocuments = requiredDocuments; }

    public String getPortalUrl() { return portalUrl; }
    public void setPortalUrl(String portalUrl) { this.portalUrl = portalUrl; }

    public Double getMaxLandAcres() { return maxLandAcres; }
    public void setMaxLandAcres(Double maxLandAcres) { this.maxLandAcres = maxLandAcres; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
