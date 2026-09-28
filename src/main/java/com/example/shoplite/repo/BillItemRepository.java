package com.example.shoplite.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shoplite.model.BillItem;

public interface BillItemRepository extends JpaRepository<BillItem,Long>{

}
