# Bow Course Registration Fullstack Web Application

**Course:** Web Programming SODV2201  
**Year:** 2025  
**Project Type:** Fullstack Web Application  
**Team Size:** 3–4 members  

---

## Project Overview

The **Bow Course Registration System** is a full-stack web application designed for students in the Software Development (SD) department to register for courses online. The system allows students to browse available programs and courses, register for courses based on their chosen program and term, and enables admins to manage courses and view student details.

The project is completed in **three phases**:

1. **Assignment 1:** Frontend development using React.js  
2. **Assignment 2:** Backend development using Node.js and a database (SQL/MySQL or MongoDB)  
3. **Final Project:** Full integration of frontend and backend  

---

## Key Features

### Non-User Features
- View all programs and courses
- Sign up to become a student  

**Signup Information Required:**
- First Name, Last Name, Email, Phone, Birthday, Department (SD only), Program, Username, Password  
- After signup, a Student ID is generated and the student is redirected to login/welcome page  

### Student Features
- **Dashboard:** Displays student info including ID, name, department, program, and status  
- **Profile:** View personal details  
- **Term Selection:** Choose term before registering for courses (Spring, Summer, Fall, Winter)  
- **Course Registration:** Register for 2–5 courses per term (cannot register for the same course twice)  
- **Add/Remove Courses:** Modify course selection  
- **Search Courses:** By name or course code  
- **Contact Form:** Submit messages to the admin  

### Administrator Features
- **Dashboard:** View admin info including status  
- **Profile:** View personal details  
- **Course Management:** Create, edit, delete, and search courses  
- **Student Management:** View registered students by program  
- **Message Management:** Read submitted student forms  

---

## Programs Offered

- **Software Development Diploma (2 years)**  
  - Term: Winter  
  - Start Date: September 5, 2024  
  - End Date: June 15, 2026  
  - Fees: $9,254 domestic / $27,735 international  

- **Software Development Post-Diploma (1 year)**  
  - Term: Winter  
  - Start Date: September 5, 2024  
  - End Date: June 15, 2025  
  - Fees: $7,895 domestic / $23,675 international  

---

## Project Structure

### Assignment 1 – Frontend
- Built using **React.js**  
- Data stored in arrays/objects  
- Pages include Signup, Dashboard, Course Listing, Profile, Contact Form  
- Focus on reusable components and state management  

### Assignment 2 – Backend
- Built using **Node.js** with **SQL/MySQL or MongoDB**  
- APIs created to interact with frontend  
- Security and session management implemented (e.g., bcrypt for password encryption)  

### Final Project – Fullstack Integration
- Frontend React app connected with Node.js backend  
- Full functionality for students and admins  
- Proper API integration and modular design  

---

## Sample User Credentials

**Admin:**  
- Username: `dondonadmin`  
- Password: `admin123`  

**Student:**  
- Username: `juan.d`  
- Password: `student123`  

---

## Installation & Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/bow-course-registration.git
