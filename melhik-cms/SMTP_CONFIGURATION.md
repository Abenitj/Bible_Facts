# SMTP Configuration Management System

This system allows you to store and manage SMTP configurations in the database, which can then be fetched and used for sending emails throughout the application.

## Database Schema

The system uses a `SmtpConfig` model with the following fields:

- `id`: Unique identifier
- `name`: Configuration name (e.g., "Default", "Gmail", "Outlook")
- `host`: SMTP server host
- `port`: SMTP server port
- `secure`: Boolean for SSL/TLS
- `username`: SMTP username/email
- `password`: Encrypted SMTP password
- `fromEmail`: Default from email address
- `fromName`: Default from name (optional)
- `isActive`: Whether this config is active
- `createdAt`: Creation timestamp
- `updatedAt`: Last update timestamp
- `createdBy`: ID of user who created this config

## API Endpoints

### SMTP Configuration Management

#### GET `/api/smtp-config`
Fetch all SMTP configurations (passwords are not returned)

#### POST `/api/smtp-config`
Create a new SMTP configuration

**Request Body:**
```json
{
  "name": "Gmail SMTP",
  "host": "smtp.gmail.com",
  "port": 587,
  "secure": false,
  "username": "your-email@gmail.com",
  "password": "your-app-password",
  "fromEmail": "your-email@gmail.com",
  "fromName": "Your Name"
}
```

#### GET `/api/smtp-config/[id]`
Fetch a specific SMTP configuration

#### PUT `/api/smtp-config/[id]`
Update an SMTP configuration

#### DELETE `/api/smtp-config/[id]`
Delete an SMTP configuration

### SMTP Testing

#### POST `/api/smtp-config/test`
Test an SMTP configuration

**Request Body:**
```json
{
  "configId": 1,
  "testEmail": "test@example.com"
}
```

### Email Sending

#### POST `/api/email/send`
Send an email using the active SMTP configuration

**Request Body:**
```json
{
  "to": "recipient@example.com",
  "subject": "Test Email",
  "html": "<h1>Hello</h1><p>This is a test email.</p>",
  "text": "Hello\nThis is a test email."
}
```

#### GET `/api/email/send`
Check if there's an active SMTP configuration

## Usage Examples

### 1. Creating an SMTP Configuration

```javascript
const response = await fetch('/api/smtp-config', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Gmail SMTP',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    username: 'your-email@gmail.com',
    password: 'your-app-password',
    fromEmail: 'your-email@gmail.com',
    fromName: 'Your Name'
  })
})
```

### 2. Sending an Email

```javascript
const response = await fetch('/api/email/send', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    to: 'recipient@example.com',
    subject: 'Welcome to Melhik CMS',
    html: '<h1>Welcome!</h1><p>Thank you for joining our platform.</p>'
  })
})
```

### 3. Testing SMTP Configuration

```javascript
const response = await fetch('/api/smtp-config/test', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    configId: 1,
    testEmail: 'test@example.com'
  })
})
```

## Utility Functions

The system provides utility functions in `/src/lib/smtp.ts`:

- `getActiveSmtpConfig()`: Fetch the active SMTP configuration
- `getSmtpConfigById(id)`: Fetch a specific SMTP configuration
- `testSmtpConfig(configId)`: Test an SMTP configuration
- `sendEmail(configId, emailData)`: Send email using a specific config
- `sendEmailWithActiveConfig(emailData)`: Send email using active config
- `getAllSmtpConfigs()`: Get all SMTP configurations

## Security Features

1. **Password Encryption**: SMTP passwords are encrypted using bcrypt before storing in the database
2. **Authentication Required**: All API endpoints require valid JWT authentication
3. **No Password Exposure**: Passwords are never returned in API responses
4. **Validation**: All inputs are validated before processing

## Integration with Nodemailer

To fully implement email sending, you would need to:

1. Install nodemailer: `npm install nodemailer`
2. Update the `sendEmail` function in `/src/lib/smtp.ts` to use nodemailer
3. Handle password decryption (you might want to store encrypted passwords that can be decrypted)

## Example Nodemailer Integration

```javascript
import nodemailer from 'nodemailer'

// In the sendEmail function:
const transporter = nodemailer.createTransporter({
  host: config.host,
  port: config.port,
  secure: config.secure,
  auth: {
    user: config.username,
    pass: config.password // You'll need to decrypt this
  }
})

const result = await transporter.sendMail({
  from: `${config.fromName} <${config.fromEmail}>`,
  to: emailData.to,
  subject: emailData.subject,
  html: emailData.html,
  text: emailData.text
})
```

## Next Steps

1. Create a frontend interface for managing SMTP configurations
2. Implement actual email sending with nodemailer
3. Add email templates and scheduling
4. Add email logging and tracking
5. Implement email queue system for bulk sending
