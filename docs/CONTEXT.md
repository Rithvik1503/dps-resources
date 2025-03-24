# DPS Resources Platform

DPS Resources is a comprehensive study platform designed for students of Delhi Public School, Hyderabad (Grades 9-12). The platform provides centralized access to study materials, previous year questions (PYQs), and project resources. It also features an admin dashboard for easy content management.

## Core Features

### Homepage
- Welcoming banner with slogan: "Caring together, growing better"
- Mission statement: "Supporting students with access to comprehensive, student-curated resources"
- Quick navigation buttons for each grade level
- Clean and intuitive user interface

### Grade Selection
- Individual sections for Grades 9, 10, 11, and 12
- Color-coded grade cards for easy identification
- Preview of key subjects per grade
- Direct access to subject resources via "View Resources" buttons

### Subject Resources
Each grade section contains subject-specific resources categorized into:
- **Notes**: Comprehensive class notes and study materials
- **PYQs**: Previous year question papers
- **Project Files**: Templates and example projects

### Subject Pages
- Each subject will have its own dedicated page
- Displays all available resources related to the subject
- Provides filtering and search options for easy access
- Includes download buttons for each resource
- Responsive and mobile-friendly layout

## Admin Dashboard
The administrative interface provides comprehensive content management tools accessible via a login page.

### Default Admin Credentials
- Email: `admin@dps.com`
- Password: `123456`

### Admin Features
- **Users Management**
  - Add, edit, or delete users
  - Assign roles (Admin or Student)
  - Manage user permissions
- **Subjects Management**
  - Add or remove subjects
  - Configure subjects by grade
- **Resources Management**
  - Add, edit, or delete study materials
  - Upload PDF or document files
  - Organize content by grade and subject
- **Dashboard Overview**
  - Display resource statistics
  - Track user activity
  - Monitor reported issues

## Site Configuration
- **General Settings**
  - Customize the site name and description
  - Manage contact information
  - Enable or disable maintenance mode
- **System Tools**
  - Track and resolve user-submitted issues
  - Reset system settings if needed

## Technical Specifications

### Frontend
- **Framework**: Next.js (React Framework)
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS for responsive and clean design

### Backend
- **Platform**: Supabase (Backend-as-a-Service)
- **Database**: PostgreSQL (Hosted by Supabase)
- **Authentication**: Supabase Auth with role-based access control
- **Security**: Row Level Security (RLS) for data protection

### Database Structure
- **Users Table**
  - User ID, Name, Email, Role (Admin or Student), Created At
- **Resources Table**
  - Resource ID, Title, Description, Grade, Subject, File URL, Created At
- **Subjects Table**
  - Subject ID, Grade, Subject Name, Created At

## Platform Objectives

### Current Goals
- Centralized resource repository
- Simplified access to study materials
- Efficient content management via the admin dashboard
- Support for absent students to catch up on classwork

### Future Plans
- Expand resource library
- Enhance administrative controls
- Implement student progress tracking
- Introduce discussion forums for student collaboration

## Support and Maintenance
- Regular content updates
- Scheduled maintenance for system updates
- User support through feedback and issue tracking
- Resource verification to ensure quality
