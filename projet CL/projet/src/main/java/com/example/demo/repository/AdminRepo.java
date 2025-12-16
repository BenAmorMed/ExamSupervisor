package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.demo.entites.Admin;

@Repository
public interface AdminRepo extends JpaRepository<Admin, Long> {
    Admin findByEmailAndPassword(String email, String password);
}
