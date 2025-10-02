#!/usr/bin/env node

/**
 * Demo script to create test invoices for the Finance feature
 * 
 * This script demonstrates how to create invoices using the Finance API.
 * You'll need to replace 'YOUR_AUTH_TOKEN' with a valid JWT token from your authentication system.
 * 
 * Usage:
 * 1. Get a valid JWT token by logging in through the auth endpoints
 * 2. Replace 'YOUR_AUTH_TOKEN' in the script below
 * 3. Run: node create-invoices-demo.js
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const AUTH_TOKEN = 'YOUR_AUTH_TOKEN'; // Replace with actual token

// Test invoice data
const testInvoices = [
  {
    clientName: "University of California, Berkeley",
    clientEmail: "finance@berkeley.edu",
    "clientPhone": "+1-510-642-6000",
    clientAddress: {
      street: "110 Sproul Hall",
      city: "Berkeley",
      state: "CA",
      zip: "94720",
      country: "USA"
    },
    items: [
      {
        description: "Sustainability Course Development",
        quantity: 1,
        unitPrice: 5000.00,
        total: 5000.00
      },
      {
        description: "Course Materials and Resources",
        quantity: 1,
        unitPrice: 1500.00,
        total: 1500.00
      }
    ],
    taxRate: 0.08,
    discountRate: 0.05,
    dueDate: "2024-02-15T00:00:00.000Z",
    notes: "Payment due within 30 days. Late fees may apply.",
    paymentMethod: "STRIPE"
  },
  {
    clientName: "MIT Sustainability Initiative",
    clientEmail: "billing@mit.edu",
    clientPhone: "+1-617-253-1000",
    clientAddress: {
      street: "77 Massachusetts Ave",
      city: "Cambridge",
      state: "MA",
      zip: "02139",
      country: "USA"
    },
    items: [
      {
        description: "Environmental Impact Assessment Training",
        quantity: 2,
        unitPrice: 2500.00,
        total: 5000.00
      },
      {
        description: "Consultation Services",
        quantity: 20,
        unitPrice: 150.00,
        total: 3000.00
      }
    ],
    taxRate: 0.0625,
    discountRate: 0,
    dueDate: "2024-03-01T00:00:00.000Z",
    notes: "Bulk discount applied for multiple participants.",
    paymentMethod: "STRIPE"
  },
  {
    clientName: "Stanford University",
    clientEmail: "procurement@stanford.edu",
    clientPhone: "+1-650-723-2300",
    clientAddress: {
      street: "450 Serra Mall",
      city: "Stanford",
      state: "CA",
      zip: "94305",
      country: "USA"
    },
    items: [
      {
        description: "Green Technology Workshop Series",
        quantity: 1,
        unitPrice: 7500.00,
        total: 7500.00
      },
      {
        description: "Digital Learning Platform Access",
        quantity: 1,
        unitPrice: 2000.00,
        total: 2000.00
      },
      {
        description: "Certification Processing",
        quantity: 50,
        unitPrice: 25.00,
        total: 1250.00
      }
    ],
    taxRate: 0.08,
    discountRate: 0.10,
    dueDate: "2024-03-15T00:00:00.000Z",
    notes: "Early payment discount available if paid within 15 days.",
    paymentMethod: "STRIPE"
  }
];

// Function to make HTTP request
function makeRequest(url, options, data) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const client = isHttps ? https : http;
    
    const req = client.request(url, options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: parsedData
          });
        } catch (error) {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            data: responseData
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Function to create an invoice
async function createInvoice(invoiceData, invoiceName) {
  console.log(`📄 Creating invoice for ${invoiceName}...`);
  
  const options = {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${AUTH_TOKEN}`,
      'Content-Type': 'application/json'
    }
  };
  
  try {
    const response = await makeRequest(`${BASE_URL}/finance`, options, invoiceData);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      if (response.data.status) {
        const invoice = response.data.response;
        console.log(`✅ Invoice created successfully:`);
        console.log(`   Invoice Number: ${invoice.invoiceNumber}`);
        console.log(`   Total Amount: $${invoice.totalAmount.toFixed(2)} ${invoice.currency}`);
        console.log(`   Due Date: ${new Date(invoice.dueDate).toDateString()}`);
        console.log(`   Status: ${invoice.paymentStatus}`);
        return { success: true, invoice };
      } else {
        console.log(`❌ Failed to create invoice: ${response.data.message}`);
        return { success: false, error: response.data.message };
      }
    } else {
      console.log(`❌ HTTP Error ${response.statusCode}: ${response.data.message || 'Unknown error'}`);
      return { success: false, error: `HTTP ${response.statusCode}` };
    }
  } catch (error) {
    console.log(`❌ Network Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

// Main function
async function main() {
  console.log('🚀 Finance Invoice Creation Demo');
  console.log('================================');
  
  if (AUTH_TOKEN === 'YOUR_AUTH_TOKEN') {
    console.log('❌ Please replace "YOUR_AUTH_TOKEN" with a valid JWT token');
    console.log('   You can get a token by logging in through the auth endpoints');
    console.log('   Example: POST /auth/login with valid credentials');
    console.log('');
    console.log('🔧 For testing purposes, you can also:');
    console.log('   1. Check if the server is running: curl http://localhost:3000');
    console.log('   2. Test with a mock token to see validation errors');
    console.log('   3. Use the test data in test-invoice-data.json for manual testing');
    return;
  }
  
  console.log(`📡 Using API endpoint: ${BASE_URL}`);
  console.log(`🔑 Using auth token: ${AUTH_TOKEN.substring(0, 20)}...`);
  console.log('');
  
  const results = [];
  
  for (let i = 0; i < testInvoices.length; i++) {
    const invoiceData = testInvoices[i];
    const result = await createInvoice(invoiceData, invoiceData.clientName);
    results.push(result);
    
    // Small delay between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
    console.log('');
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  console.log('📊 Summary:');
  console.log(`✅ Successfully created: ${successful} invoices`);
  console.log(`❌ Failed: ${failed} invoices`);
  
  if (successful > 0) {
    console.log('\n🎉 Test invoices created successfully!');
    console.log('\nYou can now test these Finance API endpoints:');
    console.log('- GET /finance/invoices - List all invoices');
    console.log('- GET /finance/statistics - Get finance statistics');
    console.log('- GET /finance/:id - Get specific invoice');
    console.log('- GET /finance/:id/payment-link - Get payment link');
  }
  
  if (failed > 0) {
    console.log('\n❌ Errors encountered:');
    results.forEach((result, index) => {
      if (!result.success) {
        console.log(`   Invoice ${index + 1}: ${result.error}`);
      }
    });
  }
}

// Run the demo
main().catch(console.error);
