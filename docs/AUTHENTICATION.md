# NetPilot Backend - Authentication System

## Overview

The NetPilot Backend includes a comprehensive authentication system built with NestJS, MongoDB, and JWT tokens. This system provides secure user registration, login, and session management with industry-standard security practices.

## Features

### 🔐 Security Features
- **Password Hashing**: bcrypt with 12 rounds (configurable)
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Comprehensive request validation using class-validator
- **Rate Limiting**: Throttling for authentication endpoints
- **CORS Protection**: Configurable cross-origin resource sharing
- **Password Strength Requirements**: Enforced complexity rules

### 📊 Database Features
- **MongoDB Integration**: Using Mongoose ODM
- **User Schema**: Comprehensive user model with validation
- **Indexes**: Optimized database queries
- **Unique Constraints**: Email and username uniqueness

### 🛡️ API Security
- **Global Validation Pipes**: Automatic request validation
- **Error Handling**: Secure error responses without sensitive data exposure
- **Session Management**: JWT-based stateless authentication

## API Endpoints

### Authentication Routes (`/api/auth`)

#### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

**Response:**
```json
{
  "access_token": "jwt-token-here",
  "user": {
    "id": "user-id",
    "email": "user@example.com",
    "username": "username",
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

**Rate Limit:** 5 requests per minute

#### POST `/api/auth/login`
Authenticate user and receive access token.

**Request Body:**
```json
{
  "usernameOrEmail": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Same as registration

**Rate Limit:** 10 requests per minute

#### GET `/api/auth/profile`
Get current user profile (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "id": "user-id",
  "email": "user@example.com",
  "username": "username",
  "profile": {
    "firstName": "John",
    "lastName": "Doe"
  },
  "lastLogin": "2023-12-01T10:00:00.000Z",
  "createdAt": "2023-11-01T10:00:00.000Z"
}
```

#### POST `/api/auth/logout`
Logout user (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

### User Routes (`/api/users`)

#### GET `/api/users/me`
Get current user information (requires authentication).

**Headers:**
```
Authorization: Bearer <jwt-token>
```

## Password Requirements

Passwords must meet the following criteria:
- Minimum 8 characters
- At least one uppercase letter (A-Z)
- At least one lowercase letter (a-z)
- At least one number (0-9)
- At least one special character (@$!%*?&)

## Username Requirements

Usernames must meet the following criteria:
- 3-30 characters long
- Only letters, numbers, and underscores allowed
- Must be unique across the system

## Email Requirements

- Must be a valid email format
- Must be unique across the system
- Automatically converted to lowercase

## Environment Configuration

Create a `.env` file based on `.env.example`:

```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/netpilot

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=24h

# Application Configuration
NODE_ENV=development
PORT=3000

# Frontend Configuration
FRONTEND_URL=http://localhost:3001
```

## Error Responses

### Validation Errors (400)
```json
{
  "statusCode": 400,
  "message": [
    "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
  ],
  "error": "Bad Request"
}
```

### Authentication Errors (401)
```json
{
  "statusCode": 401,
  "message": "Invalid credentials",
  "error": "Unauthorized"
}
```

### Conflict Errors (409)
```json
{
  "statusCode": 409,
  "message": "Email already exists",
  "error": "Conflict"
}
```

### Rate Limit Errors (429)
```json
{
  "statusCode": 429,
  "message": "ThrottlerException: Too Many Requests",
  "error": "Too Many Requests"
}
```

## Testing

### Unit Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### Test Coverage
```bash
npm run test:cov
```

## Security Considerations

1. **JWT Secret**: Use a strong, random secret in production
2. **Database Security**: Ensure MongoDB is properly secured
3. **HTTPS**: Always use HTTPS in production
4. **Rate Limiting**: Adjust rate limits based on your needs
5. **Password Policy**: Consider implementing additional password policies
6. **Token Expiration**: Configure appropriate token expiration times
7. **Refresh Tokens**: Consider implementing refresh tokens for better security

## Database Schema

### User Collection
```javascript
{
  _id: ObjectId,
  email: String (unique, required),
  username: String (unique, required),
  password: String (hashed, required),
  profile: {
    firstName: String,
    lastName: String,
    avatar: String
  },
  lastLogin: Date,
  isActive: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

### Indexes
- `email` (unique)
- `username` (unique)
- `createdAt` (descending)

## Development

### Adding New Authentication Features

1. **Extend User Schema**: Modify `src/users/schemas/user.schema.ts`
2. **Update DTOs**: Modify relevant DTOs in `src/auth/dto/` and `src/users/dto/`
3. **Update Services**: Extend `AuthService` or `UsersService`
4. **Add Routes**: Update controllers as needed
5. **Write Tests**: Add corresponding unit and e2e tests

### Custom Authentication Guards

Create custom guards by extending the base guards:

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

@Injectable()
export class CustomAuthGuard extends JwtAuthGuard {
  canActivate(context: ExecutionContext) {
    // Custom logic here
    return super.canActivate(context);
  }
}
```
