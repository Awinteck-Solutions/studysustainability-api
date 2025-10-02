# EMAILER API cURL Requests

This document contains comprehensive cURL requests for all EMAILER endpoints.

## Prerequisites

1. **Authentication Token**: Replace `YOUR_AUTH_TOKEN` with your actual Bearer token
2. **Base URL**: Replace `http://localhost:3000` with your actual API base URL
3. **Campaign ID**: Replace `CAMPAIGN_ID` with actual campaign ID from responses

## Authentication

All requests (except webhook) require Bearer token authentication:
```bash
-H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

## 1. Create Email Campaign

**POST** `/emailer/`

```bash
curl -X POST "http://localhost:3000/emailer/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "campaignName": "Welcome Email Campaign",
    "subject": "Welcome to Our Platform!",
    "fromName": "Study Sustainability Team",
    "fromEmail": "noreply@studysustainability.com",
    "replyToEmail": "support@studysustainability.com",
    "htmlContent": "<h1>Welcome!</h1><p>Thank you for joining our platform.</p><p>Best regards,<br>The Team</p>",
    "textContent": "Welcome! Thank you for joining our platform. Best regards, The Team",
    "recipientType": "INDIVIDUAL",
    "recipients": [
      {
        "email": "user1@example.com",
        "name": "John Doe",
        "status": "PENDING"
      },
      {
        "email": "user2@example.com",
        "name": "Jane Smith",
        "status": "PENDING"
      }
    ],
    "scheduleType": "IMMEDIATE",
    "trackOpens": true,
    "trackClicks": true,
    "trackUnsubscribes": true,
    "emailService": "SENDGRID",
    "tags": ["welcome", "onboarding"],
    "description": "Welcome email for new users",
    "notes": "Send immediately after user registration"
  }'
```

---

## 2. Get All Email Campaigns (with pagination and filters)

**GET** `/emailer/`

### Basic Request
```bash
curl -X GET "http://localhost:3000/emailer/" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### With Pagination
```bash
curl -X GET "http://localhost:3000/emailer/?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### With Filters
```bash
curl -X GET "http://localhost:3000/emailer/?status=SENT&emailService=SENDGRID&search=welcome" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

### Combined Pagination and Filters
```bash
curl -X GET "http://localhost:3000/emailer/?page=2&limit=5&status=DRAFT&emailService=MAILGUN&search=campaign" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

## 3. Get Single Email Campaign

**GET** `/emailer/:id`

```bash
curl -X GET "http://localhost:3000/emailer/CAMPAIGN_ID" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

## 4. Update Email Campaign

**PUT** `/emailer/:id`

```bash
curl -X PUT "http://localhost:3000/emailer/CAMPAIGN_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "campaignName": "Updated Welcome Email Campaign",
    "subject": "Updated: Welcome to Our Platform!",
    "htmlContent": "<h1>Welcome!</h1><p>Thank you for joining our platform.</p><p>We have exciting updates for you!</p><p>Best regards,<br>The Team</p>",
    "status": "DRAFT",
    "tags": ["welcome", "onboarding", "updated"],
    "notes": "Updated with new content and features"
  }'
```

---

## 5. Delete Email Campaign (Soft Delete)

**DELETE** `/emailer/:id`

```bash
curl -X DELETE "http://localhost:3000/emailer/CAMPAIGN_ID" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

## 6. Send Email Campaign

**POST** `/emailer/:id/send`

```bash
curl -X POST "http://localhost:3000/emailer/CAMPAIGN_ID/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "scheduleType": "IMMEDIATE"
  }'
```

### Send with Scheduled Time
```bash
curl -X POST "http://localhost:3000/emailer/CAMPAIGN_ID/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "scheduleType": "SCHEDULED",
    "scheduledAt": "2024-12-25T10:00:00Z"
  }'
```

---

## 7. Send Bulk Email

**POST** `/emailer/bulk/send`

```bash
curl -X POST "http://localhost:3000/emailer/bulk/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "emails": [
      "user1@example.com",
      "user2@example.com",
      "user3@example.com"
    ],
    "subject": "Important Update",
    "htmlContent": "<h1>Important Update</h1><p>We have an important announcement for you.</p><p>Best regards,<br>The Team</p>",
    "textContent": "Important Update: We have an important announcement for you. Best regards, The Team",
    "fromName": "Study Sustainability Team",
    "fromEmail": "noreply@studysustainability.com",
    "replyToEmail": "support@studysustainability.com"
  }'
```

---

## 8. Get Email Campaign Statistics

**GET** `/emailer/stats/overview`

```bash
curl -X GET "http://localhost:3000/emailer/stats/overview" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

## 9. Update Recipient Status (Webhook - No Auth Required)

**POST** `/emailer/webhook/recipient-status`

```bash
curl -X POST "http://localhost:3000/emailer/webhook/recipient-status" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "CAMPAIGN_ID",
    "recipientEmail": "user@example.com",
    "status": "DELIVERED",
    "deliveredAt": "2024-01-15T10:30:00Z",
    "messageId": "msg_123456789"
  }'
```

### Email Opened Webhook
```bash
curl -X POST "http://localhost:3000/emailer/webhook/recipient-status" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "CAMPAIGN_ID",
    "recipientEmail": "user@example.com",
    "status": "OPENED",
    "openedAt": "2024-01-15T11:00:00Z",
    "messageId": "msg_123456789"
  }'
```

### Email Clicked Webhook
```bash
curl -X POST "http://localhost:3000/emailer/webhook/recipient-status" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "CAMPAIGN_ID",
    "recipientEmail": "user@example.com",
    "status": "CLICKED",
    "clickedAt": "2024-01-15T11:15:00Z",
    "messageId": "msg_123456789"
  }'
```

### Email Bounced Webhook
```bash
curl -X POST "http://localhost:3000/emailer/webhook/recipient-status" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "CAMPAIGN_ID",
    "recipientEmail": "invalid@example.com",
    "status": "BOUNCED",
    "bounceReason": "Invalid email address",
    "messageId": "msg_123456789"
  }'
```

---

## Query Parameters Reference

### Pagination Parameters
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)

### Filter Parameters
- `status`: Campaign status (`DRAFT`, `SCHEDULED`, `SENDING`, `SENT`, `PAUSED`, `CANCELLED`, `FAILED`)
- `emailService`: Email service provider (`SENDGRID`, `MAILGUN`, `SES`, `MAILCHIMP`, `CONSTANT_CONTACT`)
- `search`: Search in campaign name, subject, or from email

### Example with All Parameters
```bash
curl -X GET "http://localhost:3000/emailer/?page=1&limit=20&status=SENT&emailService=SENDGRID&search=welcome" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

## Response Examples

### Successful Campaign Creation
```json
{
  "success": true,
  "message": "Email campaign created successfully",
  "response": {
    "_id": "65a1b2c3d4e5f6789012345",
    "resourceId": "123456",
    "campaignName": "Welcome Email Campaign",
    "subject": "Welcome to Our Platform!",
    "status": "DRAFT",
    "totalRecipients": 2,
    "createdAt": "2024-01-15T10:00:00Z"
  }
}
```

### Paginated Campaign List
```json
{
  "status": true,
  "message": "Email campaigns retrieved successfully",
  "response": [
    {
      "_id": "65a1b2c3d4e5f6789012345",
      "campaignName": "Welcome Email Campaign",
      "subject": "Welcome to Our Platform!",
      "status": "SENT",
      "totalRecipients": 2,
      "totalSent": 2
    }
  ],
  "metadata": {
    "total": 1,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "filters": {
      "status": null,
      "emailService": null,
      "search": null
    }
  }
}
```

### Statistics Response
```json
{
  "status": true,
  "message": "Email campaign statistics retrieved successfully",
  "response": {
    "totalCampaigns": 5,
    "totalRecipients": 100,
    "totalSent": 95,
    "totalDelivered": 90,
    "totalOpened": 45,
    "totalClicked": 15,
    "deliveryRate": 94.7,
    "openRate": 50.0,
    "clickRate": 16.7
  }
}
```

---

## Error Responses

### Authentication Error
```json
{
  "status": "error",
  "message": "Access denied. Authentication required.",
  "error_code": "AUTHENTICATION_REQUIRED"
}
```

### Validation Error
```json
{
  "error": "Emailer validation failed: campaignName: Path `campaignName` is required."
}
```

### Not Found Error
```json
{
  "success": false,
  "message": "Email campaign not found"
}
```

---

## Testing Tips

1. **Start with creating a campaign** using the POST request
2. **Use the returned campaign ID** in subsequent requests
3. **Test pagination** with different page and limit values
4. **Test filters** by combining different query parameters
5. **Test webhook endpoints** without authentication
6. **Verify statistics** after sending campaigns

---

## Notes

- All timestamps are in ISO 8601 format
- Email addresses should be valid format
- HTML content should be properly escaped in JSON
- Webhook endpoints don't require authentication
- Soft delete means the record is marked as deleted but not physically removed
- Statistics are cached for performance
