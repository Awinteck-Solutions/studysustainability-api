# Creating Test Invoices for Finance Feature

This guide explains how to create test invoices for the Finance feature to test the API endpoints.

## Prerequisites

1. **Server Running**: Make sure your API server is running on `http://localhost:3000`
2. **Authentication**: You need a valid JWT token to create invoices
3. **Database**: Ensure MongoDB is connected and accessible

## Method 1: Using the Demo Script (Recommended)

### Step 1: Get Authentication Token

First, you need to get a valid JWT token by logging in:

```bash
# Login to get a token (replace with actual credentials)
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }'
```

### Step 2: Update the Demo Script

1. Open `create-invoices-demo.js`
2. Replace `YOUR_AUTH_TOKEN` with the actual JWT token from Step 1
3. Run the script:

```bash
node create-invoices-demo.js
```

## Method 2: Using cURL Commands

### Step 1: Get Authentication Token

```bash
# Login to get a token
curl -X POST "http://localhost:3000/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com", 
    "password": "your_password"
  }'
```

### Step 2: Create Invoices

Replace `YOUR_TOKEN` with the actual JWT token:

```bash
# Create UC Berkeley Invoice
curl -X POST "http://localhost:3000/finance" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "University of California, Berkeley",
    "clientEmail": "finance@berkeley.edu",
    "clientPhone": "+1-510-642-6000",
    "clientAddress": {
      "street": "110 Sproul Hall",
      "city": "Berkeley",
      "state": "CA",
      "zip": "94720",
      "country": "USA"
    },
    "items": [
      {
        "description": "Sustainability Course Development",
        "quantity": 1,
        "unitPrice": 5000.00,
        "total": 5000.00
      },
      {
        "description": "Course Materials and Resources",
        "quantity": 1,
        "unitPrice": 1500.00,
        "total": 1500.00
      }
    ],
    "taxRate": 0.08,
    "discountRate": 0.05,
    "dueDate": "2024-02-15T00:00:00.000Z",
    "notes": "Payment due within 30 days. Late fees may apply.",
    "paymentMethod": "STRIPE"
  }'
```

## Method 3: Using Postman

1. Import the Postman collection: `Study_Sustainability_Hub_API_Complete_v2.postman_collection.json`
2. Set up authentication in the collection
3. Use the Finance endpoints to create invoices

## Test Data Overview

The test data includes 5 sample invoices for major universities:

1. **UC Berkeley** - $6,695.00 (Sustainability Course Development)
2. **MIT** - $8,500.00 (Environmental Impact Assessment Training)
3. **Stanford** - $10,535.00 (Green Technology Workshop Series)
4. **Harvard Business School** - $20,187.50 (Executive Sustainability Program)
5. **Yale** - $17,229.50 (Climate Change Research Collaboration)

### Invoice Features:
- **Client Information**: Name, email, phone, address
- **Line Items**: Multiple items with quantities and prices
- **Tax Calculations**: Various tax rates (6.25% - 8%)
- **Discounts**: Some invoices include discounts (5% - 10%)
- **Payment Methods**: All use STRIPE for payment processing
- **Due Dates**: Range from 14 to 60 days from creation
- **Notes**: Payment terms and special instructions

## Testing the Created Invoices

After creating invoices, you can test these endpoints:

### List All Invoices
```bash
curl -X GET "http://localhost:3000/finance/invoices" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Finance Statistics
```bash
curl -X GET "http://localhost:3000/finance/statistics" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Specific Invoice
```bash
curl -X GET "http://localhost:3000/finance/INVOICE_ID" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Get Payment Link
```bash
curl -X GET "http://localhost:3000/finance/INVOICE_ID/payment-link"
```

## Expected Results

After creating all test invoices, you should see:

- **Total Invoices**: 5
- **Total Amount**: $63,147.50
- **Average Invoice**: $12,629.50
- **Payment Methods**: All STRIPE
- **Status**: All PENDING (initially)

## Troubleshooting

### Common Issues:

1. **"Unauthorized" Error**: 
   - Check if your JWT token is valid
   - Ensure the token is properly formatted in the Authorization header

2. **"Cannot POST /finance" Error**:
   - Verify the server is running on port 3000
   - Check if the Finance routes are properly registered

3. **Database Connection Error**:
   - Ensure MongoDB is running
   - Check database connection string in environment variables

4. **Validation Errors**:
   - Verify all required fields are provided
   - Check date format (ISO 8601)
   - Ensure numeric values are properly formatted

## Files Created

- `create-invoices-demo.js` - Node.js script for creating invoices
- `test-invoice-data.json` - JSON data for all test invoices
- `create-test-invoices-curl.sh` - Shell script with cURL commands
- `CREATE_TEST_INVOICES.md` - This documentation file

## Next Steps

After creating test invoices, you can:

1. Test the Dashboard analytics to see invoice statistics
2. Test payment link generation
3. Test invoice updates and status changes
4. Test the Finance statistics endpoint
5. Integrate with frontend applications

Happy testing! 🎉
