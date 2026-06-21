# CineVerse Studios - Cinema Management System

CineVerse Studios is a comprehensive cinema management system that simulates a real-world movie booking platform. It allows users to browse movies, view cinema locations, select seats, order snacks, and complete a full booking flow, including a demo payment process.

The project is built with a **Node.js** backend and utilizes a local, file-based **JSON data storage** system for simplicity and straightforward setup.

---
## Features

* **Movie Catalog:** Browse available movies and showtimes.
* **Location Directory:** View cinema locations and venue details.
* **Seat Selection:** Interactive seat selection system for real-time availability tracking.
* **Concessions Shop:** Integrated snacks and combos ordering.
* **Authentication:** Full user signup and login system.
* **Ratings & Feedback:** Review and rate movies after watching.
* **Demo Payment Flow:** Mock payment processing for checkout simulation.
* **Booking Confirmations:** Instant receipt generation and history tracking.

---

## Data Storage

The application utilizes local JSON files to manage state and store records for:
* Users & Authentication
* Movies & Showtimes
* Bookings & Receipts
* Seat Reservations
* Ratings & Reviews
* Demo Payment Logs

---

##  How to Run & Access

Follow these steps to get your local environment set up and access the system:

1. **Clone the repository** and open your terminal in the project root folder.
2. **Run the setup, startup, and login sequence**:

   ```bash
   # 1. Install the dependencies
   npm install

   # 2. Navigate to the Backend directory
   cd Backend

   # 3. Start the Node.js server
   node home.js

   # 4. Open the application by navigating to this URL in your web browser:
   # http://localhost:3002/cineverse.html

   # 5. Use the following Demo Credentials to test instantly:
   # Email:    demo@cineverse.com
   # Password: demo123
