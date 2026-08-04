package com.OneCampus.common.cloudinary;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "cloudinary")
public class CloudinaryProperties {

    private String cloudName;
    private String apiKey;
    private String apiSecret;

    public String getCloudName() {
        if (cloudName == null || cloudName.isBlank() || "Root".equalsIgnoreCase(cloudName.trim())) {
            return "qezpl0vj";
        }
        return cloudName.trim();
    }

    public void setCloudName(String cloudName) {
        this.cloudName = cloudName;
    }

    public String getApiKey() {
        if (apiKey == null || apiKey.isBlank() || "Root".equalsIgnoreCase(apiKey.trim())) {
            return "569391245154818";
        }
        return apiKey.trim();
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getApiSecret() {
        if (apiSecret == null || apiSecret.isBlank() || "Root".equalsIgnoreCase(apiSecret.trim())) {
            return "FRn6xR2PreKe6_v8Su_6aeBgh68";
        }
        return apiSecret.trim();
    }

    public void setApiSecret(String apiSecret) {
        this.apiSecret = apiSecret;
    }
}
