# Error Codes Reference

Comprehensive reference for error codes and their meanings in the Salon Management System.

## Table of Contents
1. [Error Code Format](#error-code-format)
2. [Authentication Errors](#authentication-errors)
3. [Authorization Errors](#authorization-errors)
4. [API Errors](#api-errors)
5. [Database Errors](#database-errors)
6. [Network Errors](#network-errors)
7. [Validation Errors](#validation-errors)
8. [Platform Errors](#platform-errors)

---

## Error Code Format

Error codes follow the format: `XXX_YYYY_ZZZ`

- **XXX**: Error category (3 letters)
- **YYYY**: Error type (4 digits)
- **ZZZ**: Error identifier (3 digits)

### Categories

| Code | Category | Description |
|------|----------|-------------|
| AUTH | Authentication | Authentication-related errors |
| AUTHZ | Authorization | Authorization/permission errors |
| API | API | API-related errors |
| DB | Database | Database-related errors |
| NET | Network | Network-related errors |
| VAL | Validation | Input validation errors |
| PLAT | Platform | Platform-specific errors |
| SYS | System | System-level errors |

---

## Authentication Errors

### AUTH_0001: Invalid Credentials

**Description**: Provided email or password is incorrect.

**HTTP Status**: 401 Unauthorized

**Example Response**:
```json
{
  "error": {
    "code": "AUTH_0001",
    "message": "Invalid email or password",
    "details": {
      "field": "credentials"
    }
  }
}
```

**Solution**: Verify email and password are correct.

---

### AUTH_0002: User Not Found

**Description**: User account does not exist.

**HTTP Status**: 404 Not Found

**Example Response**:
```json
{
  "error": {
    "code": "AUTH_0002",
    "message": "User account not found",
    "details": {
      "email": "user@example.com"
    }
  }
}
```

**Solution**: Check if user exists or create a new account.

---

### AUTH_0003: Token Expired

**Description**: Authentication token has expired.

**HTTP Status**: 401 Unauthorized

**Example Response**:
```json
{
  "error": {
    "code": "AUTH_0003",
    "message": "Authentication token has expired",
    "details": {
      "expiredAt": "2026-05-09T10:00:00Z"
    }
  }
}
```

**Solution**: Refresh the authentication token.

---

### AUTH_0004: Token Invalid

**Description**: Authentication token is invalid or malformed.

**HTTP Status**: 401 Unauthorized

**Example Response**:
```json
{
  "error": {
    "code": "AUTH_0004",
    "message": "Invalid authentication token",
    "details": {}
  }
}
```

**Solution**: Re-authenticate the user.

---

### AUTH_0005: Account Locked

**Description**: User account has been locked due to security reasons.

**HTTP Status**: 403 Forbidden

**Example Response**:
```json
{
  "error": {
    "code": "AUTH_0005",
    "message": "Account has been locked",
    "details": {
      "lockedAt": "2026-05-09T10:00:00Z",
      "reason": "Too many failed login attempts"
    }
  }
}
```

**Solution**: Contact support to unlock the account.

---

### AUTH_0006: Email Not Verified

**Description**: User email has not been verified.

**HTTP Status**: 403 Forbidden

**Example Response**:
```json
{
  "error": {
    "code": "AUTH_0006",
    "message": "Email address not verified",
    "details": {
      "email": "user@example.com"
    }
  }
}
```

**Solution**: Verify the email address.

---

### AUTH_0007: Password Reset Required

**Description**: User must reset their password.

**HTTP Status**: 403 Forbidden

**Example Response**:
```json
{
  "error": {
    "code": "AUTH_0007",
    "message": "Password reset required",
    "details": {}
  }
}
```

**Solution**: Initiate password reset flow.

---

## Authorization Errors

### AUTHZ_0001: Permission Denied

**Description**: User does not have required permission.

**HTTP Status**: 403 Forbidden

**Example Response**:
```json
{
  "error": {
    "code": "AUTHZ_0001",
    "message": "Permission denied",
    "details": {
      "requiredPermission": "booking.create",
      "userRole": "CUSTOMER"
    }
  }
}
```

**Solution**: Check user permissions and role assignment.

---

### AUTHZ_0002: Role Not Assigned

**Description**: User does not have required role.

**HTTP Status**: 403 Forbidden

**Example Response**:
```json
{
  "error": {
    "code": "AUTHZ_0002",
    "message": "Required role not assigned",
    "details": {
      "requiredRole": "OWNER",
      "userRole": "STAFF"
    }
  }
}
```

**Solution**: Assign required role to user.

---

### AUTHZ_0003: Resource Access Denied

**Description**: User does not have access to requested resource.

**HTTP Status**: 403 Forbidden

**Example Response**:
```json
{
  "error": {
    "code": "AUTHZ_0003",
    "message": "Resource access denied",
    "details": {
      "resource": "salon",
      "resourceId": "123",
      "userId": "456"
    }
  }
}
```

**Solution**: Verify user has access to the resource.

---

### AUTHZ_0004: Salon Access Denied

**Description**: User does not have access to requested salon.

**HTTP Status**: 403 Forbidden

**Example Response**:
```json
{
  "error": {
    "code": "AUTHZ_0004",
    "message": "Salon access denied",
    "details": {
      "salonId": "123",
      "userId": "456"
    }
  }
}
```

**Solution**: Verify user is associated with the salon.

---

## API Errors

### API_0001: Invalid Request

**Description**: Request format is invalid.

**HTTP Status**: 400 Bad Request

**Example Response**:
```json
{
  "error": {
    "code": "API_0001",
    "message": "Invalid request format",
    "details": {
      "errors": [
        {
          "field": "email",
          "message": "Invalid email format"
        }
      ]
    }
  }
}
```

**Solution**: Fix request format and validation errors.

---

### API_0002: Missing Required Field

**Description**: Required field is missing from request.

**HTTP Status**: 400 Bad Request

**Example Response**:
```json
{
  "error": {
    "code": "API_0002",
    "message": "Required field missing",
    "details": {
      "field": "password"
    }
  }
}
```

**Solution**: Include all required fields in request.

---

### API_0003: Invalid Field Value

**Description**: Field value is invalid.

**HTTP Status**: 400 Bad Request

**Example Response**:
```json
{
  "error": {
    "code": "API_0003",
    "message": "Invalid field value",
    "details": {
      "field": "age",
      "value": "invalid",
      "expectedType": "number"
    }
  }
}
```

**Solution**: Provide valid field value.

---

### API_0004: Resource Not Found

**Description**: Requested resource does not exist.

**HTTP Status**: 404 Not Found

**Example Response**:
```json
{
  "error": {
    "code": "API_0004",
    "message": "Resource not found",
    "details": {
      "resource": "booking",
      "resourceId": "123"
    }
  }
}
```

**Solution**: Verify resource exists.

---

### API_0005: Resource Already Exists

**Description**: Resource already exists.

**HTTP Status**: 409 Conflict

**Example Response**:
```json
{
  "error": {
    "code": "API_0005",
    "message": "Resource already exists",
    "details": {
      "resource": "user",
      "field": "email",
      "value": "user@example.com"
    }
  }
}
```

**Solution**: Use different value or update existing resource.

---

### API_0006: Rate Limit Exceeded

**Description**: API rate limit has been exceeded.

**HTTP Status**: 429 Too Many Requests

**Example Response**:
```json
{
  "error": {
    "code": "API_0006",
    "message": "Rate limit exceeded",
    "details": {
      "limit": 100,
      "remaining": 0,
      "resetAt": "2026-05-09T11:00:00Z"
    }
  }
}
```

**Solution**: Wait before making more requests.

---

## Database Errors

### DB_0001: Connection Failed

**Description**: Database connection failed.

**HTTP Status**: 503 Service Unavailable

**Example Response**:
```json
{
  "error": {
    "code": "DB_0001",
    "message": "Database connection failed",
    "details": {}
  }
}
```

**Solution**: Check database connection and status.

---

### DB_0002: Query Failed

**Description**: Database query failed.

**HTTP Status**: 500 Internal Server Error

**Example Response**:
```json
{
  "error": {
    "code": "DB_0002",
    "message": "Database query failed",
    "details": {
      "query": "SELECT * FROM users WHERE id = $1",
      "error": "relation \"users\" does not exist"
    }
  }
}
```

**Solution**: Check query syntax and database schema.

---

### DB_0003: Constraint Violation

**Description**: Database constraint violation.

**HTTP Status**: 400 Bad Request

**Example Response**:
```json
{
  "error": {
    "code": "DB_0003",
    "message": "Database constraint violation",
    "details": {
      "constraint": "users_email_key",
      "table": "users"
    }
  }
}
```

**Solution**: Fix constraint violation in request data.

---

### DB_0004: Transaction Failed

**Description**: Database transaction failed.

**HTTP Status**: 500 Internal Server Error

**Example Response**:
```json
{
  "error": {
    "code": "DB_0004",
    "message": "Database transaction failed",
    "details": {}
  }
}
```

**Solution**: Retry the operation or check transaction logic.

---

## Network Errors

### NET_0001: Network Unavailable

**Description**: Network connection is unavailable.

**HTTP Status**: 503 Service Unavailable

**Example Response**:
```json
{
  "error": {
    "code": "NET_0001",
    "message": "Network connection unavailable",
    "details": {}
  }
}
```

**Solution**: Check network connection.

---

### NET_0002: Request Timeout

**Description**: Request timed out.

**HTTP Status**: 504 Gateway Timeout

**Example Response**:
```json
{
  "error": {
    "code": "NET_0002",
    "message": "Request timeout",
    "details": {
      "timeout": 30000
    }
  }
}
```

**Solution**: Retry the request or increase timeout.

---

### NET_0003: Server Unreachable

**Description**: Server is unreachable.

**HTTP Status**: 503 Service Unavailable

**Example Response**:
```json
{
  "error": {
    "code": "NET_0003",
    "message": "Server unreachable",
    "details": {
      "url": "https://api.example.com"
    }
  }
}
```

**Solution**: Check server status and URL.

---

### NET_0004: SSL Error

**Description**: SSL/TLS error occurred.

**HTTP Status**: 502 Bad Gateway

**Example Response**:
```json
{
  "error": {
    "code": "NET_0004",
    "message": "SSL/TLS error",
    "details": {
      "error": "certificate verify failed"
    }
  }
}
```

**Solution**: Check SSL certificate and configuration.

---

## Validation Errors

### VAL_0001: Invalid Email Format

**Description**: Email format is invalid.

**HTTP Status**: 400 Bad Request

**Example Response**:
```json
{
  "error": {
    "code": "VAL_0001",
    "message": "Invalid email format",
    "details": {
      "field": "email",
      "value": "invalid-email"
    }
  }
}
```

**Solution**: Provide valid email address.

---

### VAL_0002: Invalid Phone Format

**Description**: Phone number format is invalid.

**HTTP Status**: 400 Bad Request

**Example Response**:
```json
{
  "error": {
    "code": "VAL_0002",
    "message": "Invalid phone number format",
    "details": {
      "field": "phone",
      "value": "123"
    }
  }
}
```

**Solution**: Provide valid phone number.

---

### VAL_0003: Password Too Weak

**Description**: Password does not meet strength requirements.

**HTTP Status**: 400 Bad Request

**Example Response**:
```json
{
  "error": {
    "code": "VAL_0003",
    "message": "Password too weak",
    "details": {
      "requirements": [
        "Minimum 8 characters",
        "At least one uppercase letter",
        "At least one lowercase letter",
        "At least one number"
      ]
    }
  }
}
```

**Solution**: Provide stronger password.

---

### VAL_0004: Invalid Date Format

**Description**: Date format is invalid.

**HTTP Status**: 400 Bad Request

**Example Response**:
```json
{
  "error": {
    "code": "VAL_0004",
    "message": "Invalid date format",
    "details": {
      "field": "date",
      "value": "invalid-date",
      "expectedFormat": "YYYY-MM-DD"
    }
  }
}
```

**Solution**: Provide date in correct format.

---

### VAL_0005: Value Out of Range

**Description**: Value is outside allowed range.

**HTTP Status**: 400 Bad Request

**Example Response**:
```json
{
  "error": {
    "code": "VAL_0005",
    "message": "Value out of range",
    "details": {
      "field": "age",
      "value": 150,
      "min": 0,
      "max": 120
    }
  }
}
```

**Solution**: Provide value within allowed range.

---

## Platform Errors

### PLAT_0001: Android Build Failed

**Description**: Android build process failed.

**HTTP Status**: N/A

**Example Response**:
```json
{
  "error": {
    "code": "PLAT_0001",
    "message": "Android build failed",
    "details": {
      "error": "Compilation error",
      "file": "app/src/main/java/com/salonapp/MainActivity.java",
      "line": 42
    }
  }
}
```

**Solution**: Check build logs and fix compilation errors.

---

### PLAT_0002: iOS Build Failed

**Description**: iOS build process failed.

**HTTP Status**: N/A

**Example Response**:
```json
{
  "error": {
    "code": "PLAT_0002",
    "message": "iOS build failed",
    "details": {
      "error": "Code signing error",
      "file": "ios/Salon/AppDelegate.m"
    }
  }
}
```

**Solution**: Check code signing and build settings.

---

### PLAT_0003: Permission Denied

**Description**: App permission denied by user or system.

**HTTP Status**: N/A

**Example Response**:
```json
{
  "error": {
    "code": "PLAT_0003",
    "message": "Permission denied",
    "details": {
      "permission": "android.permission.CAMERA"
    }
  }
}
```

**Solution**: Request permission from user.

---

### PLAT_0004: Storage Full

**Description**: Device storage is full.

**HTTP Status**: N/A

**Example Response**:
```json
{
  "error": {
    "code": "PLAT_0004",
    "message": "Device storage full",
    "details": {
      "requiredSpace": 10485760,
      "availableSpace": 0
    }
  }
}
```

**Solution**: Free up device storage.

---

## System Errors

### SYS_0001: Internal Server Error

**Description**: Unexpected server error occurred.

**HTTP Status**: 500 Internal Server Error

**Example Response**:
```json
{
  "error": {
    "code": "SYS_0001",
    "message": "Internal server error",
    "details": {
      "requestId": "req_1234567890"
    }
  }
}
```

**Solution**: Contact support with request ID.

---

### SYS_0002: Service Unavailable

**Description**: Service is temporarily unavailable.

**HTTP Status**: 503 Service Unavailable

**Example Response**:
```json
{
  "error": {
    "code": "SYS_0002",
    "message": "Service temporarily unavailable",
    "details": {
      "retryAfter": 60
    }
  }
}
```

**Solution**: Retry the request after specified time.

---

### SYS_0003: Maintenance Mode

**Description**: System is in maintenance mode.

**HTTP Status**: 503 Service Unavailable

**Example Response**:
```json
{
  "error": {
    "code": "SYS_0003",
    "message": "System in maintenance mode",
    "details": {
      "estimatedDowntime": "2026-05-09T12:00:00Z"
    }
  }
}
```

**Solution**: Wait for maintenance to complete.

---

## Error Handling Best Practices

### 1. Always Check Error Codes

```typescript
try {
  const result = await apiCall();
} catch (error) {
  if (error.code === 'AUTH_0003') {
    // Handle token expired
    await refreshToken();
  } else if (error.code === 'AUTHZ_0001') {
    // Handle permission denied
    showPermissionError();
  } else {
    // Handle other errors
    showGenericError();
  }
}
```

### 2. Provide User-Friendly Messages

```typescript
function getErrorMessage(error: ApiError): string {
  const messages: Record<string, string> = {
    'AUTH_0001': 'Invalid email or password',
    'AUTH_0003': 'Session expired, please log in again',
    'AUTHZ_0001': 'You don\'t have permission to perform this action',
    'NET_0001': 'No internet connection',
  };

  return messages[error.code] || 'An error occurred';
}
```

### 3. Log Error Details

```typescript
function logError(error: ApiError) {
  console.error('Error occurred:', {
    code: error.code,
    message: error.message,
    details: error.details,
    timestamp: new Date().toISOString(),
  });
}
```

### 4. Implement Retry Logic

```typescript
async function retryWithBackoff(
  fn: () => Promise<any>,
  maxRetries = 3,
  delay = 1000
): Promise<any> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
    }
  }
}
```

---

## Next Steps

1. [Review Common Issues](common-issues.md)
2. [Check Debugging Guide](debugging.md)
3. [Review API Documentation](../api/README.md)

---

**Last Updated**: 2026-05-09
**Version**: 1.0.0
