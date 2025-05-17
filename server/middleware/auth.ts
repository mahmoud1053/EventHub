import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { storage } from "../storage";

// JWT secret key
const JWT_SECRET = process.env.JWT_SECRET || "eventhub-jwt-secret-key";

// User interface for JWT payload
interface JwtPayload {
  userId: number;
  isAdmin: boolean;
}

// Extend Express Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: number;
        isAdmin: boolean;
      };
    }
  }
}

// Generate JWT token
export const generateToken = (userId: number, isAdmin: boolean): string => {
  return jwt.sign({ userId, isAdmin }, JWT_SECRET, {
    expiresIn: "24h",
  });
};

// Authentication middleware
export const authenticate = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get the token from the authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }
    
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
    
    // Add user to the request
    req.user = {
      userId: decoded.userId,
      isAdmin: decoded.isAdmin
    };
    
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Admin authorization middleware
export const authorizeAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ message: "Admin privileges required" });
  }
  next();
};

// User data middleware (attaches user data to req.user)
export const attachUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Get token from cookies or authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return next();
    }
    
    const token = authHeader.split(" ")[1];
    
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      
      // Add user to the request
      req.user = {
        userId: decoded.userId,
        isAdmin: decoded.isAdmin
      };
    } catch (err) {
      // Invalid token, but continue without user
    }
    
    next();
  } catch (error) {
    next();
  }
};
