
package com.example.shoplite.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.shoplite.model.Bill;
import com.example.shoplite.model.BillItem;
import com.example.shoplite.model.Product;
import com.example.shoplite.repo.BillRepository;
import com.example.shoplite.repo.ProductRepository;

@Service
public class BillServiceImpl implements BillService {

    private final BillRepository billRepo;
    private final ProductRepository productRepo;

    public BillServiceImpl(BillRepository billRepo,
                           ProductRepository productRepo) {
        this.billRepo = billRepo;
        this.productRepo = productRepo;
    }

    @Override
    @Transactional
    public Bill createBill(Bill bill) {

        if (bill.getItems() == null || bill.getItems().isEmpty()) {
            throw new RuntimeException("Bill items cannot be empty");
        }

        bill.setBillDate(LocalDateTime.now());

        // Initialize total amount
        double totalAmount = 0.0;

        for (BillItem item : bill.getItems()) {

            Long productId = item.getProduct().getId();

            // 1. Fetch Product from DB
            Product product = productRepo.findById(productId)
                    .orElseThrow(() -> new RuntimeException(
                            "Product not found with id: " + productId));

            // 2. Stock Check
            if (product.getQuantity() < item.getQuantity()) {
                throw new RuntimeException(
                        "Insufficient stock for product: "
                        + product.getName()
                        + ". Available: " + product.getQuantity()
                        + ", Requested: " + item.getQuantity());
            }

            // 3. Deduct Stock
            product.setQuantity(
                    product.getQuantity() - item.getQuantity());

            productRepo.save(product);

            // 4. Populate BillItem details
            item.setProduct(product);
            item.setUnitPrice(product.getPrice());

            double itemTotal =
                    product.getPrice() * item.getQuantity();

            item.setTotalPrice(itemTotal);
            item.setBill(bill);

            // 5. Add item total to bill total
            totalAmount += itemTotal;
        }

        // 6. Set Bill Total Amount
        bill.setTotalAmount(totalAmount);

        // 7. Save Bill
        return billRepo.save(bill);
    }

    @Override
    public List<Bill> getAllBills() {
        return billRepo.findAll();
    }

    @Override
    public Bill getBillById(Long id) {
        return billRepo.findById(id).orElse(null);
    }

    @Override
public Bill updateBillStatus(Long id, String paymentStatus) {
    Bill bill = billRepo.findById(id).orElse(null);

    if (bill == null) {
        return null;
    }

    bill.setPaymentStatus(paymentStatus);
    return billRepo.save(bill);
    }

    @Override
    public void deleteBill(Long id) {
        billRepo.deleteById(id);
    }
}