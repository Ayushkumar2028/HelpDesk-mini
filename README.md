# 🧰 HelpDesk Mini - Full Stack Ticketing System

A **HelpDesk Management System** built using **Django REST Framework** for the backend and **React + Vite** for the frontend.
This project allows users to create, view, and manage support tickets with comments, roles, and SLA tracking.

---

## 🌐 Live Demo

* **Frontend:** [https://help-desk-mini-ysto.vercel.app/](https://help-desk-mini-ysto.vercel.app/)
* **Backend API:** [https://helpdesk-mini-4.onrender.com](https://helpdesk-mini-4.onrender.com)

---

## 👤 Demo Credentials

Use the following test account to log in and explore the system:

```
Username: root
Password: 1234
```

---

## 🧱 Tech Stack

### Frontend

* React (Vite)
* Axios (API calls)
* TailwindCSS (Styling)

### Backend

* Django 5.2.7
* Django REST Framework (DRF)
* Token Authentication
* SQLite (Default DB)
* CORS Headers
* Gunicorn (for deployment)

---

## ⚙️ API Summary

| Method | Endpoint                             | Description                                 | 
| :----: | :----------------------------------- | :------------------------------------------ | 
|  POST  | `/api/token/`                        | Obtain authentication token                 |   
|   GET  | `/api/tickets/`                      | List all tickets                            |  
|  POST  | `/api/tickets/new/`                  | Create a new ticket                         | 
|   GET  | `/api/tickets/<id>/`                 | Retrieve a ticket                           |       
|  PATCH | `/api/tickets/<id>/`                 | Update a ticket (status, description, etc.) |       
|  POST  | `/api/tickets/<ticket_id>/comments/` | Add comment to a ticket                     |       
|   GET  | `/api/create-admin/`                 | Create admin user (only for setup)          |       

---

## 📡 Example Requests & Responses

### 🔹 1. Obtain Token

**POST** `/api/token/`

**Request Body:**

```json
{
  "username": "root",
  "password": "1234"
}
```

**Response:**

```json
{
  "token": "1b8d1b276f8dfb4f20567edc23f4f1a5b8b3d324"
}
```

---

### 🔹 2. List All Tickets

**GET** `/api/tickets/`

**Headers:**

```
Authorization: Token <your_token>
```

**Response:**

```json
[
  {
    "id": 1,
    "title": "Server downtime issue",
    "description": "The staging server is not responding.",
    "status": "open",
    "created_by": {
      "id": 1,
      "username": "root",
      "email": "root@example.com",
      "role": "admin"
    },
    "assigned_to": null,
    "sla_hours": 24,
    "created_at": "2025-10-05T09:00:00Z",
    "updated_at": "2025-10-05T09:10:00Z",
    "version": 1,
    "comments": []
  }
]
```

---

### 🔹 3. Create a New Ticket

**POST** `/api/tickets/new/`

**Headers:**

```
Authorization: Token <your_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "title": "Database connection issue",
  "description": "Cannot connect to production database"
}
```

**Response:**

```json
{
  "id": 2,
  "title": "Database connection issue",
  "description": "Cannot connect to production database",
  "status": "open",
  "created_by": {
    "id": 1,
    "username": "root",
    "email": "root@example.com",
    "role": "admin"
  },
  "assigned_to": null,
  "sla_hours": 24,
  "created_at": "2025-10-05T10:00:00Z",
  "updated_at": "2025-10-05T10:00:00Z",
  "version": 1,
  "comments": []
}
```

---

### 🔹 4. Add Comment to Ticket

**POST** `/api/tickets/2/comments/`

**Headers:**

```
Authorization: Token <your_token>
Content-Type: application/json
```

**Request Body:**

```json
{
  "content": "This issue has been escalated to the DevOps team."
}
```

**Response:**

```json
{
  "id": 5,
  "ticket": 2,
  "author": {
    "id": 1,
    "username": "root",
    "email": "root@example.com",
    "role": "admin"
  },
  "content": "This issue has been escalated to the DevOps team.",
  "created_at": "2025-10-05T11:00:00Z"
}
```

---

## 🧩 Seed Data

If you are deploying your own backend, visit:

```
https://<your-backend-url>/api/create-admin/
```

This endpoint creates a default **admin** user:

```
Username: root
Password: 1234
```

---

## 🚀 Deployment

* **Backend:** Deployed on [Render](https://render.com)
* **Frontend:** Deployed on [Vercel](https://vercel.com)

---

## 🧠 Features

* Secure authentication using DRF TokenAuth
* Role-based user model (User / Agent / Admin)
* SLA management for tickets
* Optimistic locking to prevent stale updates
* Comment system linked to each ticket
* CORS and API-ready endpoints for frontend integration

---


