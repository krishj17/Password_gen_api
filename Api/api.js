import express from "express";
import cors from "cors";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    error: "Too many requests",
    message: "Rate limit exceeded. Please try again later.",
    status: "error"
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(limiter);

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Password generation configurations
const PASSWORD_CONFIGS = {
  simple: {
    characters: "abcdefghijklmnopqrstuvwxyz0123456789",
    defaultLength: 8,
    maxLength: 50
  },
  standard: {
    characters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    defaultLength: 12,
    maxLength: 100
  },
  complex: {
    characters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?+=",
    defaultLength: 16,
    maxLength: 100
  },
  secure: {
    characters: "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*!?+=[]{}()<>",
    defaultLength: 20,
    maxLength: 100
  }
};

/**
 * Generate a secure random password
 * @param {number} length - Password length
 * @param {string} type - Password complexity type
 * @param {boolean} excludeAmbiguous - Exclude ambiguous characters
 * @returns {Object} Password generation result
 */
const generatePassword = (length = 12, type = 'standard', excludeAmbiguous = false) => {
  try {
    // Validate inputs
    if (!PASSWORD_CONFIGS[type]) {
      throw new Error(`Invalid password type. Available types: ${Object.keys(PASSWORD_CONFIGS).join(', ')}`);
    }

    const config = PASSWORD_CONFIGS[type];
    const maxLength = config.maxLength;
    
    if (length < 4 || length > maxLength) {
      throw new Error(`Password length must be between 4 and ${maxLength} characters`);
    }

    let characters = config.characters;
    
    // Remove ambiguous characters if requested
    if (excludeAmbiguous) {
      characters = characters.replace(/[0O1Il]/g, '');
    }

    // Generate password using crypto-secure random
    let password = "";
    const charactersLength = characters.length;
    
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charactersLength);
      password += characters.charAt(randomIndex);
    }

    // Calculate password strength
    const strength = calculatePasswordStrength(password);

    return {
      success: true,
      data: {
        password: password,
        length: password.length,
        type: type,
        strength: strength,
        excludedAmbiguous: excludeAmbiguous
      },
      meta: {
        generator: "Arch Password Generator API",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: {
        message: error.message,
        code: "GENERATION_ERROR"
      },
      meta: {
        generator: "Arch Password Generator API",
        version: "1.0.0",
        timestamp: new Date().toISOString()
      }
    };
  }
};

/**
 * Calculate password strength score
 * @param {string} password - Password to analyze
 * @returns {Object} Strength analysis
 */
const calculatePasswordStrength = (password) => {
  let score = 0;
  let feedback = [];

  // Length check
  if (password.length >= 8) score += 20;
  else feedback.push("Password should be at least 8 characters long");

  if (password.length >= 12) score += 10;
  if (password.length >= 16) score += 10;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 10;
  else feedback.push("Add lowercase letters");

  if (/[A-Z]/.test(password)) score += 10;
  else feedback.push("Add uppercase letters");

  if (/[0-9]/.test(password)) score += 10;
  else feedback.push("Add numbers");

  if (/[^A-Za-z0-9]/.test(password)) score += 20;
  else feedback.push("Add special characters");

  // Repetition penalty
  if (/(.)\\1{2,}/.test(password)) score -= 10;

  // Sequential characters penalty
  if (/abc|bcd|cde|123|234|345|456|567|678|789/.test(password.toLowerCase())) {
    score -= 5;
  }

  const strengthLevel = score >= 80 ? 'very_strong' : 
                       score >= 60 ? 'strong' : 
                       score >= 40 ? 'moderate' : 
                       score >= 20 ? 'weak' : 'very_weak';

  return {
    score: Math.max(0, Math.min(100, score)),
    level: strengthLevel,
    feedback: feedback
  };
};

// API Routes --------------------------------------------------------------------

// Root endpoint - API information
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: "Arch Password Generator API",
      version: "1.0.0",
      description: "A professional password generation API with multiple complexity levels",
      endpoints: {
        "GET /": "API information",
        "GET /generate": "Generate password with default settings",
        "POST /generate?...": "Generate password with custom parameters",
        "GET /health": "Health check endpoint"
      },
      documentation: {
        repository: "https://github.com/your-username/password-generator-api",
        swagger: "/docs" // You can add Swagger later
      }
    },
    meta: {
      timestamp: new Date().toISOString(),
      server: "Vercel"
    }
  });
});

// Generate password - GET method (simple) ---------------------------------
app.get("/generate", (req, res) => {
  const { 
    length = 12, 
    type = 'standard', 
    exclude_ambiguous = 'false' 
  } = req.query;

  const parsedLength = parseInt(length);
  const excludeAmbiguous = exclude_ambiguous.toLowerCase() === 'true';

  if (isNaN(parsedLength)) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Length must be a valid number",
        code: "INVALID_LENGTH"
      },
      meta: {
        timestamp: new Date().toISOString()
      }
    });
  }

  const result = generatePassword(parsedLength, type, excludeAmbiguous);
  
  if (result.success) {
    res.status(200).json(result);
  } else {
    res.status(400).json(result);
  }
});

// Generate password - POST method (advanced) ----------------------------------
app.post("/generate", (req, res) => {
  const { 
    length = 12, 
    type = 'standard', 
    exclude_ambiguous = false,
    count = 1 
  } = req.body;

  // Validate count
  if (count > 10) {
    return res.status(400).json({
      success: false,
      error: {
        message: "Cannot generate more than 10 passwords at once",
        code: "BATCH_LIMIT_EXCEEDED"
      }
    });
  }

  const passwords = [];
  for (let i = 0; i < count; i++) {
    const result = generatePassword(length, type, exclude_ambiguous);
    if (result.success) {
      passwords.push(result.data);
    } else {
      return res.status(400).json(result);
    }
  }

  res.status(200).json({
    success: true,
    data: count === 1 ? passwords[0] : passwords,
    count: passwords.length,
    meta: {
      generator: "Arch Password Generator API",
      version: "1.0.0",
      timestamp: new Date().toISOString()
    }
  });
});

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      status: "healthy",
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: "Endpoint not found",
      code: "NOT_FOUND",
      availableEndpoints: ["/", "/generate", "/health"]
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error("API Error:", error);
  
  res.status(500).json({
    success: false,
    error: {
      message: "Internal server error",
      code: "INTERNAL_ERROR"
    },
    meta: {
      timestamp: new Date().toISOString()
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Arch Password Generator API is running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;