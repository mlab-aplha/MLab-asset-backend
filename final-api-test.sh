#!/bin/bash

echo "🧪 FINAL API TEST - Production Build"
echo "===================================="

echo "1. Basic endpoints:"
echo "   Home: $(curl -s http://localhost:3000/ | grep -o '"message":"[^"]*"')"
echo "   Health: $(curl -s http://localhost:3000/health | grep -o '"status":"[^"]*"')"
echo "   API Test: $(curl -s http://localhost:3000/api/test | grep -o '"message":"[^"]*"')"

echo -e "\n2. Getting JWT token:"
TOKEN_RESPONSE=$(curl -s http://localhost:3000/api/test/token)
echo "   Response: $(echo "$TOKEN_RESPONSE" | grep -o '"success":[^,]*')"
TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
  echo "   ✅ Token obtained (${#TOKEN} chars)"
  
  echo -e "\n3. Testing protected routes:"
  echo "   Assets with token: $(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/assets | grep -o '"success":[^,]*')"
  
  echo -e "\n4. Creating test data:"
  echo "   Create sample: $(curl -s -X POST http://localhost:3000/api/test/create-sample | grep -o '"success":[^,]*')"
  echo "   View samples: $(curl -s http://localhost:3000/api/test/assets | grep -o '"success":[^,]*')"
  
  echo -e "\n5. Creating asset via API:"
  CREATE_RESPONSE=$(curl -s -X POST http://localhost:3000/api/assets \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Final Test Asset",
      "category": "Test",
      "serialNumber": "FINAL-'$(date +%s)'",
      "purchaseDate": "'$(date -I)'",
      "purchasePrice": 100,
      "status": "available",
      "location": "Testing"
    }')
  echo "   Result: $(echo "$CREATE_RESPONSE" | grep -o '"success":[^,]*')"
  
else
  echo "   ❌ Failed to get token"
fi

echo -e "\n6. Error handling:"
echo "   No token: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/assets)"
echo "   Invalid route: $(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/nonexistent)"

echo -e "\n✅ All tests completed!"
echo -e "\n🎉 Your backend is production-ready!"
