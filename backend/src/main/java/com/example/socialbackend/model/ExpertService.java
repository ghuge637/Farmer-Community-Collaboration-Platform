package com.example.socialbackend.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "expert_service")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExpertService {
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public User getExpert() { return expert; }
        public void setExpert(User expert) { this.expert = expert; }
        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Mode getMode() { return mode; }
        public void setMode(Mode mode) { this.mode = mode; }
        public String getDuration() { return duration; }
        public void setDuration(String duration) { this.duration = duration; }
        public String getPrice() { return price; }
        public void setPrice(String price) { this.price = price; }
        public String getContactPhone() { return contactPhone; }
        public void setContactPhone(String contactPhone) { this.contactPhone = contactPhone; }
        public String getContactWhatsApp() { return contactWhatsApp; }
        public void setContactWhatsApp(String contactWhatsApp) { this.contactWhatsApp = contactWhatsApp; }
        public String getContactEmail() { return contactEmail; }
        public void setContactEmail(String contactEmail) { this.contactEmail = contactEmail; }
        public boolean isEnabled() { return enabled; }
        public void setEnabled(boolean enabled) { this.enabled = enabled; }
        public ServiceType getServiceType() { return serviceType; }
        public void setServiceType(ServiceType serviceType) { this.serviceType = serviceType; }
    public enum Mode { ONLINE, OFFLINE, FIELD }
    public enum ServiceType { COURSE }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expert_id", referencedColumnName = "id", nullable = false)
    private User expert;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Mode mode;

    private String duration;
    private String price;
    private String contactPhone;
    private String contactWhatsApp;
    private String contactEmail;
    private boolean enabled = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ServiceType serviceType = ServiceType.COURSE;
}
