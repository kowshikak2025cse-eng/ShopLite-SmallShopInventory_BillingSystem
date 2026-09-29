package com.example.shoplite.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.shoplite.model.Product;
import com.example.shoplite.service.ProductService;

@RestController
@RequestMapping("/api/products")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @PostMapping("/createProduct")
    public Product createProduct(@RequestBody Product product) {
        return productService.createProduct(
                product.getName(), 
                product.getPrice(), 
                product.getQuantity()
        );
    }

    @GetMapping("/getProducts")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/getProduct/{id}")
    public Product getProductById(@PathVariable Long id) {
        return productService.getProductById(id);
    }

    @PutMapping("/updateProduct/{id}")
    public Product updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return productService.updateProduct(
                id, 
                product.getName(), 
                product.getPrice(), 
                product.getQuantity()
        );
    }

    @DeleteMapping("/deleteProduct/{id}")
    public String deleteProduct(@PathVariable Long id) {
        productService.deleteProduct(id);
        return "Product has been deleted successfully";
    }
}