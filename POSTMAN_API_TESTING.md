# 🚀 NetPilot Backend - Postman API Testing Guide

## 📋 **Base Configuration**

**Base URL**: `http://localhost:3000/api` (or whatever port your app is running on)

## 🔐 **Authentication Endpoints**

### 1. **User Registration**

**Endpoint**: `POST /api/auth/register`

**Headers**:
```
Content-Type: application/json
```

**Request Body** (JSON):
```json
{
  "email": "john.doe@example.com",
  "username": "johndoe",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Expected Response** (201 Created):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

### 2. **User Login**

**Endpoint**: `POST /api/auth/login`

**Headers**:
```
Content-Type: application/json
```

**Request Body** (JSON):
```json
{
  "usernameOrEmail": "john.doe@example.com",
  "password": "SecurePass123!"
}
```

**Alternative Request Body** (using username):
```json
{
  "usernameOrEmail": "johndoe",
  "password": "SecurePass123!"
}
```

**Expected Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "507f1f77bcf86cd799439011",
    "email": "john.doe@example.com",
    "username": "johndoe",
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

---

### 3. **Get User Profile** (Protected)

**Endpoint**: `GET /api/auth/profile`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**: None (GET request)

**Expected Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "isActive": true,
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "lastLogin": "2025-06-25T16:48:13.062Z",
  "createdAt": "2025-06-25T16:48:12.592Z",
  "updatedAt": "2025-06-25T16:48:13.063Z",
  "__v": 0
}
```

---

### 4. **User Logout** (Protected)

**Endpoint**: `POST /api/auth/logout`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**: None

**Expected Response** (200 OK):
```json
{
  "message": "Logged out successfully"
}
```

---

### 5. **Get Current User Details** (Protected)

**Endpoint**: `GET /api/users/me`

**Headers**:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json
```

**Request Body**: None (GET request)

**Expected Response** (200 OK):
```json
{
  "_id": "507f1f77bcf86cd799439011",
  "email": "john.doe@example.com",
  "username": "johndoe",
  "isActive": true,
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "lastLogin": "2025-06-25T16:48:13.062Z",
  "createdAt": "2025-06-25T16:48:12.592Z",
  "updatedAt": "2025-06-25T16:48:13.063Z",
  "__v": 0
}
```

## 🧪 **Test Scenarios**

### **Scenario 1: Valid Registration**
```json
POST /api/auth/register
{
  "email": "alice@example.com",
  "username": "alice123",
  "password": "MySecure123!",
  "firstName": "Alice",
  "lastName": "Smith"
}
```

### **Scenario 2: Invalid Email Format**
```json
POST /api/auth/register
{
  "email": "invalid-email",
  "username": "testuser",
  "password": "Test123!@#"
}
```
**Expected**: 400 Bad Request with validation errors

### **Scenario 3: Weak Password**
```json
POST /api/auth/register
{
  "email": "test@example.com",
  "username": "testuser",
  "password": "weak"
}
```
**Expected**: 400 Bad Request with password validation errors

### **Scenario 4: Duplicate Email**
```json
POST /api/auth/register
{
  "email": "john.doe@example.com",
  "username": "newuser",
  "password": "Test123!@#"
}
```
**Expected**: 409 Conflict - Email already exists

### **Scenario 5: Invalid Login Credentials**
```json
POST /api/auth/login
{
  "usernameOrEmail": "john.doe@example.com",
  "password": "wrongpassword"
}
```
**Expected**: 401 Unauthorized

### **Scenario 6: Access Protected Route Without Token**
```
GET /api/auth/profile
(No Authorization header)
```
**Expected**: 401 Unauthorized

## 📝 **Password Requirements**

Passwords must meet these criteria:
- ✅ Minimum 8 characters
- ✅ At least one uppercase letter (A-Z)
- ✅ At least one lowercase letter (a-z)
- ✅ At least one number (0-9)
- ✅ At least one special character (@$!%*?&)

**Valid Password Examples**:
- `SecurePass123!`
- `MyPassword1@`
- `Test123!@#`
- `Strong2024$`

**Invalid Password Examples**:
- `password` (no uppercase, number, special char)
- `PASSWORD123` (no lowercase, special char)
- `Pass123` (too short, no special char)
- `Password!` (no number)

## 🔑 **Username Requirements**

- ✅ 3-30 characters long
- ✅ Only letters, numbers, and underscores
- ✅ Must be unique

**Valid Username Examples**:
- `johndoe`
- `user_123`
- `alice_smith`
- `test_user_2024`

**Invalid Username Examples**:
- `jo` (too short)
- `user-name` (contains hyphen)
- `user@name` (contains special chars)

## 🚨 **Common Error Responses**

### **400 Bad Request - Validation Error**
```json
{
  "statusCode": 400,
  "message": [
    "Please provide a valid email address",
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character",
    "Password must be at least 8 characters long"
  ],
  "error": "Bad Request"
}
```

### **401 Unauthorized**
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### **409 Conflict - Duplicate User**
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

### **429 Too Many Requests - Rate Limit**
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

## 🔄 **Testing Workflow**

1. **Register a new user** → Save the `access_token`
2. **Login with the same user** → Verify token is returned
3. **Access protected routes** → Use the token in Authorization header
4. **Test validation errors** → Try invalid data
5. **Test duplicate registration** → Try registering same email/username
6. **Test invalid login** → Try wrong credentials
7. **Test protected routes without token** → Should get 401

## 💡 **Postman Tips**

1. **Environment Variables**: Create variables for:
   - `baseUrl`: `http://localhost:3000/api`
   - `accessToken`: Save token from login response

2. **Auto-save Token**: In login request, add to Tests tab:
   ```javascript
   pm.test("Save access token", function () {
       var jsonData = pm.response.json();
       pm.environment.set("accessToken", jsonData.access_token);
   });
   ```

3. **Use Token in Headers**: For protected routes:
   ```
   Authorization: Bearer {{accessToken}}
   ```
