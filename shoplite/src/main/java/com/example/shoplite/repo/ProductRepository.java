package com.example.shoplite.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shoplite.model.Product;

public interface ProductRepository extends JpaRepository<Product,Long>{

}
