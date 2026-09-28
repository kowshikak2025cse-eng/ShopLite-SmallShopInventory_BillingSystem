package com.example.shoplite.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.shoplite.model.Bill;
import com.example.shoplite.service.BillService;

@RestController
@RequestMapping("/api/bills")
public class BillController {

    private final BillService billService;

    public BillController(BillService billService) {
        this.billService = billService;
    }

    @PostMapping("/createBill")
    public Bill createBill(@RequestBody Bill bill) {
        return billService.createBill(bill);
    }

    @GetMapping("/getBills")
    public List<Bill> getAllBills() {
        return billService.getAllBills();
    }

    @GetMapping("/getBill/{id}")
    public Bill getBillById(@PathVariable Long id) {
        return billService.getBillById(id);
    }

    @PutMapping("/updateBill/{id}")
    public Bill updateBillStatus(@PathVariable Long id, @RequestParam String paymentStatus) {
        return billService.updateBillStatus(id, paymentStatus);
    }

    @DeleteMapping("/deleteBill/{id}")
    public String deleteBill(@PathVariable Long id) {
        billService.deleteBill(id);
        return"Product has been deleted successfully";
    }
}