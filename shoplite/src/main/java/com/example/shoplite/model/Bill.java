package com.example.shoplite.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;

@Entity 
@Table(name = "bill")
public class Bill {

    @Id 
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String customerName;
    private LocalDateTime billDate;
    private Double totalAmount;
    private String paymentStatus;

    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BillItem> items = new ArrayList<>();

    public Bill() {
        this.billDate = LocalDateTime.now();
    }

    public Bill(String customerName, LocalDateTime billDate, Double totalAmount, String paymentStatus) {
        this.customerName = customerName;
        this.billDate = billDate != null ? billDate : LocalDateTime.now();
        this.totalAmount = totalAmount;
        this.paymentStatus = paymentStatus;
    }

    public void addItem(BillItem item) {
        items.add(item);
        item.setBill(this);
        recalculateTotal();
    }

    public void removeItem(BillItem item) {
        items.remove(item);
        item.setBill(null);
        recalculateTotal();
    }

    public void recalculateTotal() {
        this.totalAmount = items.stream()
                .mapToDouble(BillItem::getTotalPrice)
                .sum();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCustomerName() {
        return customerName;
    }

    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }

    public LocalDateTime getBillDate() {
        return billDate;
    }

    public void setBillDate(LocalDateTime billDate) {
        this.billDate = billDate;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(Double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getPaymentStatus() {
        return paymentStatus;
    }

    public void setPaymentStatus(String paymentStatus) {
        this.paymentStatus = paymentStatus;
    }

    public List<BillItem> getItems() {
        return items;
    }

    public void setItems(List<BillItem> items) {
        this.items = items;
    }
}