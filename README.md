# 🚀 TicketBox AI: Intelligent Support System

TicketBox AI is a high-performance, full-stack support ticket management system. It leverages **Google Gemini 2.5 Flash** to provide real-time AI classification and technical solutions, helping support teams work faster and smarter.

---

## 🌟 Key Features

- **AI-Powered Classification**: Automatically suggests ticket category and priority using Large Language Models (LLM) to reduce manual triaging.
- **Two-Step Confirmation Flow**: Users can review and override AI suggestions before final submission, ensuring data accuracy.
- **Intelligent Solutions**: Includes an "Ask AI" feature that generates concise, actionable technical fixes for support agents.
- **Real-time Analytics**: A dedicated dashboard showing total tickets, open issues, and average tickets per day calculated via database-level aggregation.
- **Glassmorphic UI**: A modern, responsive dark-mode interface built with Tailwind CSS and Framer Motion for smooth, professional animations.

---

## 🛠️ Tech Stack

| Layer          | Technology                                  |
| -------------- | ------------------------------------------- |
| Backend        | Django 5.2, Django REST Framework (DRF)     |
| Frontend       | React 18, Vite, Tailwind CSS, Framer Motion |
| Database       | PostgreSQL                                  |
| AI             | Google Generative AI (Gemini 2.5 Flash)     |
| Infrastructure | Docker & Docker Compose                     |

---

## 🚀 Getting Started

### 1. Prerequisites

Ensure you have the following installed on your system:

- Docker
- Docker Compose

### 2. Environment Setup

Create a `.env` file in the root directory or add the environment variable directly within `docker-compose.yml`:

```yaml
# docker-compose.yml
.env:
      - GEMINI_API_KEY=your_actual_google_api_key_here
```

### 3. Launch the Application

Run the following command to build and start all services:

```powershell
docker-compose up --build
```

The system will automatically:

1. Spin up the PostgreSQL database.
2. Run Django database migrations.
3. Start the Backend API on http://localhost:8000.
4. Start the Frontend on http://localhost:12345.

---

## 🧠 LLM Design Decisions

- **Model Choice**: Gemini 2.5 Flash was selected for its exceptional speed-to-latency ratio, making it ideal for real-time classification as the user drafts a ticket.
- **Prompt Strategy**: Structured JSON prompting ensures the model returns only valid data types (`billing`, `technical`, `account`, `general`), preventing application crashes.
- **Graceful Failure**: If the LLM is unreachable or the API key is invalid, the system defaults to a general category and medium priority, ensuring the user can always submit their ticket without interruption.

---

## 📊 Database Logic

The statistics dashboard uses Django ORM aggregation (`Count`, `Min`, `Max`). Instead of iterating in Python, calculations run directly at the database level, keeping the app fast even as ticket volume scales.

---

## 📁 Project Structure

```
├── backend/
│   ├── core/           # Django settings
│   ├── tickets/        # Ticket logic, AI views, and Models
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/ # Stats, Form, and List components
│   │   └── api.js      # Axios configuration
│   └── index.html      # Tailwind CDN & Fonts
└── docker-compose.yml
```
---
