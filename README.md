# 💉 VaxCare – E-Vaccine Reminder & Child Immunization System (MERN Stack)

A complete, full-stack **MERN (MongoDB, Express.js, React, Node.js)** web application for managing pediatric immunization schedules, tracking administered doses, sending proactive reminder alerts, and coordinating between parents, doctors, and health administrators.

---

## 👥 1. Defined Project Roles

1. **Parent / Patient (`parent`)**:
   - Register their account.
   - Register children (DOB, blood group, allergies, contact).
   - **Automated Scheduling:** When a child is registered, the system automatically calculates scheduled due dates for all national pediatric vaccines from birth to childhood.
   - View immunization progress (% completed), upcoming doses, and overdue alerts.
   - Book vaccination appointments with pediatric clinics and doctors.
   - Receive proactive reminder alerts for vaccines due in the next 14 days or overdue.

2. **Doctor / Healthcare Provider (`doctor`)**:
   - Access the patient directory across clinics.
   - Inspect child immunization history.
   - Administer vaccines: mark doses as completed, input manufacturer batch numbers, clinic details, and clinical remarks.
   - Review and manage vaccination appointments (Confirm / Complete).

3. **System Administrator (`admin`)**:
   - Master Vaccine Catalog management: Add, edit, or delete pediatric vaccines and adjust recommended age milestones.
   - User Account management: View all registered users, promote users to Doctor/Admin roles, or manage accounts.
   - High-level system analytics: Total registered children, overall immunization coverage rate (%), and pending doses.

---

## 🗄️ 2. MongoDB Database & Collections

The database `evaccine_db` includes 6 distinct collections with Mongoose schemas:

1. **`users` (`backend/models/User.js`)**:
   - `name`, `email` (unique), `password` (hashed with bcrypt), `role` (`admin` | `doctor` | `parent`), `phone`, `hospitalOrClinic`, `specialization`, timestamps.
2. **`vaccines` (`backend/models/Vaccine.js`)**:
   - `name`, `diseasePrevented`, `doseNumber`, `targetAgeDays`, `targetAgeMonths`, `ageLabel`, `description`, `routeOfAdministration`, `isMandatory`, `possibleSideEffects`.
3. **`children` (`backend/models/Child.js`)**:
   - `parent` (ref: User), `name`, `dateOfBirth`, `gender`, `bloodGroup`, `birthWeight`, `allergies`, `emergencyContact`, `notes`.
4. **`vaccinationrecords` (`backend/models/VaccinationRecord.js`)**:
   - `child` (ref: Child), `vaccine` (ref: Vaccine), `parent` (ref: User), `dueDate`, `administeredDate`, `status` (`Pending` | `Due` | `Completed` | `Overdue`), `batchNumber`, `clinicOrHospital`, `doctorName`, `remarks`.
5. **`appointments` (`backend/models/Appointment.js`)**:
   - `child`, `parent`, `doctor`, `vaccine`, `appointmentDate`, `timeSlot`, `hospitalOrClinic`, `status` (`Scheduled` | `Confirmed` | `Completed` | `Cancelled`), `notes`.
6. **`reminders` (`backend/models/Reminder.js`)**:
   - `child`, `parent`, `vaccine`, `record`, `dueDate`, `reminderType` (`Upcoming` | `Due Today` | `Overdue`), `title`, `message`, `isRead`.

---

## 🛣️ 3. Backend Routes & Basic CRUD Operations

| Endpoint | Method | Description | Access |
|---|---|---|---|
| `/api/auth/register` | `POST` | Register a new user (parent/doctor/admin) | Public |
| `/api/auth/login` | `POST` | Login user, returns JWT and role | Public |
| `/api/auth/me` | `GET` | Get profile of logged in user | Private |
| `/api/vaccines` | `GET` | List all vaccines in order of target age | Public |
| `/api/vaccines` | `POST` | Create a new vaccine | Admin / Doctor |
| `/api/vaccines/:id` | `PUT` | Update vaccine info | Admin / Doctor |
| `/api/vaccines/:id` | `DELETE` | Delete vaccine from catalog | Admin |
| `/api/vaccines/seed` | `POST` | Seed 15 standard pediatric vaccines | Public / Admin |
| `/api/children` | `GET` | Get children (Parent gets own; Doctor/Admin gets all) | Private |
| `/api/children/:id` | `GET` | Get child profile with full schedule stats | Private |
| `/api/children` | `POST` | Register child & auto-generate schedule | Private |
| `/api/children/:id` | `PUT` | Update child profile | Private |
| `/api/children/:id` | `DELETE` | Delete child & all related records | Private |
| `/api/records` | `GET` | List records with filters (childId, status) | Private |
| `/api/records/:id` | `PUT` | Update record (mark administered, batch #) | Private |
| `/api/appointments` | `GET` | List appointments based on role | Private |
| `/api/appointments` | `POST` | Book vaccination appointment | Private |
| `/api/appointments/:id/status`| `PUT` | Update appointment status (Confirm/Done) | Private |
| `/api/appointments/:id` | `DELETE` | Cancel appointment | Private |
| `/api/reminders` | `GET` | List reminder notifications | Private |
| `/api/reminders/refresh` | `POST` | Scan due dates & generate new alerts | Private |
| `/api/reminders/:id/read` | `PUT` | Mark reminder as read | Private |
| `/api/users` | `GET` | List all users | Admin |
| `/api/users/:id/role` | `PUT` | Update user access role | Admin |
| `/api/stats/dashboard` | `GET` | Role-tailored dashboard metrics | Private |

---

## 🎨 4. Frontend Architecture

- **React 18 + Vite** with fast HMR.
- **Native `fetch()` API Layer (`frontend/src/services/api.js`)**: All HTTP communication uses JavaScript `window.fetch()` with JWT Bearer tokens and JSON parsing as explicitly requested.
- **Role-Based Menus & Navigation (`frontend/src/components/Navbar.jsx`)**:
  - Dynamically updates menu items depending on whether the visitor is a **Guest**, **Parent**, **Doctor**, or **Admin**.
  - Includes real-time badge for unread reminders.
- **Protected Routes (`frontend/src/components/ProtectedRoute.jsx`)**:
  - Validates authentication token.
  - Enforces role requirements (e.g. `/admin/users` requires `admin`).
- **Pages**:
  - `HomePage.jsx`: Landing page with overview and one-click demo login buttons.
  - `LoginPage.jsx`: Sign in with 1-click demo auto-fill for all 3 roles.
  - `RegisterPage.jsx`: Role selector with custom fields for doctors.
  - `DashboardPage.jsx`: Dynamic role views (Parent, Doctor, Admin).
  - `ChildrenPage.jsx`: Child registry with immunization progress bars and modal forms.
  - `ChildDetailPage.jsx`: Full child profile and filterable vaccination timeline.
  - `VaccinesPage.jsx`: Master pediatric vaccine schedule with CRUD actions.
  - `AppointmentsPage.jsx`: Booking and clinical appointment management.
  - `RemindersPage.jsx`: Upcoming and overdue alerts with manual due-date scan.
  - `AdminUsersPage.jsx`: User management and role assignments.

---

## 🚀 5. How to Run the Application

### Option A: One-Click Windows Script
Double click `start-dev.bat` in the project root folder. It starts:
1. MongoDB local server (on port 27017)
2. Backend API server (on http://localhost:5000)
3. Frontend Vite development server (on http://localhost:5173)

### Option B: Manual Command Line

**1. Start MongoDB:**
```powershell
mongod --dbpath backend/data/db --port 27017
```

**2. Start Backend Server:**
```powershell
cd backend
npm start
```
The server will start at `http://localhost:5000` and automatically seed initial data on first launch.

**3. Start Frontend:**
```powershell
cd frontend
npm run dev
```
Open your browser at `http://localhost:5173`.

---

## 🔑 Demo Evaluation Credentials

You can test all 3 roles immediately using these pre-seeded accounts:

| Role | Email | Password | Pre-loaded Data |
|---|---|---|---|
| **Parent** | `parent@evaccine.com` | `parent123` | Registered child "Liam Doe" with 15 scheduled vaccine milestones |
| **Doctor** | `doctor@evaccine.com` | `doctor123` | Dr. Sarah Jenkins, Pediatrician, Metro Children's Clinic |
| **Admin** | `admin@evaccine.com` | `admin123` | Full access to master catalog, user roles, and system statistics |
