package com.example.shoplite.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.shoplite.model.Product;
import com.example.shoplite.repo.ProductRepository;

@Service
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepo;

    public ProductServiceImpl(ProductRepository productRepo) {
        this.productRepo = productRepo;
    }

    @Override
    public Product createProduct(String name, double price, Integer quantity) {
        Product product = new Product(name, price, quantity);
        return productRepo.save(product);
    }

    @Override
    public List<Product> getAllProducts() {
        return productRepo.findAll();
    }

    @Override
    public Product getProductById(Long id) {
        return productRepo.findById(id).orElse(null);
    }

    @Override
    public Product updateProduct(Long id, String name, double price, Integer quantity) {
        Product product = productRepo.findById(id).orElse(null);
        if (product == null) {
            return null;
        }

        product.setName(name);
        product.setPrice(price);
        product.setQuantity(quantity);

        return productRepo.save(product);
    }

    @Override
    public void deleteProduct(Long id) {
        productRepo.deleteById(id);
    }
}