package com.example.shoplite.model;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity 
@Table(name="product")
public class Product {
    @Id 
    @GeneratedValue (strategy=GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Double price;
    private Integer quantity;
    public Product(){}
    public Product(String name,Double price,Integer quantity)
    {
        this.name = name;
        this.price = price;
        this.quantity = quantity;
    }
    public Long getId() {
        return id;
    }
    public void setId(Long id) {
        this.id = id;
    }
    public String getName() {
        return name;
    }
    public void setName(String name) {
        this.name = name;
    }
    public Double getPrice() {
        return price;
    }
    public void setPrice(Double price) {
        this.price = price;
    }
    public Integer getQuantity() {
        return quantity;
    }
    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
    
}
