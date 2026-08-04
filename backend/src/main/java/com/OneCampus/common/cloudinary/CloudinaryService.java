package com.OneCampus.common.cloudinary;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Service
public class CloudinaryService {

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"
    );
    private static final long MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    private final Cloudinary cloudinary;

    public CloudinaryService(CloudinaryProperties properties) {
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", properties.getCloudName(),
                "api_key",    properties.getApiKey(),
                "api_secret", properties.getApiSecret()
        ));
    }

    /**
     * Uploads a remote image URL to Cloudinary and returns the secure URL.
     */
    public String uploadRemoteImage(String imageUrl) throws Exception {
        if (imageUrl == null || imageUrl.isBlank()) return null;
        Map<?, ?> options = ObjectUtils.asMap("resource_type", "auto");
        @SuppressWarnings("unchecked")
        Map<String, Object> result = (Map<String, Object>) cloudinary.uploader().upload(imageUrl, options);
        return (String) result.get("secure_url");
    }

    /**
     * Uploads a {@link MultipartFile} to Cloudinary and returns its HTTPS secure_url.
     *
     * <p>Validates content-type and file size before making the network call so
     * misconfigured clients get a clear {@link IllegalArgumentException} rather
     * than a cryptic Cloudinary error.</p>
     *
     * @throws IllegalArgumentException if the file type or size is invalid
     * @throws Exception                if the Cloudinary upload itself fails
     */
    public String uploadFile(MultipartFile file) throws Exception {
        if (file == null || file.isEmpty()) {
            return null;
        }

        // ── Content-type validation ──────────────────────────────────────────
        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException(
                    "Unsupported image type: " + contentType +
                    ". Allowed types: " + ALLOWED_CONTENT_TYPES
            );
        }

        // ── File size validation ─────────────────────────────────────────────
        if (file.getSize() > MAX_FILE_SIZE_BYTES) {
            throw new IllegalArgumentException(
                    "File is too large (" + (file.getSize() / 1024) + " KB). " +
                    "Maximum allowed size is 5 MB."
            );
        }

        // ── Upload ───────────────────────────────────────────────────────────
        byte[] bytes = file.getBytes();
        Map<?, ?> options = ObjectUtils.asMap(
                "resource_type", "image",
                "folder",        "onecampus/lost-found"
        );
        @SuppressWarnings("unchecked")
        Map<String, Object> result = (Map<String, Object>) cloudinary.uploader().upload(bytes, options);

        String secureUrl = (String) result.get("secure_url");
        if (secureUrl == null || !secureUrl.startsWith("https://")) {
            throw new RuntimeException(
                    "Cloudinary did not return a valid HTTPS URL. Response: " + result
            );
        }
        return secureUrl;
    }
}
