package com.example.shoplite.repo;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.shoplite.model.Bill;

public interface BillRepository extends JpaRepository <Bill,Long>{

}
