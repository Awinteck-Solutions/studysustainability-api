#!/bin/bash

# EMAILER API Test Script
# This script demonstrates how to test the EMAILER API endpoints

# Configuration
BASE_URL="http://localhost:3000"
AUTH_TOKEN="YOUR_AUTH_TOKEN"  # Replace with your actual token

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 EMAILER API Test Script${NC}"
echo "=================================="
echo ""

# Check if auth token is set
if [ "$AUTH_TOKEN" = "YOUR_AUTH_TOKEN" ]; then
    echo -e "${RED}❌ Please set your AUTH_TOKEN in the script${NC}"
    echo "Edit the AUTH_TOKEN variable with your actual Bearer token"
    exit 1
fi

echo -e "${YELLOW}📋 Testing EMAILER API Endpoints${NC}"
echo ""

# 1. Create Email Campaign
echo -e "${BLUE}1. Creating Email Campaign...${NC}"
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/emailer/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "campaignName": "Test Welcome Campaign",
    "subject": "Welcome to Our Platform!",
    "fromName": "Study Sustainability Team",
    "fromEmail": "noreply@studysustainability.com",
    "replyToEmail": "support@studysustainability.com",
    "htmlContent": "<h1>Welcome!</h1><p>Thank you for joining our platform.</p>",
    "textContent": "Welcome! Thank you for joining our platform.",
    "recipientType": "INDIVIDUAL",
    "recipients": [
      {
        "email": "test@example.com",
        "name": "Test User",
        "status": "PENDING"
      }
    ],
    "scheduleType": "IMMEDIATE",
    "trackOpens": true,
    "trackClicks": true,
    "emailService": "SENDGRID",
    "tags": ["test", "welcome"]
  }')

echo "Response: $CREATE_RESPONSE"
echo ""

# Extract campaign ID from response (basic extraction)
CAMPAIGN_ID=$(echo $CREATE_RESPONSE | grep -o '"_id":"[^"]*"' | cut -d'"' -f4)
if [ -z "$CAMPAIGN_ID" ]; then
    echo -e "${RED}❌ Failed to extract campaign ID from create response${NC}"
    echo "Please check the create response and manually set CAMPAIGN_ID"
    echo "You can also use a known campaign ID for testing other endpoints"
    CAMPAIGN_ID="REPLACE_WITH_ACTUAL_CAMPAIGN_ID"
fi

echo -e "${GREEN}✅ Campaign ID: $CAMPAIGN_ID${NC}"
echo ""

# 2. Get All Campaigns
echo -e "${BLUE}2. Getting All Campaigns...${NC}"
curl -s -X GET "$BASE_URL/emailer/?page=1&limit=5" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.' 2>/dev/null || echo "Response received (install jq for formatted output)"
echo ""

# 3. Get Single Campaign
echo -e "${BLUE}3. Getting Single Campaign...${NC}"
curl -s -X GET "$BASE_URL/emailer/$CAMPAIGN_ID" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.' 2>/dev/null || echo "Response received (install jq for formatted output)"
echo ""

# 4. Update Campaign
echo -e "${BLUE}4. Updating Campaign...${NC}"
curl -s -X PUT "$BASE_URL/emailer/$CAMPAIGN_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "campaignName": "Updated Test Welcome Campaign",
    "subject": "Updated: Welcome to Our Platform!",
    "notes": "Updated via test script"
  }' | jq '.' 2>/dev/null || echo "Response received (install jq for formatted output)"
echo ""

# 5. Get Statistics
echo -e "${BLUE}5. Getting Email Statistics...${NC}"
curl -s -X GET "$BASE_URL/emailer/stats/overview" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.' 2>/dev/null || echo "Response received (install jq for formatted output)"
echo ""

# 6. Send Campaign
echo -e "${BLUE}6. Sending Campaign...${NC}"
curl -s -X POST "$BASE_URL/emailer/$CAMPAIGN_ID/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "scheduleType": "IMMEDIATE"
  }' | jq '.' 2>/dev/null || echo "Response received (install jq for formatted output)"
echo ""

# 7. Send Bulk Email
echo -e "${BLUE}7. Sending Bulk Email...${NC}"
curl -s -X POST "$BASE_URL/emailer/bulk/send" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $AUTH_TOKEN" \
  -d '{
    "emails": ["test1@example.com", "test2@example.com"],
    "subject": "Test Bulk Email",
    "htmlContent": "<h1>Bulk Email Test</h1><p>This is a test bulk email.</p>",
    "textContent": "Bulk Email Test: This is a test bulk email.",
    "fromName": "Study Sustainability Team",
    "fromEmail": "noreply@studysustainability.com"
  }' | jq '.' 2>/dev/null || echo "Response received (install jq for formatted output)"
echo ""

# 8. Test Webhook (No Auth Required)
echo -e "${BLUE}8. Testing Webhook (No Auth)...${NC}"
curl -s -X POST "$BASE_URL/emailer/webhook/recipient-status" \
  -H "Content-Type: application/json" \
  -d '{
    "campaignId": "'$CAMPAIGN_ID'",
    "recipientEmail": "test@example.com",
    "status": "DELIVERED",
    "deliveredAt": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "messageId": "msg_test_123"
  }' | jq '.' 2>/dev/null || echo "Response received (install jq for formatted output)"
echo ""

# 9. Test with Filters
echo -e "${BLUE}9. Testing with Filters...${NC}"
curl -s -X GET "$BASE_URL/emailer/?status=DRAFT&emailService=SENDGRID&search=test" \
  -H "Authorization: Bearer $AUTH_TOKEN" | jq '.' 2>/dev/null || echo "Response received (install jq for formatted output)"
echo ""

echo -e "${GREEN}✅ EMAILER API Test Completed!${NC}"
echo ""
echo -e "${YELLOW}📝 Notes:${NC}"
echo "- Replace YOUR_AUTH_TOKEN with your actual Bearer token"
echo "- Install jq for formatted JSON output: brew install jq (macOS) or apt-get install jq (Ubuntu)"
echo "- Check the server logs for detailed error messages"
echo "- Some endpoints may return mock data (email sending is mocked)"
echo ""
echo -e "${BLUE}🔗 For detailed cURL examples, see: EMAILER_CURL_REQUESTS.md${NC}"
