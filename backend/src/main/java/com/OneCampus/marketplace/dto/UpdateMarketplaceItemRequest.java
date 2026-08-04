package com.OneCampus.marketplace.dto;

import com.OneCampus.marketplace.entity.ProductCategory;
import com.OneCampus.marketplace.entity.ProductCondition;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class UpdateMarketplaceItemRequest {

    @NotBlank(message = "Title is required")
    private String title;

    @Size(max = 1000)
    private String description;

    @NotNull(message = "Price is required")
    @Positive(message = "Price must be greater than 0")
    private Double price;

    @NotNull(message = "Category is required")
    private ProductCategory category;

    @NotNull(message = "Condition is required")
    private ProductCondition condition;

    private String image;

    protected UpdateMarketplaceItemRequest() {
    }

    public UpdateMarketplaceItemRequest(
            String title,
            String description,
            Double price,
            ProductCategory category,
            ProductCondition condition,
            String image
    ) {
        this.title = title;
        this.description = description;
        this.price = price;
        this.category = category;
        this.condition = condition;
        this.image = image;
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

    public ProductCategory getCategory() {
        return category;
    }

    public void setCategory(ProductCategory category) {
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
}