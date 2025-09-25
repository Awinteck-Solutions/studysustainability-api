# Study Sustainability Hub API - Postman Collection

## 📋 Overview

This Postman collection provides comprehensive API testing for the Study Sustainability Hub platform. It includes all endpoints for managing educational resources, opportunities, and user interactions.

## 🚀 Quick Start

### 1. Import the Collection
- Download `Study_Sustainability_Hub_API_Complete_v2.postman_collection.json`
- Import it into Postman
- The collection will be available in your Postman workspace

### 2. Set Up Environment Variables
The collection uses these variables:
- `baseUrl`: `http://localhost:3000` (default)
- `authToken`: Automatically set after login

### 3. Authentication Flow
1. **Admin Signup** - Create a new admin account
2. **Admin Login** - Login to get authentication token
3. **Admin Profile** - Verify authentication works

## 📚 API Features Covered

### 🔐 Authentication & User Management
- Admin signup/login
- Password reset functionality
- User profile management
- User CRUD operations

### 🎓 Educational Resources
- **University Programs**: Full CRUD with search/filter capabilities
- **Professional Courses**: Course management with dashboard metrics
- **Free Courses**: Free educational content management
- **Scholarships**: Scholarship opportunities with deadline filtering
- **Grants**: Grant opportunities management
- **Fellowships**: Fellowship programs management

### 💼 Career & Opportunities
- **Jobs**: Job listings with comprehensive filtering
- **Events**: Event management with analytics
- **Career Catalog**: Career guidance resources

### 📢 Marketing & Engagement
- **Advertisements**: Ad management with view/click tracking
- **Email Campaigns**: Email marketing management
- **Display Adverts**: Display advertisement management
- **Subscribers**: Newsletter subscription management

### 📊 Analytics & Tracking
- **Engagement Tracking**: View/click analytics
- **Interest Forms**: Lead generation forms
- **Dashboard Metrics**: Comprehensive analytics for each feature

### 📝 Additional Features
- **Surveys**: Survey management
- **Open Days**: University open day management
- **Market Insights**: Market research data

## 🔍 Search & Filter Capabilities

### University Programs
```
GET /university-programs/public
Query Parameters:
- search: Text search across multiple fields
- discipline: Filter by academic discipline
- studyType: full-time, part-time, etc.
- qualificationType: bachelor, master, phd, etc.
- institution: University name filter
- location: Geographic location
- startTerm: Application start term
- delivery: on-campus, online, hybrid
- universityId: Filter by specific university
```

### Jobs
```
GET /jobs/public
Query Parameters:
- search: Job title/description search
- jobCategory: Technology, healthcare, etc.
- jobType: full-time, part-time, contract
- workPreference: remote, on-site, hybrid
- experienceLevel: entry, mid, senior
- organizationType: startup, corporate, etc.
- industry: tech, finance, healthcare
- location: City/country filter
- country: Country-specific filter
```

### Events
```
GET /events/public
Query Parameters:
- search: Event title/description search
- eventType: conference, workshop, webinar
- nameOfProvider: Event organizer
- deliveryFormat: online, in-person, hybrid
- language: Event language
```

## 📊 Dashboard Metrics

### University Programs Dashboard
```
GET /university-programs/dashboard-metrics
Response:
{
  "totalPrograms": 25,
  "totalActivePrograms": 20,
  "totalRegisteredInterests": 150,
  "totalViews": 3000
}
```

### Events Dashboard
```
GET /events/dashboard-metrics
Response:
{
  "totalEvents": 15,
  "totalActiveEvents": 12,
  "totalRegisteredInterests": 80,
  "totalViews": 1200
}
```

### Professional Courses Dashboard
```
GET /professional-courses/dashboard-metrics
Response:
{
  "totalCourses": 30,
  "totalActiveCourses": 25,
  "totalRegisteredInterests": 200,
  "totalViews": 5000
}
```

## 🎯 Advertisement Tracking

### Track Views
```
POST /advertise/:id/view
- Increments view count
- Returns current view/click counts
```

### Track Clicks
```
POST /advertise/:id/click
- Increments click count
- Returns PDF file or external link
- Returns current view/click counts
```

## 📧 Engagement & Interest Forms

### Submit Interest
```
POST /interest-form
Body:
{
  "menuId": "item-id",
  "menu": "UniversityPrograms|Events|Jobs|Scholarships|Grants|Fellowships|ProfessionalCourses",
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Interested in this program"
}
```

### Track Engagement
```
POST /engagement/track
Body:
{
  "item": "item-id",
  "type": "VIEW|CLICK|LIKE|SHARE",
  "value": 1
}
```

## 🔧 File Upload Examples

### University Program with Image
```
POST /university-programs
Content-Type: multipart/form-data
Body:
- titleOfProgramme: "Computer Science"
- nameOfInstitution: "MIT"
- discipline: "Computer Science"
- studyType: "Full-time"
- qualificationType: "Bachelor"
- location: "London"
- startTerm: "September"
- delivery: "On-campus"
- uniprograms: [FILE] (image file)
```

### Advertisement with Image and PDF
```
POST /advertise
Content-Type: multipart/form-data
Body:
- title: "Tech Course Advertisement"
- description: "Learn programming online"
- category: "education"
- advertType: "landscape|portrait|square|strip|onload|header|footer"
- placement: "homepage|sidebar|footer|header|content|popup|banner|newsletter|social|mobile"
- targetAudience: "students"
- startDate: "2024-01-01"
- endDate: "2024-12-31"
- isActive: "true"
- externalLink: "https://example.com"
- displayImage: [FILE] (image file)
- pdfFile: [FILE] (PDF file)
```

## 🚨 Error Handling

The API returns standard HTTP status codes:
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

Error responses include:
```json
{
  "error": "Error message description",
  "success": false
}
```

## 🔐 Authentication

Most endpoints require authentication:
```
Authorization: Bearer <jwt-token>
```

The token is automatically set after successful login and used in subsequent requests.

## 📈 Pagination

List endpoints support pagination:
```
GET /endpoint?page=1&limit=10
```

Response includes metadata:
```json
{
  "message": "Data found",
  "metadata": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10,
    "filters": { ... }
  },
  "response": [ ... ]
}
```

## 🎨 Advertisement Types & Placements

### Advertisement Types
- `landscape`: Wide format ads
- `portrait`: Tall format ads
- `square`: Square format ads
- `strip`: Banner strip ads
- `onload`: Page load ads
- `header`: Header ads
- `footer`: Footer ads

### Advertisement Placements
- `homepage`: Main page
- `sidebar`: Sidebar placement
- `footer`: Footer placement
- `header`: Header placement
- `content`: Content area
- `popup`: Popup ads
- `banner`: Banner ads
- `newsletter`: Newsletter ads
- `social`: Social media
- `mobile`: Mobile-specific

## 🔄 Cache Management

The API uses Redis for caching. Cache keys are automatically managed, but you can:
- Check cache status in response headers
- Force cache refresh by adding `?refresh=true` to requests
- Cache duration varies by endpoint (1 hour for most public endpoints)

## 📱 Testing Tips

1. **Start with Authentication**: Always login first to get the auth token
2. **Use Public Endpoints**: Test public endpoints without authentication
3. **File Uploads**: Use Postman's file upload feature for image/PDF uploads
4. **Search & Filter**: Test different combinations of search and filter parameters
5. **Error Scenarios**: Test with invalid data to verify error handling
6. **Pagination**: Test with different page sizes and page numbers

## 🚀 Production Deployment

For production use:
1. Update `baseUrl` to your production domain
2. Use production authentication credentials
3. Test all endpoints thoroughly
4. Monitor response times and error rates

## 📞 Support

For API support or questions:
- Check the API documentation
- Review error messages in responses
- Test with the provided Postman collection
- Verify authentication tokens are valid

---

**Happy Testing! 🎉**
