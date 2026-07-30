# Buddy Run API Specification

Version: 1.0.0

---

# API Standard

Protocol

HTTPS

Base URL

Development

/api

Production

https://yourdomain.com/api

Response Format

JSON

Authentication

JWT

Content-Type

application/json

---

# Authentication

## Login

POST

/api/auth/login

Request

{
    "email": "user@email.com",
    "password": "password"
}

Response

{
    "success": true,
    "token": "jwt_token",
    "user": {
        "id": "...",
        "fullname": "...",
        "email": "..."
    }
}

---

## Register

POST

/api/auth/register

Request

{
    "firstname": "",
    "lastname": "",
    "email": "",
    "password": "",
    "phone": ""
}

Response

{
    "success": true
}

---

## Logout

POST

/api/auth/logout

---

# User

## Get Profile

GET

/api/profile

Response

{
    "id":"",
    "firstname":"",
    "lastname":"",
    "email":"",
    "phone":""
}

---

## Update Profile

PUT

/api/profile

---

# Events

## Get Events

GET

/api/events

Response

[
    {
        "id":"",
        "title":"",
        "cover":"",
        "price":500
    }
]

---

## Event Detail

GET

/api/events/{id}

---

## Search Event

GET

/api/events?search=dog

---

# Registration

## Register Event

POST

/api/register

Request

{
    "event_id":"",
    "package_id":"",
    "shirt_size":"L",
    "quantity":1
}

Response

{
    "registration_id":"..."
}

---

## Registration History

GET

/api/register/history

---

# Payment

## Upload Slip

POST

/api/payment

FormData

registration_id

amount

slip

Response

{
    "success":true
}

---

## Payment History

GET

/api/payment/history

---

# Result

## Submit Result

POST

/api/result

Request

{
    "registration_id":"",
    "distance":10,
    "duration":"01:05:20",
    "pace":"6:32",
    "garmin_url":"",
    "strava_url":""
}

---

## Upload Result Image

POST

/api/result/upload

FormData

image

---

## My Results

GET

/api/result/history

---

# Certificate

GET

/api/certificate/{registrationId}

Response

PDF URL

---

# Contact

POST

/api/contact

Request

{
    "fullname":"",
    "email":"",
    "phone":"",
    "message":""
}

---

# News

GET

/api/news

GET

/api/news/{id}

---

# Admin

Authentication Required

Role

Admin

Super Admin

---

## Dashboard

GET

/api/admin/dashboard

Response

{
    "members":1000,
    "events":10,
    "payments":500,
    "results":450
}

---

## Event Management

GET

/api/admin/events

POST

/api/admin/events

PUT

/api/admin/events/{id}

DELETE

/api/admin/events/{id}

---

## Package Management

GET

/api/admin/packages

POST

/api/admin/packages

PUT

/api/admin/packages/{id}

DELETE

/api/admin/packages/{id}

---

## Participant Management

GET

/api/admin/participants

GET

/api/admin/participants/{id}

PUT

/api/admin/participants/{id}

DELETE

/api/admin/participants/{id}

---

## Payment Management

GET

/api/admin/payments

PUT

/api/admin/payments/{id}

Approve

Reject

Comment

---

## Result Management

GET

/api/admin/results

PUT

/api/admin/results/{id}

Approve

Reject

Comment

---

## News Management

GET

/api/admin/news

POST

/api/admin/news

PUT

/api/admin/news/{id}

DELETE

/api/admin/news/{id}

---

## Report

GET

/api/admin/report

Export

Excel

PDF

CSV

---

# HTTP Status

200 OK

201 Created

400 Bad Request

401 Unauthorized

403 Forbidden

404 Not Found

422 Validation Error

500 Internal Server Error

---

# Error Response

{
    "success":false,
    "message":"Validation Error"
}

---

# Rate Limit

Guest

60 Requests / Minute

Member

120 Requests / Minute

Admin

300 Requests / Minute

---

# File Upload

Supported

jpg

jpeg

png

pdf

Maximum

10MB

---

END OF DOCUMENT
