#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

API_URL="http://localhost:8000"

echo "🧪 Testing Chawkbazar API"
echo "=========================="
echo ""

# Test counter
PASSED=0
FAILED=0

# Function to test endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local description=$3
    local data=$4
    local expected_code=$5
    
    echo -n "Testing: $description ... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$API_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$API_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" = "$expected_code" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
        return 0
    else
        echo -e "${RED}✗ FAILED${NC} (Expected $expected_code, got $http_code)"
        FAILED=$((FAILED + 1))
        return 1
    fi
}

# Check if server is running
echo "Checking if server is running..."
if ! curl -s "$API_URL/health" > /dev/null 2>&1; then
    echo -e "${RED}✗ Server is not running!${NC}"
    echo "Please start the backend server first: ./start-backend.sh"
    exit 1
fi
echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Test Health Check
echo "📊 Testing System Endpoints"
echo "----------------------------"
test_endpoint "GET" "/health" "Health check endpoint" "" "200"
test_endpoint "GET" "/api" "API info endpoint" "" "200"
echo ""

# Test Authentication
echo "🔐 Testing Authentication"
echo "-------------------------"
test_endpoint "POST" "/token" "Login with valid credentials" \
    '{"email":"admin@chawkbazar.com","password":"password"}' "200"

test_endpoint "POST" "/token" "Login with invalid credentials" \
    '{"email":"admin@chawkbazar.com","password":"wrong"}' "401"

test_endpoint "POST" "/register" "Register new user" \
    "{\"name\":\"Test User\",\"email\":\"test$(date +%s)@example.com\",\"password\":\"password123\"}" "201"

test_endpoint "POST" "/register" "Register with existing email" \
    '{"name":"Admin","email":"admin@chawkbazar.com","password":"password"}' "400"
echo ""

# Get token for authenticated requests
echo "🔑 Getting authentication token..."
TOKEN_RESPONSE=$(curl -s -X POST "$API_URL/token" \
    -H "Content-Type: application/json" \
    -d '{"email":"admin@chawkbazar.com","password":"password"}')
TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Failed to get token${NC}"
else
    echo -e "${GREEN}✓ Token obtained${NC}"
fi
echo ""

# Test Products
echo "📦 Testing Products API"
echo "-----------------------"
test_endpoint "GET" "/products" "Get all products" "" "200"
test_endpoint "GET" "/products?limit=5" "Get products with limit" "" "200"
test_endpoint "GET" "/products?search=jeans" "Search products" "" "200"
test_endpoint "GET" "/products/classic-denim-jeans" "Get single product" "" "200"
test_endpoint "GET" "/products/non-existent-slug" "Get non-existent product" "" "404"
test_endpoint "GET" "/popular-products" "Get popular products" "" "200"
echo ""

# Test Categories
echo "📂 Testing Categories API"
echo "-------------------------"
test_endpoint "GET" "/categories" "Get all categories" "" "200"
test_endpoint "GET" "/featured-categories" "Get featured categories" "" "200"
echo ""

# Test Types
echo "🏷️  Testing Types API"
echo "---------------------"
test_endpoint "GET" "/types" "Get all types" "" "200"
echo ""

# Test Shops
echo "🏪 Testing Shops API"
echo "--------------------"
test_endpoint "GET" "/shops" "Get all shops" "" "200"
echo ""

# Test Settings
echo "⚙️  Testing Settings API"
echo "------------------------"
test_endpoint "GET" "/settings" "Get settings" "" "200"
echo ""

# Test Authors & Manufacturers
echo "👥 Testing Authors & Manufacturers"
echo "----------------------------------"
test_endpoint "GET" "/top-authors" "Get top authors" "" "200"
test_endpoint "GET" "/top-manufacturers" "Get top manufacturers" "" "200"
echo ""

# Test Authenticated Endpoints
if [ ! -z "$TOKEN" ]; then
    echo "🔒 Testing Authenticated Endpoints"
    echo "----------------------------------"
    
    echo -n "Testing: Get current user ... "
    response=$(curl -s -w "\n%{http_code}" "$API_URL/me" \
        -H "Authorization: Bearer $TOKEN")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected 200, got $http_code)"
        FAILED=$((FAILED + 1))
    fi
    
    echo -n "Testing: Get admin list (requires auth) ... "
    response=$(curl -s -w "\n%{http_code}" "$API_URL/admin/list" \
        -H "Authorization: Bearer $TOKEN")
    http_code=$(echo "$response" | tail -n1)
    
    if [ "$http_code" = "200" ]; then
        echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
        PASSED=$((PASSED + 1))
    else
        echo -e "${RED}✗ FAILED${NC} (Expected 200, got $http_code)"
        FAILED=$((FAILED + 1))
    fi
    echo ""
fi

# Test Error Handling
echo "🚫 Testing Error Handling"
echo "-------------------------"
test_endpoint "GET" "/non-existent-route" "404 for non-existent route" "" "404"
echo ""

# Summary
echo "================================"
echo "📊 Test Summary"
echo "================================"
echo -e "Total Tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed${NC}"
    exit 1
fi
