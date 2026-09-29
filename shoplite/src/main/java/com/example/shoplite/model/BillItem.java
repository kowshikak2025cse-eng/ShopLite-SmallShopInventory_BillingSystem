package com.example.shoplite.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "bill_items")
public class BillItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id")
    private Product product;

    private Integer quantity;

    private Double unitPrice = 0.0;
    private Double totalPrice = 0.0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    @JsonIgnore
    private Bill bill;

    // Constructors
    public BillItem() {}

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Product getProduct() {
        return product;
    }

    public void setProduct(Product product) {
        this.product = product;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public Double getUnitPrice() {
        return unitPrice != null ? unitPrice : 0.0;
    }

    public void setUnitPrice(Double unitPrice) {
        this.unitPrice = unitPrice;
    }

    public Double getTotalPrice() {
        return totalPrice != null ? totalPrice : 0.0;
    }

    public void setTotalPrice(Double totalPrice) {
        this.totalPrice = totalPrice;
    }

    public Bill getBill() {
        return bill;
    }

    public void setBill(Bill bill) {
        this.bill = bill;
    }
}