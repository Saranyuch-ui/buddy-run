# Buddy Run Development Rules for Claude

Version: 1.0.0

---

# Purpose

Claude ต้องอ่านเอกสารทั้งหมดในโฟลเดอร์ /docs ก่อนเริ่มเขียนโค้ดทุกครั้ง

ไฟล์ที่ต้องอ่าน

- PROJECT.md
- REQUIREMENTS.md
- DATABASE.md
- API.md
- UI_GUIDE.md
- CLAUDE_RULES.md

ห้ามเริ่มเขียนโค้ดโดยไม่อ่านเอกสารทั้งหมด

---

# Technology Stack

Frontend

- Next.js 15
- React 19
- TypeScript

Styling

- TailwindCSS
- shadcn/ui

Icons

- Lucide React

Forms

- React Hook Form

Validation

- Zod

Backend

- Next.js Route Handler

Database

- PostgreSQL

ORM

- Prisma

Authentication

- NextAuth

Storage

- Supabase Storage

Deployment

- Vercel

---

# TypeScript Rules

Strict Mode

เปิดใช้งานเสมอ

ห้ามใช้

any

หากจำเป็นให้ใช้

unknown

ต้องกำหนด Type ให้ทุก Function

ต้องกำหนด Interface หรือ Type สำหรับข้อมูลทุกชนิด

---

# React Rules

ใช้ Functional Component เท่านั้น

ใช้ React Hook เท่านั้น

ห้ามใช้ Class Component

ใช้ App Router

ห้ามใช้ Pages Router

---

# Component Rules

ทุก Component ต้อง Reusable

แยก Component ออกจาก Page

ห้ามเขียน Component ขนาดใหญ่เกิน 300 บรรทัด

แบ่งเป็น Component ย่อย

ตัวอย่าง

Hero

↓

EventCard

↓

Button

↓

Badge

↓

Footer

---

# Folder Structure

frontend/

app/

components/

features/

hooks/

lib/

types/

utils/

services/

styles/

public/

---

# Naming Convention

Component

PascalCase

Example

EventCard.tsx

Hook

camelCase

Example

useAuth.ts

API

kebab-case

Example

submit-result

---

# Tailwind Rules

ห้ามใช้

Inline Style

ห้ามใช้

!important

ใช้ Utility Class เท่านั้น

---

# UI Rules

อ้างอิง

UI_GUIDE.md

ทุกหน้า

ต้องเหมือน Design Guide

สี

Blue

White

Green

Rounded

Shadow

Minimal

Premium

---

# Responsive

ทุกหน้าต้องรองรับ

Desktop

Tablet

Mobile

Mobile First

---

# Form Rules

ใช้

React Hook Form

Validation

Zod

Error Message

ใต้ Input

---

# API Rules

อ้างอิง

API.md

ห้ามสร้าง API ใหม่เอง

หากไม่มี API

ให้แจ้งก่อน

---

# Database Rules

อ้างอิง

DATABASE.md

ห้ามแก้ไข Schema

หากจำเป็น

ให้เสนอเหตุผลก่อน

---

# Security

Password Hash

HTTPS

JWT

CSRF Protection

Rate Limit

Input Validation

SQL Injection Protection

XSS Protection

Environment Variables

ห้าม Hardcode Secret

---

# Performance

Lazy Loading

Image Optimization

Code Splitting

Dynamic Import

Server Component

ใช้เมื่อเหมาะสม

---

# Accessibility

Keyboard Navigation

ARIA Label

Alt Text

Focus State

Contrast AA

---

# Git Rules

ทุก Feature

Commit แยก

ตัวอย่าง

feat(home): create hero section

feat(events): create event card

fix(payment): upload validation

refactor(ui): reusable button

---

# Documentation

ทุก Function

มี Comment

Complex Logic

มีคำอธิบาย

---

# Code Quality

ESLint

Prettier

No Console.log

No Dead Code

No Duplicate Code

Reusable

Readable

Maintainable

---

# Before Finish Every Task

Claude ต้องตรวจสอบ

- Type Error
- ESLint
- Build Error
- Responsive
- Accessibility

ห้ามส่งงานหากยังมี Error

---

# Workflow

Step 1

อ่านเอกสารทั้งหมด

↓

Step 2

วิเคราะห์ Requirement

↓

Step 3

วางแผน

↓

Step 4

เขียน Code

↓

Step 5

Build

↓

Step 6

Fix Error

↓

Step 7

Commit

↓

Step 8

สรุปงานที่ทำ

---

# Never Do

ห้าม

ใช้ any

ห้าม

Hardcode URL

ห้าม

Hardcode Password

ห้าม

เขียน CSS ซ้ำ

ห้าม

สร้าง API นอก Requirement

ห้าม

แก้ไข Database โดยไม่แจ้ง

ห้าม

Commit ทุกอย่างรวมกัน

---

# Always Do

อ่านเอกสารก่อนทุกครั้ง

สร้าง Component ที่ Reusable

เขียน TypeScript ที่ถูกต้อง

ใช้ TailwindCSS

ใช้ shadcn/ui

ใช้ Prisma

ใช้ Clean Architecture

สร้างโค้ดที่พร้อม Production

---

END OF DOCUMENT
