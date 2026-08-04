package com.OneCampus.lostfound.dto;

import jakarta.validation.constraints.NotBlank;

public record UpdateLostFoundItemRequest(
        @NotBlank(message = "Lost item name is required") String name,
        @NotBlank(message = "Description is required") String description,
        String status,
        @NotBlank(message = "Last seen location is required") String location,
        @NotBlank(message = "Date is required") String date,
        @NotBlank(message = "Contact details are required") String contact,
        String emoji,
        String category,
        String image,
        Boolean removeImage
) {
}
