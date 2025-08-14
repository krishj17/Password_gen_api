# Arch Password Generator API

A professional, secure, and feature-rich password generation API built with Node.js and Express. Generate strong passwords with customizable complexity levels and built-in security features.

## 🚀 Features

- **Multiple Complexity Levels**: Simple, Standard, Complex, and Secure password types
- **Customizable Length**: Generate passwords from 4 to 100 characters
- **Batch Generation**: Generate multiple passwords in a single request
- **Password Strength Analysis**: Get detailed strength scores and feedback
- **Security Features**: Rate limiting, CORS protection, and security headers
- **Professional API Design**: RESTful endpoints with consistent response format
- **Health Monitoring**: Built-in health check endpoint

## 📡 Live API

**Base URL**: `https://your-api-domain.vercel.app`

## 🛠️ Installation & Setup

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/your-username/arch-password-generator-api.git
cd arch-password-generator-api
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. The API will be available at `http://localhost:3000`

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel --prod
```

## 📚 API Documentation

### Base Information

#### `GET /`
Returns API information and available endpoints.

**Response:**
```json
{
  "success": true,
  "data": {
    "name": "Arch Password Generator API",
    "version": "1.0.0",
    "description": "A professional password generation API with multiple complexity levels",
    "endpoints": { ... }
  }
}
```

### Password Generation

#### `GET /generate`
Generate a single password with query parameters.

**Query Parameters:**
- `length` (optional): Password length (4-100, default: 12)
- `type` (optional): Password type (`simple`, `standard`, `complex`, `secure`, default: `standard`)
- `exclude_ambiguous` (optional): Exclude ambiguous characters like 0, O, 1, I (`true`/`false`, default: `false`)

**Example:**
```
GET /generate?length=16&type=complex&exclude_ambiguous=true
```

**Response:**
```json
{
  "success": true,
  "data": {
    "password": "K7mP@9nX2$vQ8zR!",
    "length": 16,
    "type": "complex",
    "strength": {
      "score": 95,
      "level": "very_strong",
      "feedback": []
    },
    "excludedAmbiguous": true
  },
  "meta": {
    "generator": "Arch Password Generator API",
    "version": "1.0.0",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

#### `POST /generate`
Generate single or multiple passwords with advanced options.

**Request Body:**
```json
{
  "length": 16,
  "type": "secure",
  "exclude_ambiguous": false,
  "count": 3
}
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "password": "Kp8@mN7$vQ2zR!xY",
      "length": 16,
      "type": "secure",
      "strength": { ... }
    }
  ],
  "count": 3,
  "meta": { ... }
}
```

### Health Check

#### `GET /health`
Returns API health status and system information.

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "uptime": 3600.45,
    "memory": { ... },
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

## 🔐 Password Types

| Type | Characters | Use Case |
|------|------------|----------|
| `simple` | Lowercase + numbers | Basic passwords, temporary use |
| `standard` | Mixed case + numbers | General purpose passwords |
| `complex` | Mixed case + numbers + symbols | Strong passwords for important accounts |
| `secure` | All character types + extended symbols | Maximum security passwords |

## 🚦 Rate Limiting

- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## ⚡ Performance

- **Response Time**: < 100ms average
- **Batch Limit**: Maximum 10 passwords per request
- **Uptime**: 99.9% target

## 🔧 Error Handling

All errors follow a consistent format:

```json
{
  "success": false,
  "error": {
    "message": "Description of the error",
    "code": "ERROR_CODE"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Common Error Codes

- `GENERATION_ERROR`: Password generation failed
- `INVALID_LENGTH`: Invalid password length
- `NOT_FOUND`: Endpoint not found
- `BATCH_LIMIT_EXCEEDED`: Too many passwords requested
- `INTERNAL_ERROR`: Server error

## 🛡️ Security Features

- **Helmet.js**: Security headers protection
- **CORS**: Cross-origin request configuration  
- **Rate Limiting**: Prevent abuse and DDoS
- **Input Validation**: Sanitize and validate all inputs
- **Error Handling**: Secure error messages

## 📊 Usage Examples

### JavaScript/Node.js

```javascript
// Simple GET request
const response = await fetch('https://your-api-domain.vercel.app/generate?length=20&type=secure');
const data = await response.json();
console.log(data.data.password);

// Advanced POST request
const response = await fetch('https://your-api-domain.vercel.app/generate', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    length: 16,
    type: 'complex',
    count: 5,
    exclude_ambiguous: true
  })
});
```

### Python

```python
import requests

# Generate a single password
response = requests.get('https://your-api-domain.vercel.app/generate', 
                       params={'length': 16, 'type': 'complex'})
password = response.json()['data']['password']
print(password)
```

### cURL

```bash
# GET request
curl "https://your-api-domain.vercel.app/generate?length=20&type=secure"

# POST request
curl -X POST "https://your-api-domain.vercel.app/generate" \
  -H "Content-Type: application/json" \
  -d '{"length":16,"type":"complex","count":3}'
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Live API](https://your-api-domain.vercel.app)
- [GitHub Repository](https://github.com/your-username/arch-password-generator-api)
- [Issues](https://github.com/your-username/arch-password-generator-api/issues)

## 📞 Support

If you have any questions or need support, please [open an issue](https://github.com/your-username/arch-password-generator-api/issues) on GitHub.

---

Made with ❤️ by [Your Name]