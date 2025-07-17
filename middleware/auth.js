import { verifyToken } from '@clerk/backend';

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: 'Authentication required',
        code: 'AUTH_REQUIRED'
      });
    }

    const token = authHeader.substring(7);
    
    // Verify the token with Clerk
    const payload = await verifyToken(token, {
      jwtKey: process.env.CLERK_JWT_KEY,
      issuer: process.env.CLERK_ISSUER_URL,
    });

    // Add user info to request
    req.user = {
      id: payload.sub,
      email: payload.email,
      firstName: payload.first_name,
      lastName: payload.last_name
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ 
      error: 'Invalid or expired token',
      code: 'INVALID_TOKEN'
    });
  }
};

// Optional auth middleware for routes that can work with or without auth
const optionalAuthMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      
      const payload = await verifyToken(token, {
        jwtKey: process.env.CLERK_JWT_KEY,
        issuer: process.env.CLERK_ISSUER_URL,
      });

      req.user = {
        id: payload.sub,
        email: payload.email,
        firstName: payload.first_name,
        lastName: payload.last_name
      };
    }

    next();
  } catch (error) {
    // Continue without authentication for optional routes
    next();
  }
};

export { authMiddleware, optionalAuthMiddleware }; 