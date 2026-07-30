# Buddy Run Software Requirements Specification (SRS)

Version: 1.0.0

---

# 1. Introduction

Buddy Run เป็นระบบสำหรับจัดกิจกรรม Virtual Run สำหรับผู้รักสัตว์

ผู้ใช้งานสามารถ

- สมัครกิจกรรม
- แจ้งชำระเงิน
- ส่งผลการวิ่ง
- ดาวน์โหลดใบประกาศ

ผู้ดูแลระบบสามารถจัดการกิจกรรมและตรวจสอบข้อมูลทั้งหมดผ่าน Dashboard

---

# 2. User Roles

## Guest

สามารถ

- ดูกิจกรรม
- ดูรายละเอียดกิจกรรม
- ติดต่อทีมงาน

---

## Member

สามารถ

- สมัครกิจกรรม
- ชำระเงิน
- ส่งผลวิ่ง
- ดาวน์โหลด Certificate
- ดูประวัติการสมัคร

---

## Admin

สามารถ

- จัดการกิจกรรม
- จัดการสมาชิก
- ตรวจสอบการชำระเงิน
- ตรวจสอบผลวิ่ง
- จัดการข่าวสาร
- ดูรายงาน

---

# 3. Functional Requirements

---

## FR-001 Home Page

วัตถุประสงค์

เป็นหน้าแรกของเว็บไซต์

ประกอบด้วย

- Hero Banner
- Current Events
- Past Events
- Statistics
- News
- Sponsor
- Footer

ผู้ใช้สามารถ

- คลิกดูรายละเอียดกิจกรรม
- สมัครกิจกรรม
- ดูข่าวสาร

---

## FR-002 Event Detail

แสดง

- Banner
- รายละเอียดกิจกรรม
- ระยะวิ่ง
- ของรางวัล
- Package
- ราคา
- FAQ

ปุ่ม

Register Now

---

## FR-003 Register

ผู้ใช้กรอก

- ชื่อ
- นามสกุล
- Email
- เบอร์โทร
- วันเกิด
- ที่อยู่

เลือก

- Package
- Size เสื้อ
- จำนวน

ระบบคำนวณราคาทันที

---

## FR-004 Payment

ผู้ใช้สามารถ

Upload Slip

รองรับ

jpg

jpeg

png

pdf

ขนาดไม่เกิน 10MB

หลังอัปโหลด

สถานะ

Pending

---

## FR-005 Submit Result

ผู้ใช้กรอก

Distance

Duration

Pace

อัปโหลดรูป

สามารถแนบ

Garmin URL

Strava URL

---

## FR-006 Profile

แสดง

ข้อมูลส่วนตัว

ประวัติการสมัคร

สถานะการชำระเงิน

Certificate

---

## FR-007 Contact

แบบฟอร์ม

ชื่อ

Email

ข้อความ

พร้อม

Facebook

Line

Phone

Email

Google Map

---

## FR-008 Login

Login ด้วย

Email

Password

รองรับ

Forgot Password

Remember Me

---

# 4. Admin Requirements

---

## Dashboard

แสดง

จำนวนสมาชิก

จำนวนกิจกรรม

ยอดชำระเงิน

กิจกรรมล่าสุด

Pending Payment

Pending Result

---

## Event Management

Admin สามารถ

Create

Edit

Delete

Publish

Unpublish

กิจกรรม

---

## Participant Management

ค้นหา

Export Excel

Export PDF

Edit

Delete

---

## Payment Management

Approve

Reject

Comment

ดูสลิป

---

## Result Management

Approve

Reject

Comment

ดูรูป

---

## News Management

Create

Edit

Delete

Publish

---

## Report

จำนวนผู้สมัคร

ยอดขาย

รายได้

ผลวิ่ง

Export Excel

Export PDF

---

# 5. Non Functional Requirements

Performance

Page Load

< 2 seconds

API Response

< 500 ms

Availability

99.9%

Responsive

Desktop

Tablet

Mobile

Browser

Chrome

Edge

Safari

Firefox

---

# 6. Security

Password Hash

HTTPS

JWT

CSRF Protection

Rate Limit

Input Validation

SQL Injection Protection

XSS Protection

---

# 7. Validation Rules

Email

ต้องไม่ซ้ำ

Phone

10 หลัก

Password

ขั้นต่ำ 8 ตัว

Slip

ไม่เกิน 10MB

Result Image

ไม่เกิน 10MB

---

# 8. Business Rules

ผู้ใช้ต้องชำระเงินก่อน

↓

Admin ตรวจสอบ

↓

Approve

↓

ผู้ใช้ส่งผล

↓

Admin ตรวจสอบ

↓

Approve

↓

Generate Certificate

---

# 9. Future Features

Lucky Draw

Coupon

Donation

Pet Profile

Running Team

Leaderboard

Mobile App

QR Check-in

Apple Health

Google Fit

END OF DOCUMENT
