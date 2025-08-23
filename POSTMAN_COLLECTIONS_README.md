# Study Sustainability Hub API - Postman Collections

This repository contains comprehensive Postman collections for the Study Sustainability Hub API, a platform dedicated to sustainability education and opportunities.

## 📁 Collection Files

### 1. **Study_Sustainability_Hub_API.postman_collection.json**
Core API collection containing:
- **Authentication** - Admin signup, login, profile management, password reset
- **User Management** - User CRUD operations, profile updates, password changes
- **Admin Management** - Admin user management and administration

### 2. **Study_Sustainability_Hub_Educational_Resources.postman_collection.json**
Educational resources collection containing:
- **University Programs** - Academic programs and degrees
- **Free Courses** - Free educational courses
- **Professional Courses** - Paid professional development courses

### 3. **Study_Sustainability_Hub_Opportunities.postman_collection.json**
Opportunities collection containing:
- **Scholarships** - Educational funding opportunities
- **Grants** - Research and project funding
- **Fellowships** - Professional development programs
- **Jobs** - Employment opportunities
- **Events** - Conferences, workshops, and networking events
- **Careers** - Career path information and guidance

## 🚀 Getting Started

### Prerequisites
- [Postman](https://www.postman.com/downloads/) installed on your machine
- Study Sustainability Hub API running locally or deployed
- Valid admin credentials for authenticated endpoints

### Setup Instructions

1. **Import Collections**
   - Open Postman
   - Click "Import" button
   - Select all three `.postman_collection.json` files
   - Collections will be imported with organized folders

2. **Configure Environment Variables**
   - Create a new environment in Postman
   - Add the following variables:
     ```
     baseUrl: http://localhost:3000 (or your API URL)
     authToken: (will be set after login)
     userId: (for user-specific operations)
     adminId: (for admin-specific operations)
     programId: (for program operations)
     courseId: (for course operations)
     scholarshipId: (for scholarship operations)
     grantId: (for grant operations)
     fellowshipId: (for fellowship operations)
     jobId: (for job operations)
     eventId: (for event operations)
     careerId: (for career operations)
     universityId: (for university-specific operations)
     ```

3. **Authentication Setup**
   - Start with the "Admin Login" request in the Authentication folder
   - Use valid admin credentials
   - Copy the JWT token from the response
   - Set the `authToken` environment variable with the token value

## 📋 API Endpoints Overview

### Authentication Endpoints
- `POST /auth/admin/signup` - Create admin account
- `POST /auth/admin/login` - Admin login
- `GET /auth/admin` - Get admin profile (authenticated)
- `POST /auth/admin/forgot-password` - Request password reset
- `POST /auth/admin/reset-password` - Reset password with token

### User Management Endpoints
- `GET /users` - Get all users (admin only)
- `GET /users/:id` - Get user by ID
- `GET /users/profile` - Get current user profile
- `PATCH /users/update-user` - Update user profile
- `PATCH /users/change-password` - Change user password
- `DELETE /users/delete-user/:id` - Delete user

### Admin Management Endpoints
- `POST /admin-management/create` - Create new admin
- `GET /admin-management/list` - Get all admins
- `GET /admin-management/list/:id` - Get admin by ID
- `PATCH /admin-management/:id` - Update admin
- `DELETE /admin-management/:id` - Delete admin

### Educational Resources Endpoints

#### University Programs
- `POST /university-programs` - Create program
- `GET /university-programs` - Get all programs (admin)
- `GET /university-programs/public` - Get public programs
- `GET /university-programs/:id` - Get program by ID
- `GET /university-programs/uni/:id` - Get programs by university
- `PATCH /university-programs/:id` - Update program
- `PATCH /university-programs/image/:id` - Update program image
- `DELETE /university-programs/temporal/:id` - Soft delete
- `DELETE /university-programs/permanent/:id` - Hard delete

#### Free Courses
- `POST /free-courses` - Create course
- `GET /free-courses` - Get all courses (admin)
- `GET /free-courses/public` - Get public courses
- `GET /free-courses/:id` - Get course by ID
- `PATCH /free-courses/:id` - Update course
- `PATCH /free-courses/image/:id` - Update course image
- `DELETE /free-courses/temporal/:id` - Soft delete
- `DELETE /free-courses/permanent/:id` - Hard delete

#### Professional Courses
- `POST /professional-courses` - Create course
- `GET /professional-courses` - Get all courses (admin)
- `GET /professional-courses/public` - Get public courses
- `GET /professional-courses/:id` - Get course by ID
- `PATCH /professional-courses/:id` - Update course
- `PATCH /professional-courses/image/:id` - Update course image
- `DELETE /professional-courses/temporal/:id` - Soft delete
- `DELETE /professional-courses/permanent/:id` - Hard delete

### Opportunities Endpoints

#### Scholarships
- `POST /scholarships` - Create scholarship
- `GET /scholarships` - Get all scholarships (admin)
- `GET /scholarships/public` - Get public scholarships
- `GET /scholarships/:id` - Get scholarship by ID
- `PATCH /scholarships/:id` - Update scholarship
- `PATCH /scholarships/image/:id` - Update scholarship image
- `DELETE /scholarships/temporal/:id` - Soft delete
- `DELETE /scholarships/permanent/:id` - Hard delete

#### Grants
- `POST /grants` - Create grant
- `GET /grants` - Get all grants (admin)
- `GET /grants/public` - Get public grants
- `GET /grants/:id` - Get grant by ID
- `PATCH /grants/:id` - Update grant
- `PATCH /grants/image/:id` - Update grant image
- `DELETE /grants/temporal/:id` - Soft delete
- `DELETE /grants/permanent/:id` - Hard delete

#### Fellowships
- `POST /fellowships` - Create fellowship
- `GET /fellowships` - Get all fellowships (admin)
- `GET /fellowships/public` - Get public fellowships
- `GET /fellowships/:id` - Get fellowship by ID
- `PATCH /fellowships/:id` - Update fellowship
- `PATCH /fellowships/image/:id` - Update fellowship image
- `DELETE /fellowships/temporal/:id` - Soft delete
- `DELETE /fellowships/permanent/:id` - Hard delete

#### Jobs
- `POST /jobs` - Create job posting
- `GET /jobs` - Get all jobs (admin)
- `GET /jobs/public` - Get public jobs
- `GET /jobs/:id` - Get job by ID
- `PATCH /jobs/:id` - Update job
- `PATCH /jobs/image/:id` - Update job image
- `DELETE /jobs/temporal/:id` - Soft delete
- `DELETE /jobs/permanent/:id` - Hard delete

#### Events
- `POST /events` - Create event
- `GET /events` - Get all events (admin)
- `GET /events/public` - Get public events
- `GET /events/:id` - Get event by ID
- `PATCH /events/:id` - Update event
- `PATCH /events/image/:id` - Update event image
- `DELETE /events/temporal/:id` - Soft delete
- `DELETE /events/permanent/:id` - Hard delete

#### Careers
- `POST /careers` - Create career information
- `GET /careers` - Get all careers (admin)
- `GET /careers/public` - Get public careers
- `GET /careers/:id` - Get career by ID
- `PATCH /careers/:id` - Update career
- `PATCH /careers/image/:id` - Update career image
- `DELETE /careers/temporal/:id` - Soft delete
- `DELETE /careers/permanent/:id` - Hard delete

## 🔐 Authentication & Authorization

### JWT Token Authentication
- Most endpoints require JWT token authentication
- Include token in Authorization header: `Bearer <token>`
- Token obtained from admin login endpoint

### Role-Based Access Control
- **ADMIN** - Full access to all endpoints
- **USER** - Limited access to specific features
- **Public** - No authentication required for public endpoints

## 📝 Request Body Examples

### Admin Signup
```json
{
  "email": "admin@example.com",
  "password": "password123",
  "firstName": "Admin",
  "lastName": "User"
}
```

### Admin Login
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

### Create University Program
```form-data
title: Master in Sustainable Development
description: Comprehensive program in sustainable development
university: University of Sustainability
duration: 2 years
tuitionFee: 25000
uniprograms: [file upload]
```

### Create Scholarship
```form-data
title: Sustainability Leadership Scholarship
description: Scholarship for sustainability leaders
provider: Sustainability Foundation
amount: 10000
deadline: 2024-12-31
scholarships: [file upload]
```

## 🗂️ File Uploads

Most create and update endpoints support file uploads for images:
- Use `form-data` body type
- File field names vary by resource type:
  - `uniprograms` for university programs
  - `freecourse` for free courses
  - `professionals` for professional courses
  - `scholarships` for scholarships
  - `grants` for grants
  - `fellowships` for fellowships
  - `jobs` for jobs
  - `events` for events
  - `careers` for careers

## 🔄 Soft vs Hard Delete

The API supports two types of deletion:
- **Temporal Delete** (`/temporal/:id`) - Soft delete, data remains in database
- **Permanent Delete** (`/permanent/:id`) - Hard delete, data permanently removed

## 🧪 Testing Workflow

1. **Setup Environment** - Configure baseUrl and other variables
2. **Authentication** - Login to get JWT token
3. **Create Resources** - Test POST endpoints with sample data
4. **Retrieve Resources** - Test GET endpoints (both admin and public)
5. **Update Resources** - Test PATCH endpoints
6. **File Uploads** - Test image upload functionality
7. **Delete Resources** - Test both temporal and permanent deletion

## 📊 Response Format

All API responses follow a consistent format:
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data
  }
}
```

## 🚨 Error Handling

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

## 🔧 Troubleshooting

### Common Issues
1. **401 Unauthorized** - Check if authToken is set correctly
2. **400 Bad Request** - Verify request body format and required fields
3. **404 Not Found** - Check if resource ID exists
4. **File Upload Issues** - Ensure correct field name and file format

### Environment Variables
- Ensure all required variables are set
- Update `baseUrl` if API is running on different port
- Refresh `authToken` if it expires

## 📞 Support

For API-related issues or questions:
- Check the API documentation
- Review server logs for detailed error messages
- Ensure all required dependencies are installed

## 📄 License

This project is part of the Study Sustainability Hub platform.

---

**Happy Testing! 🎉**
