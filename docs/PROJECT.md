# Buddy Run Project Specification

Version: 1.0.0

Author: ChatGPT

Last Update: July 2026

---

# 1. Project Overview

Buddy Run เป็นเว็บไซต์สำหรับจัดกิจกรรม Virtual Run สำหรับผู้รักสัตว์
ผู้ใช้งานสามารถสมัครกิจกรรม ชำระเงิน ส่งผลการวิ่ง และติดตามสถานะผ่านเว็บไซต์ได้ทั้งหมด

ระบบออกแบบให้ใช้งานง่าย รองรับทั้ง Desktop และ Mobile

เว็บไซต์เน้นดีไซน์แบบ Modern Minimal Premium โดยใช้โทนสี Blue + White + Green

---

# 2. Business Goal

Buddy Run มีเป้าหมายเพื่อเป็นแพลตฟอร์มจัดกิจกรรมวิ่งออนไลน์สำหรับคนรักสัตว์

สามารถใช้จัดกิจกรรมได้หลายรูปแบบ เช่น

- Virtual Run
- Charity Run
- Running Challenge
- Donation Campaign

พร้อมระบบจัดการผู้สมัครแบบครบวงจร

---

# 3. Target Users

## Participant

ผู้เข้าร่วมกิจกรรม

สามารถ

- สมัครกิจกรรม
- เลือกแพ็กเกจ
- ชำระเงิน
- ส่งผลวิ่ง
- ตรวจสอบสถานะ
- ดาวน์โหลดใบประกาศ

---

## Admin

ผู้ดูแลระบบ

สามารถ

- สร้างกิจกรรม
- แก้ไขกิจกรรม
- ตรวจสอบการชำระเงิน
- ตรวจสอบผลวิ่ง
- จัดการสมาชิก
- ส่ง Email
- Export Report

---

# 4. Website Structure

Home

↓

Event Detail

↓

Register

↓

Payment

↓

Submit Result

↓

Certificate

---

Dashboard

↓

Events

↓

Participants

↓

Payments

↓

Results

↓

Reports

---

# 5. User Features

## Home

แสดง

- Banner
- กิจกรรมที่กำลังเปิดรับสมัคร
- กิจกรรมที่ผ่านมา
- ข่าวสาร
- จำนวนผู้สมัคร
- ยอดบริจาค

---

## Event Detail

รายละเอียดกิจกรรม

ประกอบด้วย

- Cover
- Description
- Date
- Location
- Running Distance
- Package
- Price
- Reward

---

## Register

ข้อมูลผู้สมัคร

- ชื่อ
- นามสกุล
- Email
- Phone
- Birthday
- Address

เลือก

- Size เสื้อ
- Package
- จำนวน

---

## Payment

รองรับ

- QR Payment
- Bank Transfer

ผู้ใช้สามารถ

- Upload Slip
- ตรวจสอบสถานะ

---

## Submit Result

ส่งผลวิ่ง

รองรับ

- Garmin
- Strava
- Screenshot

กรอก

- Distance
- Time
- Pace

---

## Contact

แสดง

- Facebook
- Line
- Email
- Phone

พร้อม Contact Form

---

# 6. Admin Features

Dashboard

Event Management

Participant Management

Payment Verification

Result Verification

Certificate Generator

News

Report

Settings

---

# 7. UI Theme

Primary Color

Blue (#2563EB)

Secondary

Green (#22C55E)

Background

White (#FFFFFF)

Text

Gray (#374151)

Danger

Red (#EF4444)

---

# 8. Design Style

Minimal

Modern

Premium

Pet Friendly

Large White Space

Rounded Corner

Soft Shadow

---

# 9. Mascot

Buddy Run ใช้

Dog

และ

Cat

เป็น Mascot หลัก

Character

- ยืนสองขา
- ใส่เสื้อวิ่ง Buddy Run
- ยิ้ม
- เป็นมิตร
- ใช้เฉพาะหน้า Home และ Event

---

# 10. Technology Stack

Frontend

- Next.js 15
- React 19
- TypeScript
- TailwindCSS

Backend

- Node.js
- Next API

Database

- PostgreSQL

ORM

- Prisma

Storage

- Supabase Storage

Authentication

- NextAuth

Deployment

- Vercel

---

# 11. Responsive

Desktop

1920px

1440px

1366px

Laptop

Tablet

Mobile

---

# 12. Performance Target

Google Lighthouse

Performance > 95

Accessibility > 95

SEO > 95

Best Practice > 95

---

# 13. Development Standard

Clean Architecture

Reusable Component

TypeScript Strict Mode

ESLint

Prettier

Component Driven

Mobile First

---

END OF DOCUMENT
