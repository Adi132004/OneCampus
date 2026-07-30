package com.OneCampus.lostfound.dto;

public record UpdateLostFoundItemRequest(
        String name,
        String description,
        String status,
        String location,
        String date,
        String contact,
        String emoji,
        String image
) {
}
