package com.OneCampus.marketplace.dto;

import com.OneCampus.marketplace.entity.ProductCondition;
import com.OneCampus.marketplace.entity.ProductStatus;

import java.time.Instant;
import java.util.UUID;

public class MarketplaceItemDto {

    private UUID id;
    private String title;
    private String description;
    private Double price;
    private String category;
    private ProductCondition condition;
    private String image;
    private String sellerName;
    private String sellerEmail;
    private String college;
    private ProductStatus status;
    private Instant createdAt;

    protected MarketplaceItemDto() {
    }

    public MarketplaceItemDto(
            UUID id,
            String title,
            String description,
            Double price,
            String category,
            ProductCondition condition,
            String image,
            String sellerName,
            String sellerEmail,
            String college,
            ProductStatus status,
            Instant createdAt) {

        this.id = id;
        this.title = title;
        this.description = description;
        this.price = price;
        this.category = category;
        this.condition = condition;
        this.image = image;
        this.sellerName = sellerName;
        this.sellerEmail = sellerEmail;
        this.college = college;
        this.status = status;
        this.createdAt = createdAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public ProductCondition getCondition() {
        return condition;
    }

    public void setCondition(ProductCondition condition) {
        this.condition = condition;
    }

    public String getImage() {
        return image;
    }

    public void setImage(String image) {
        this.image = image;
    }

    public String getSellerName() {
        return sellerName;
    }

    public void setSellerName(String sellerName) {
        this.sellerName = sellerName;
    }

    public String getSellerEmail() {
        return sellerEmail;
    }

    public void setSellerEmail(String sellerEmail) {
        this.sellerEmail = sellerEmail;
    }

    public String getCollege() {
        return college;
    }

    public void setCollege(String college) {
        this.college = college;
    }

    public ProductStatus getStatus() {
        return status;
    }

    public void setStatus(ProductStatus status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
}