package com.example.shoplite.service;

import java.util.List;
import com.example.shoplite.model.Product;

public interface ProductService 
{
    Product createProduct(String name, double price, Integer quantity);
    List<Product> getAllProducts();
    Product getProductById(Long id);
    Product updateProduct(Long id, String name, double price, Integer quantity);
    void deleteProduct(Long id);
}