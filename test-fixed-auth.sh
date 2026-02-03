#!/bin/bash

echo "🔐 Testing Fixed Authentication"
echo "==============================="

echo "1. Getting test token..."
TOKEN_RESPONSE=$(curl -s http://localhost:3000/api/test/token)
echo "Response: $(echo "$TOKEN_RESPONSE" | grep -o '"success":[^,]*')"
TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Failed to get token"
  exit 1
fi

echo "✅ Token obtained: ${TOKEN:0:30}..."

echo -e "\n2. Testing GET /api/assets (protected route)..."
ASSETS_RESPONSE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/assets)
if echo "$ASSETS_RESPONSE" | grep -q '"success":true'; then
  echo "✅ GET /api/assets works!"
  # Count assets
  ASSET_COUNT=$(echo "$ASSETS_RESPONSE" | grep -o '"id":"[^"]*"' | wc -l)
  echo "   Found $ASSET_COUNT assets"
else
  echo "❌ GET /api/assets failed:"
  echo "$ASSETS_RESPONSE"
fi

echo -e "\n3. Testing POST /api/assets (create asset)..."
CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/assets \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Fixed Test Asset",
    "description": "Asset created after auth fix",
    "category": "Electronics",
    "serialNumber": "FIX-'$(date +%s)'",
    "purchaseDate": "'$(date -I)'",
    "purchasePrice": 299.99,
    "currentValue": 250.00,
    "status": "available",
    "location": "Testing Department",
    "notes": "Working perfectly!"
  }')

if echo "$CREATE_RESPONSE" | grep -q '"success":true'; then
  echo "✅ POST /api/assets works!"
  ASSET_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  echo "   Created asset ID: $ASSET_ID"
else
  echo "❌ POST /api/assets failed:"
  echo "$CREATE_RESPONSE"
fi

echo -e "\n4. Testing without token (should fail)..."
NO_TOKEN_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/assets)
if [ "$NO_TOKEN_CODE" = "401" ]; then
  echo "✅ Correctly returns 401 without token"
else
  echo "❌ Expected 401, got $NO_TOKEN_CODE"
fi

echo -e "\n5. Testing public routes..."
echo "   Home: $(curl -s http://localhost:3000/ | grep -o '"message":"[^"]*"')"
echo "   Health: $(curl -s http://localhost:3000/health | grep -o '"status":"[^"]*"')"
echo "   API Test: $(curl -s http://localhost:3000/api/test | grep -o '"message":"[^"]*"')"

echo -e "\n6. Creating sample data via public route..."
curl -s -X POST http://localhost:3000/api/test/create-sample | grep -o '"success":[^,]*'

echo -e "\n🎉 Authentication fix test completed!"
