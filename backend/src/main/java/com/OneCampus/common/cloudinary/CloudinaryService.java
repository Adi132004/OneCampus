package com.OneCampus.common.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;

    public CloudinaryService(CloudinaryProperties properties) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", properties.getCloudName(),
                "api_key", properties.getApiKey(),
                "api_secret", properties.getApiSecret()
        ));
    }

    /**
     * Uploads a remote image URL to Cloudinary and returns the secure URL.
     */
    public String uploadRemoteImage(String imageUrl) throws Exception {
        if (imageUrl == null || imageUrl.isBlank()) return null;
        Map options = ObjectUtils.asMap("resource_type", "auto");
        @SuppressWarnings("unchecked")
        Map result = cloudinary.uploader().upload(imageUrl, options);
        return (String) result.get("secure_url");
    }

    public String uploadFile(org.springframework.web.multipart.MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) return null;
        Map options = ObjectUtils.asMap("resource_type", "auto");
        @SuppressWarnings("unchecked")
        Map result = cloudinary.uploader().upload(file.getBytes(), options);
        return (String) result.get("secure_url");
    }
}
