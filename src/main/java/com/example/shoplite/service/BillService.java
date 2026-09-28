package com.example.shoplite.service;

import java.util.List;

import com.example.shoplite.model.Bill;

public interface BillService {
    Bill createBill(Bill bill);
    List<Bill> getAllBills();
    Bill getBillById(Long id);
    Bill updateBillStatus(Long id, String paymentStatus);
    void deleteBill(Long id);
}