# Buddy Run Database Design

Version: 1.0.0

---

# Database

Database : PostgreSQL

ORM : Prisma

Character Set : UTF8

Timezone : Asia/Bangkok

---

# Database Overview

ระบบประกอบด้วยทั้งหมด 12 ตารางหลัก

1. users
2. events
3. event_packages
4. registrations
5. payments
6. results
7. certificates
8. news
9. contacts
10. admins
11. settings
12. audit_logs

---

# Relationship

users

↓

registrations

↓

events

↓

event_packages

↓

payments

↓

results

↓

certificates

---

# Table : users

Purpose

เก็บข้อมูลสมาชิก

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Primary Key |
| first_name | VARCHAR(100) | ชื่อ |
| last_name | VARCHAR(100) | นามสกุล |
| email | VARCHAR(255) | Email |
| password | VARCHAR(255) | Password Hash |
| phone | VARCHAR(20) | เบอร์โทร |
| birthday | DATE | วันเกิด |
| gender | VARCHAR(20) | เพศ |
| address | TEXT | ที่อยู่ |
| province | VARCHAR(100) | จังหวัด |
| postcode | VARCHAR(10) | รหัสไปรษณีย์ |
| profile_image | TEXT | รูปโปรไฟล์ |
| created_at | TIMESTAMP | วันที่สร้าง |
| updated_at | TIMESTAMP | วันที่แก้ไข |

---

# Table : events

เก็บข้อมูลกิจกรรม

| Field | Type |
|-------|------|
| id | UUID |
| title | VARCHAR(255) |
| slug | VARCHAR(255) |
| description | TEXT |
| banner | TEXT |
| event_start | DATE |
| event_end | DATE |
| register_start | DATE |
| register_end | DATE |
| status | VARCHAR(30) |
| created_at | TIMESTAMP |
| updated_at | TIMESTAMP |

---

# Table : event_packages

แพ็กเกจของกิจกรรม

| Field | Type |
|-------|------|
| id | UUID |
| event_id | UUID |
| package_name | VARCHAR(100) |
| description | TEXT |
| price | DECIMAL(10,2) |
| shirt | BOOLEAN |
| medal | BOOLEAN |
| bib | BOOLEAN |
| created_at | TIMESTAMP |

Relationship

Many Packages

↓

One Event

---

# Table : registrations

ข้อมูลการสมัคร

| Field | Type |
|-------|------|
| id | UUID |
| user_id | UUID |
| event_id | UUID |
| package_id | UUID |
| shirt_size | VARCHAR(10) |
| quantity | INTEGER |
| amount | DECIMAL(10,2) |
| status | VARCHAR(30) |
| created_at | TIMESTAMP |

Status

Pending

Paid

Completed

Cancelled

---

# Table : payments

ข้อมูลชำระเงิน

| Field | Type |
|-------|------|
| id | UUID |
| registration_id | UUID |
| amount | DECIMAL(10,2) |
| payment_date | TIMESTAMP |
| slip_image | TEXT |
| bank_name | VARCHAR(100) |
| reference_no | VARCHAR(100) |
| status | VARCHAR(20) |
| verified_by | UUID |
| verified_at | TIMESTAMP |

Status

Pending

Approved

Rejected

---

# Table : results

ผลการวิ่ง

| Field | Type |
|-------|------|
| id | UUID |
| registration_id | UUID |
| distance | DECIMAL(5,2) |
| duration | VARCHAR(20) |
| pace | VARCHAR(20) |
| image | TEXT |
| garmin_url | TEXT |
| strava_url | TEXT |
| submitted_at | TIMESTAMP |
| status | VARCHAR(20) |

Status

Pending

Approved

Rejected

---

# Table : certificates

ใบประกาศ

| Field | Type |
|-------|------|
| id | UUID |
| registration_id | UUID |
| certificate_url | TEXT |
| generated_at | TIMESTAMP |

---

# Table : news

ข่าวสาร

| Field | Type |
|-------|------|
| id | UUID |
| title | VARCHAR(255) |
| content | TEXT |
| cover_image | TEXT |
| published | BOOLEAN |
| created_at | TIMESTAMP |

---

# Table : contacts

ข้อความติดต่อ

| Field | Type |
|-------|------|
| id | UUID |
| fullname | VARCHAR(255) |
| email | VARCHAR(255) |
| phone | VARCHAR(20) |
| message | TEXT |
| created_at | TIMESTAMP |

---

# Table : admins

ผู้ดูแลระบบ

| Field | Type |
|-------|------|
| id | UUID |
| fullname | VARCHAR(255) |
| email | VARCHAR(255) |
| password | VARCHAR(255) |
| role | VARCHAR(50) |
| created_at | TIMESTAMP |

Role

Super Admin

Admin

Staff

---

# Table : settings

ค่าระบบ

| Field | Type |
|-------|------|
| id | UUID |
| website_name | VARCHAR(255) |
| logo | TEXT |
| facebook | TEXT |
| line | TEXT |
| email | TEXT |
| phone | TEXT |
| bank_account | TEXT |
| qr_payment | TEXT |

---

# Table : audit_logs

บันทึกการใช้งาน

| Field | Type |
|-------|------|
| id | UUID |
| user_type | VARCHAR(20) |
| user_id | UUID |
| action | VARCHAR(255) |
| ip_address | VARCHAR(50) |
| created_at | TIMESTAMP |

---

# Index

ควรสร้าง Index

email

event_id

registration_id

payment_status

result_status

created_at

---

# Soft Delete

ทุก Table ที่มีการแก้ไขข้อมูล

เพิ่ม

deleted_at

TIMESTAMP NULL

---

# File Storage

ใช้ Supabase Storage

Bucket

avatars

slips

results

banners

certificates

news

---

# Future Features

Coupon

Promotion

Lucky Draw

Donation

Pet Profile

Running Team

Leaderboard

Push Notification

Mobile Application

---

END OF DOCUMENT
