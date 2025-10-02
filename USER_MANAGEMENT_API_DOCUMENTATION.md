# User Management API Documentation

## Base URL
```
/user-management
```

## Authentication
All endpoints require:
- **Authorization Header**: `Bearer <token>`
- **Admin Role**: Only users with ADMIN role and ALL permissions can access these endpoints

---

## 📋 API Endpoints

### 1. Get All Users
**GET** `/user-management/users`

#### Query Parameters
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | number | No | 1 | Page number for pagination |
| `limit` | number | No | 10 | Number of users per page |
| `role` | string | No | - | Filter by user role (STUDENT, PROFESSIONALS, EVENT_ORGANISER, UNIVERSITY_PROGRAMS) |
| `status` | string | No | - | Filter by user status (ACTIVE, INACTIVE) |

#### Sample Request
```http
GET /user-management/users?page=1&limit=10&role=STUDENT&status=ACTIVE
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Sample Response
```json
{
  "status": true,
  "message": "Users retrieved successfully",
  "response": {
    "users": [
      {
        "token": null,
        "firstname": "John",
        "lastname": "Doe",
        "image": "https://s3.amazonaws.com/profile-images/profile-123.jpg",
        "organisationName": "University of Technology",
        "email": "john.doe@example.com",
        "role": "STUDENT",
        "permissions": ["STUDENT"],
        "status": "ACTIVE",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "countryOfOrigin": "United States",
        "countryOfResidence": "Canada",
        "cityOfResidence": "Toronto",
        "gender": "Male",
        "ageRange": "18-25",
        "levelOfStudy": "Undergraduate",
        "academicProgramInterest": "Computer Science",
        "graduateRecruitmentInterest": "Software Development",
        "qualificationType": "Bachelor's Degree",
        "website": "https://johndoe.com",
        "extraEmail": "john.personal@example.com",
        "accreditation": "ABET Accredited",
        "eventTypes": ["Workshops", "Seminars"],
        "fullname": "John Doe",
        "facebook": "https://facebook.com/johndoe",
        "twitter": "https://twitter.com/johndoe",
        "instagram": "https://instagram.com/johndoe",
        "linkedin": "https://linkedin.com/in/johndoe",
        "youtube": "https://youtube.com/johndoe",
        "tiktok": "https://tiktok.com/@johndoe",
        "pinterest": "https://pinterest.com/johndoe",
        "aboutUs": "About our organization...",
        "whyStudyWithUs": "Why study with us...",
        "campusLife": "Campus life information..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalUsers": 47,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

---

### 2. Get User by ID
**GET** `/user-management/users/:id`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID |

#### Sample Request
```http
GET /user-management/users/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Sample Response
```json
{
  "status": true,
  "message": "User retrieved successfully",
  "response": {
    "token": null,
    "firstname": "John",
    "lastname": "Doe",
    "image": "https://s3.amazonaws.com/profile-images/profile-123.jpg",
    "organisationName": "University of Technology",
    "email": "john.doe@example.com",
    "role": "STUDENT",
    "permissions": ["STUDENT"],
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z",
    "countryOfOrigin": "United States",
    "countryOfResidence": "Canada",
    "cityOfResidence": "Toronto",
    "gender": "Male",
    "ageRange": "18-25",
    "levelOfStudy": "Undergraduate",
    "academicProgramInterest": "Computer Science",
    "graduateRecruitmentInterest": "Software Development",
    "qualificationType": "Bachelor's Degree",
    "website": "https://johndoe.com",
    "extraEmail": "john.personal@example.com",
    "accreditation": "ABET Accredited",
    "eventTypes": ["Workshops", "Seminars"],
    "fullname": "John Doe",
    "facebook": "https://facebook.com/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "instagram": "https://instagram.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "youtube": "https://youtube.com/johndoe",
    "tiktok": "https://tiktok.com/@johndoe",
    "pinterest": "https://pinterest.com/johndoe",
    "aboutUs": "About our organization...",
    "whyStudyWithUs": "Why study with us...",
    "campusLife": "Campus life information..."
  }
}
```

---

### 3. Update User
**PUT** `/user-management/users/:id`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID |

#### Request Body
```json
{
  "firstname": "John",
  "lastname": "Doe",
  "email": "john.doe@example.com",
  "countryOfOrigin": "United States",
  "countryOfResidence": "Canada",
  "cityOfResidence": "Toronto",
  "gender": "Male",
  "ageRange": "18-25",
  "levelOfStudy": "Undergraduate",
  "academicProgramInterest": "Computer Science",
  "graduateRecruitmentInterest": "Software Development",
  "qualificationType": "Bachelor's Degree",
  "organisationName": "University of Technology",
  "fullname": "John Doe",
  "website": "https://johndoe.com",
  "extraEmail": "john.personal@example.com",
  "accreditation": "ABET Accredited",
  "eventTypes": ["Workshops", "Seminars"],
  "status": "ACTIVE",
  "facebook": "https://facebook.com/johndoe",
  "twitter": "https://twitter.com/johndoe",
  "instagram": "https://instagram.com/johndoe",
  "linkedin": "https://linkedin.com/in/johndoe",
  "youtube": "https://youtube.com/johndoe",
  "tiktok": "https://tiktok.com/@johndoe",
  "pinterest": "https://pinterest.com/johndoe",
  "aboutUs": "About our organization...",
  "whyStudyWithUs": "Why study with us...",
  "campusLife": "Campus life information..."
}
```

#### Sample Request
```http
PUT /user-management/users/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "firstname": "John",
  "lastname": "Smith",
  "status": "ACTIVE"
}
```

#### Sample Response
```json
{
  "status": true,
  "message": "User updated successfully",
  "response": {
    "token": null,
    "firstname": "John",
    "lastname": "Smith",
    "image": "https://s3.amazonaws.com/profile-images/profile-123.jpg",
    "organisationName": "University of Technology",
    "email": "john.doe@example.com",
    "role": "STUDENT",
    "permissions": ["STUDENT"],
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T14:45:00.000Z",
    "countryOfOrigin": "United States",
    "countryOfResidence": "Canada",
    "cityOfResidence": "Toronto",
    "gender": "Male",
    "ageRange": "18-25",
    "levelOfStudy": "Undergraduate",
    "academicProgramInterest": "Computer Science",
    "graduateRecruitmentInterest": "Software Development",
    "qualificationType": "Bachelor's Degree",
    "website": "https://johndoe.com",
    "extraEmail": "john.personal@example.com",
    "accreditation": "ABET Accredited",
    "eventTypes": ["Workshops", "Seminars"],
    "fullname": "John Smith",
    "facebook": "https://facebook.com/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "instagram": "https://instagram.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "youtube": "https://youtube.com/johndoe",
    "tiktok": "https://tiktok.com/@johndoe",
    "pinterest": "https://pinterest.com/johndoe",
    "aboutUs": "About our organization...",
    "whyStudyWithUs": "Why study with us...",
    "campusLife": "Campus life information..."
  }
}
```

---

### 4. Delete User (Soft Delete)
**DELETE** `/user-management/users/:id`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID |

#### Sample Request
```http
DELETE /user-management/users/64f1a2b3c4d5e6f7g8h9i0j1
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Sample Response
```json
{
  "status": true,
  "message": "User deactivated successfully",
  "response": {
    "token": null,
    "firstname": "John",
    "lastname": "Doe",
    "image": "https://s3.amazonaws.com/profile-images/profile-123.jpg",
    "organisationName": "University of Technology",
    "email": "john.doe@example.com",
    "role": "STUDENT",
    "permissions": ["STUDENT"],
    "status": "INACTIVE",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T15:00:00.000Z",
    "countryOfOrigin": "United States",
    "countryOfResidence": "Canada",
    "cityOfResidence": "Toronto",
    "gender": "Male",
    "ageRange": "18-25",
    "levelOfStudy": "Undergraduate",
    "academicProgramInterest": "Computer Science",
    "graduateRecruitmentInterest": "Software Development",
    "qualificationType": "Bachelor's Degree",
    "website": "https://johndoe.com",
    "extraEmail": "john.personal@example.com",
    "accreditation": "ABET Accredited",
    "eventTypes": ["Workshops", "Seminars"],
    "fullname": "John Doe",
    "facebook": "https://facebook.com/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "instagram": "https://instagram.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "youtube": "https://youtube.com/johndoe",
    "tiktok": "https://tiktok.com/@johndoe",
    "pinterest": "https://pinterest.com/johndoe",
    "aboutUs": "About our organization...",
    "whyStudyWithUs": "Why study with us...",
    "campusLife": "Campus life information..."
  }
}
```

---

### 5. Activate User
**PATCH** `/user-management/users/:id/activate`

#### Path Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `id` | string | Yes | User ID |

#### Sample Request
```http
PATCH /user-management/users/64f1a2b3c4d5e6f7g8h9i0j1/activate
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Sample Response
```json
{
  "status": true,
  "message": "User activated successfully",
  "response": {
    "token": null,
    "firstname": "John",
    "lastname": "Doe",
    "image": "https://s3.amazonaws.com/profile-images/profile-123.jpg",
    "organisationName": "University of Technology",
    "email": "john.doe@example.com",
    "role": "STUDENT",
    "permissions": ["STUDENT"],
    "status": "ACTIVE",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T15:30:00.000Z",
    "countryOfOrigin": "United States",
    "countryOfResidence": "Canada",
    "cityOfResidence": "Toronto",
    "gender": "Male",
    "ageRange": "18-25",
    "levelOfStudy": "Undergraduate",
    "academicProgramInterest": "Computer Science",
    "graduateRecruitmentInterest": "Software Development",
    "qualificationType": "Bachelor's Degree",
    "website": "https://johndoe.com",
    "extraEmail": "john.personal@example.com",
    "accreditation": "ABET Accredited",
    "eventTypes": ["Workshops", "Seminars"],
    "fullname": "John Doe",
    "facebook": "https://facebook.com/johndoe",
    "twitter": "https://twitter.com/johndoe",
    "instagram": "https://instagram.com/johndoe",
    "linkedin": "https://linkedin.com/in/johndoe",
    "youtube": "https://youtube.com/johndoe",
    "tiktok": "https://tiktok.com/@johndoe",
    "pinterest": "https://pinterest.com/johndoe",
    "aboutUs": "About our organization...",
    "whyStudyWithUs": "Why study with us...",
    "campusLife": "Campus life information..."
  }
}
```

---

### 6. Get User Statistics
**GET** `/user-management/statistics`

#### Sample Request
```http
GET /user-management/statistics
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Sample Response
```json
{
  "status": true,
  "message": "User statistics retrieved successfully",
  "response": {
    "overview": {
      "totalUsers": 1247,
      "activeUsers": 1156,
      "inactiveUsers": 91,
      "recentRegistrations": 45
    },
    "breakdown": {
      "byRole": [
        { "_id": "STUDENT", "count": 856 },
        { "_id": "PROFESSIONALS", "count": 234 },
        { "_id": "EVENT_ORGANISER", "count": 98 },
        { "_id": "UNIVERSITY_PROGRAMS", "count": 59 }
      ],
      "byStatus": [
        { "_id": "ACTIVE", "count": 1156 },
        { "_id": "INACTIVE", "count": 91 }
      ],
      "monthlyRegistrations": [
        { "_id": { "year": 2024, "month": 1 }, "count": 23 },
        { "_id": { "year": 2024, "month": 2 }, "count": 31 },
        { "_id": { "year": 2024, "month": 3 }, "count": 28 },
        { "_id": { "year": 2024, "month": 4 }, "count": 35 },
        { "_id": { "year": 2024, "month": 5 }, "count": 42 },
        { "_id": { "year": 2024, "month": 6 }, "count": 38 }
      ]
    }
  }
}
```

---

### 7. Search Users
**GET** `/user-management/search`

#### Query Parameters
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (minimum 2 characters) |
| `page` | number | No | Page number for pagination (default: 1) |
| `limit` | number | No | Number of users per page (default: 10) |

#### Sample Request
```http
GET /user-management/search?q=john&page=1&limit=5
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Sample Response
```json
{
  "status": true,
  "message": "Search results retrieved successfully",
  "response": {
    "users": [
      {
        "token": null,
        "firstname": "John",
        "lastname": "Doe",
        "image": "https://s3.amazonaws.com/profile-images/profile-123.jpg",
        "organisationName": "University of Technology",
        "email": "john.doe@example.com",
        "role": "STUDENT",
        "permissions": ["STUDENT"],
        "status": "ACTIVE",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-15T10:30:00.000Z",
        "countryOfOrigin": "United States",
        "countryOfResidence": "Canada",
        "cityOfResidence": "Toronto",
        "gender": "Male",
        "ageRange": "18-25",
        "levelOfStudy": "Undergraduate",
        "academicProgramInterest": "Computer Science",
        "graduateRecruitmentInterest": "Software Development",
        "qualificationType": "Bachelor's Degree",
        "website": "https://johndoe.com",
        "extraEmail": "john.personal@example.com",
        "accreditation": "ABET Accredited",
        "eventTypes": ["Workshops", "Seminars"],
        "fullname": "John Doe",
        "facebook": "https://facebook.com/johndoe",
        "twitter": "https://twitter.com/johndoe",
        "instagram": "https://instagram.com/johndoe",
        "linkedin": "https://linkedin.com/in/johndoe",
        "youtube": "https://youtube.com/johndoe",
        "tiktok": "https://tiktok.com/@johndoe",
        "pinterest": "https://pinterest.com/johndoe",
        "aboutUs": "About our organization...",
        "whyStudyWithUs": "Why study with us...",
        "campusLife": "Campus life information..."
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalUsers": 12,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "searchQuery": "john"
  }
}
```

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "status": false,
  "message": "Search query must be at least 2 characters long"
}
```

### 401 Unauthorized
```json
{
  "status": false,
  "message": "Unauthorized access"
}
```

### 403 Forbidden
```json
{
  "status": false,
  "message": "Insufficient permissions"
}
```

### 404 Not Found
```json
{
  "status": false,
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "status": false,
  "message": "Internal server error",
  "error": "Error details here"
}
```

---

## 📝 Important Notes

1. **ADMIN, USER & DELETED Exclusion**: All endpoints automatically exclude ADMIN and USER roles, and DELETED status from results
2. **Authentication**: All endpoints require valid JWT token in Authorization header
3. **Authorization**: Only users with ADMIN role and ALL permissions can access these endpoints
4. **Soft Delete**: DELETE endpoint deactivates users instead of permanently deleting them
5. **Search**: Search functionality looks through firstname, lastname, email, and fullname fields
6. **Pagination**: All list endpoints support pagination with page and limit parameters
7. **Statistics**: Statistics endpoint provides comprehensive user analytics excluding ADMIN, USER roles and DELETED status
8. **Data Protection**: Passwords and OTPs are never returned in any response

---

## 🔧 Available User Roles (Excluded: ADMIN, USER)
- `STUDENT`
- `PROFESSIONALS` 
- `EVENT_ORGANISER`
- `UNIVERSITY_PROGRAMS`

## 📊 Available User Status (Excluded: DELETED)
- `ACTIVE`
- `INACTIVE`
- `SUSPENDED`
