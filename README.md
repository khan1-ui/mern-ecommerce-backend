# 🚀 SaaS Multi-Store E-Commerce Backend

A production-ready multi-tenant SaaS e-commerce backend built with:

- Node.js
- Express.js
- MongoDB (Mongoose)
- JWT Authentication
- Role-based Authorization
- Stripe Ready Architecture
- Store Isolation System
- Invoice Generation (PDF)
- Digital Product Secure Download

---

## 🏗️ Architecture Overview

This backend follows a **multi-store SaaS architecture**.

Each store owner:
- Has a dedicated store
- Manages only their products
- Sees only their store orders
- Has isolated revenue & analytics

Super Admin:
- Can see all users
- All stores
- Platform revenue
- All products & orders

---

## 🔐 Authentication & Roles

Roles Supported:

- `customer`
- `storeOwner`
- `superadmin`

Features:
- JWT-based auth
- Protected routes middleware
- Role middleware
- Store-level isolation

---

## 📦 Core Features

### 🛍 Products
- Physical products
- Digital products
- Multiple image upload
- Drag & drop reorder
- Store-level slug uniqueness

### 🏬 Store
- Unique slug per store
- Store theme color
- Banner & logo
- Public store page API

### 🧾 Orders
- Transaction-safe order creation (MongoDB session)
- Single-store enforcement per order
- Stock auto deduction
- Payment status tracking
- Order status tracking
- Compound index for store isolation

### 💳 Payment Ready
- COD (default)
- Stripe integration ready
- Webhook-compatible structure

### 📥 Digital Download
- Secure file access
- Purchase validation required

### 📄 Invoice
- PDF invoice generation
- Unique invoice number
- Auto total calculation safeguard

---

## 📊 Admin & Analytics

Store Owner:
- Revenue stats
- Orders breakdown
- Product breakdown
- Revenue by date

Super Admin:
- Platform stats
- Total users
- Total stores
- Total revenue
- Global product access

---

## 🗂 Folder Structure

