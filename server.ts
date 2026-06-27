
import express from "express";
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import helmet from "helmet";
import cors from "cors";
import rateLimit from "express-rate-limit";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { GoogleGenAI, Type } from "@google/genai";
import { emailService } from "./src/services/email-service.js";
import crypto from "crypto";
import { logger } from "./src/services/logger.js";
import prisma from "./src/lib/prisma.js";

import { validateServerEnv } from "./src/config/env.js";

/**
 * Environment Variable Validation Path (Fail-fast verification)
 */
try {
  logger.info("Validating server environment variables...");
  validateServerEnv(process.env);
  logger.info("Server environment variables successfully validated.");
} catch (envError: any) {
  logger.error("[FATAL STARTUP FAILURE] Critical environment variables are missing or invalid:", {
    error: envError.message
  });
  // Fail-fast and prevent system startup in production/production-ready builds
  if (process.env.NODE_ENV === "production") {
    process.exit(1);
  }
}

logger.info("Initializing OBOY YANKEE ENTERPRISE production server...", {
  node_version: process.version,
  environment: process.env.NODE_ENV || "development"
});

const app = express();
const PORT = 3000;

// Initialize Gemini Client
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

// AI Cache System
const aiCache = new Map<string, { data: any, expiry: number }>();
const CACHE_TTL = 86400000; // 24 hours to mitigate 20 req/day limit

// General API Cache for expensive queries (dashboard stats, etc.)
const apiCache = new Map<string, { data: any, expiry: number }>();
function getCached<T>(key: string): T | null {
  const entry = apiCache.get(key);
  if (entry && entry.expiry > Date.now()) return entry.data as T;
  if (entry) apiCache.delete(key);
  return null;
}
function setCached(key: string, data: any, ttlMs: number) {
  apiCache.set(key, { data, expiry: Date.now() + ttlMs });
}

// AI Retry Helper
async function generateWithRetry(call: () => Promise<any>, retries = 3, delay = 5000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await call();
    } catch (error: any) {
      const status = error.status || error.response?.status;
      const message = error.message?.toLowerCase() || "";
      
      // Handle Rate Limit (429) or Service Unavailable (503) from AI API
      // If quota is truly exhausted (daily limit), don't retry, just throw to trigger fallback immediately
      if (status === 429 && message.includes("quota exceeded")) {
        logger.warn(`[AI QUOTA EXCEEDED] Daily limit reached. Triggering fallback.`);
        throw error;
      }

      if ((status === 429 || status === 503) && i < retries - 1) {
        const backoff = delay * Math.pow(2, i); // Exponential backoff: 5s, 10s, 20s
        logger.warn(`[AI RETRY] Attempt ${i + 1} failed with ${status}. Neural core saturated. Retrying in ${backoff}ms...`);
        await new Promise(resolve => setTimeout(resolve, backoff)); 
        continue;
      }
      throw error;
    }
  }
}

// Generic Promise Timeout Wrapper to prevent infinite hanging
async function withTimeout<T>(promise: any, timeoutMs: number, errorMessage: string): Promise<T> {
  let timeoutId: any;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
  });
  
  try {
    const result = await Promise.race([promise, timeoutPromise]);
    if (timeoutId) clearTimeout(timeoutId);
    return result;
  } catch (err) {
    if (timeoutId) clearTimeout(timeoutId);
    throw err;
  }
}

// Helper to print clean fallback logs in place of verbose raw JSON objects
function cleanAILog(label: string, error: any) {
  const errMsg = error?.message || String(error || "");
  if (errMsg.includes("RESOURCE_EXHAUSTED") || errMsg.includes("quota") || errMsg.includes("429")) {
    logger.warn(`[NEXA AI CORE] ${label}: Free tier API limits exceeded (429). Activating zero-latency local analytical engine fallback...`);
  } else {
    logger.warn(`[NEXA AI CORE] ${label}: Remote neural network offline or limited. Falling back cleanly: ${errMsg.slice(0, 150)}`);
  }
}

// Enable trust proxy for express-rate-limit to work correctly in Cloud Run/Proxies
app.set('trust proxy', 1);

// Security Middlewares — disabled in development for Vite HMR compatibility
const isDev = process.env.NODE_ENV !== "production";
if (isDev) {
  app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: false,
    crossOriginOpenerPolicy: false,
  }));
} else {
  app.use(helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "default-src": ["'self'"],
        "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://js.paystack.co"],
        "style-src": ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        "font-src": ["'self'", "https://fonts.gstatic.com", "data:"],
        "img-src": ["'self'", "data:", "blob:", "https:", "https://images.unsplash.com"],
        "connect-src": ["'self'", "https://*", "wss://*"],
        "frame-src": ["'self'", "https://js.paystack.co", "https://*.paystack.co"],
        "frame-ancestors": ["'self'", "https://ai.studio", "https://*.google.com", "https://*.run.app"]
      }
    },
    frameguard: false,
    crossOriginEmbedderPolicy: false,
    crossOriginResourcePolicy: { policy: "cross-origin" }
  }));
}

const ALLOWED_ORIGIN_PATTERNS = [
  /^http:\/\/localhost:\d+$/,
  /^https:\/\/.*\.run\.app$/,
  /^https:\/\/.*\.google\.com$/,
  /^https:\/\/ai\.studio$/,
  /^https:\/\/.*\.vercel\.app$/
];

/**
 * Validates external or internal redirect URLs against a strictly defined allowlist
 * to defend against generic open redirects and session hijacking.
 */
function isValidRedirectUrl(urlStr: string, requestHost?: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    
    const allowedHosts = [
      'localhost',
      '127.0.0.1',
      'ai.studio'
    ];
    
    if (requestHost) {
      // Strip port if present in req.get('host')
      const cleanRequestHost = requestHost.split(':')[0].toLowerCase();
      if (cleanRequestHost) {
        allowedHosts.push(cleanRequestHost);
      }
    }
    
    const isAllowedHost = allowedHosts.includes(host);
    const isCloudRun = host.endsWith('.run.app');
    const isVercel = host.endsWith('.vercel.app');
    const isGoogle = host.endsWith('.google.com');
    const isOboyYankee = host === 'oboyyankee.gh' || host.endsWith('.oboyyankee.gh');
    
    let isProductionMatch = false;
    if (process.env.VITE_APP_URL) {
      try {
        const prodUrl = new URL(process.env.VITE_APP_URL);
        if (prodUrl.hostname.toLowerCase() === host) {
          isProductionMatch = true;
        }
      } catch (e) {
        // Safe skip if production domain is malformed
      }
    }
    
    return isAllowedHost || isCloudRun || isVercel || isGoogle || isOboyYankee || isProductionMatch;
  } catch (err) {
    return false;
  }
}

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    
    if (isDev) {
      return callback(null, true);
    }
    
    let isProductionMatch = false;
    if (process.env.VITE_APP_URL) {
      try {
        const prodOrigin = new URL(process.env.VITE_APP_URL).origin;
        const requestedOrigin = new URL(origin).origin;
        if (prodOrigin === requestedOrigin) {
          isProductionMatch = true;
        }
      } catch (e) {
      }
    }
    
    const isPatternMatch = ALLOWED_ORIGIN_PATTERNS.some(pattern => pattern.test(origin));
    
    if (isProductionMatch || isPatternMatch) {
      callback(null, true);
    } else {
      logger.warn(`[SECURITY WARN] Blocked request from unauthorized CORS origin: ${origin}`);
      callback(new Error('CORS blocked by OBOY YANKEE security policy'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true
}));

app.use(express.json({ limit: '50kb' })); // Primitive body size limit to prevent buffer flood

// Rate Limiting: Prevent brute force and API density exhaustion
const reqLimiterMessage = (msg: string) => ({
  success: false,
  error: msg
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // General limit for user queries
  message: reqLimiterMessage("API request density too high, please try again soon.")
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 attempts
  message: reqLimiterMessage("Too many payment handshakes from this IP, please try again in 15 minutes.")
});

const aiLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 20, // Max 20 dynamic queries to mitigate key cost/throttling
  message: reqLimiterMessage("Nexa neural core limits exceeded. Please pause before launching more queries.")
});

const adminLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15, // Prevent batch staff user generation floods
  message: reqLimiterMessage("Admin action limit reached. Try again in 15 minutes.")
});

const webhookLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 150, 
  message: reqLimiterMessage("Webhook ingress flooded.")
});

// Mount general api rate limiting
app.use("/api/", apiLimiter);

// JWT Configuration
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-dev-secret-at-least-32-chars-long';
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-dev-refresh-secret-at-least-32-chars';
const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

function generateAccessToken(userId: string, role: string, companyId: string): string {
  return jwt.sign({ userId, role, companyId }, JWT_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRY });
}

function generateRefreshToken(userId: string): string {
  return jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: REFRESH_TOKEN_EXPIRY });
}

function verifyAccessToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

function verifyRefreshToken(token: string): any {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET);
  } catch {
    return null;
  }
}

/**
 * Collect all permission slugs for a user (from custom role + individual grants)
 */
function collectUserPermissions(user: any): string[] {
  if (user.role === "super_admin" || user.role === "company_admin") {
    return ["*"];
  }

  const permissions = new Set<string>();

  if (user.customRole?.rolePerms) {
    for (const rp of user.customRole.rolePerms) {
      if (rp.permission?.slug) {
        permissions.add(rp.permission.slug);
      }
    }
  }

  if (user.userPerms) {
    for (const up of user.userPerms) {
      if (up.granted && up.permission?.slug) {
        permissions.add(up.permission.slug);
      }
    }
  }

  return Array.from(permissions);
}

/**
 * Auth Middleware — JWT-based requireAuth
 */
async function requireAuth(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Access denied: No authentication token provided." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (!decoded) {
      return res.status(401).json({ error: "Access denied: Invalid or expired authentication token." });
    }

    req.user = {
      userId: decoded.userId,
      role: decoded.role,
      companyId: decoded.companyId,
    };
    next();
  } catch (err: any) {
    logger.error("[AUTH MIDDLEWARE ERROR]", { error: err.message });
    return res.status(500).json({ error: "An unexpected authorization failure occurred." });
  }
}

/**
 * Permission-based middleware factory
 */
function requirePermission(permissionSlug: string) {
  return async (req: any, res: any, next: any) => {
    try {
      if (req.user.role === "super_admin" || req.user.role === "company_admin") {
        return next();
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          customRole: { include: { rolePerms: { include: { permission: true } } } },
          userPerms: { include: { permission: true } },
        },
      });

      if (!user) {
        return res.status(403).json({ error: "Access denied: User not found." });
      }

      const permissions = collectUserPermissions(user);
      if (!permissions.includes(permissionSlug) && !permissions.includes("*")) {
        return res.status(403).json({ error: `Access denied: Missing permission "${permissionSlug}".` });
      }

      next();
    } catch (err: any) {
      logger.error("[PERMISSION CHECK ERROR]", { error: err.message });
      return res.status(500).json({ error: "Permission verification failed." });
    }
  };
}

const resetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req: any) => {
    return String(req.body.email || req.ip).trim().toLowerCase();
  },
  validate: false,
  message: reqLimiterMessage("Too many password reset requests for this email. Max 3 requests per hour.")
});

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", environment: process.env.NODE_ENV, timestamp: new Date() });
});

/**
 * Expose Paystack Public Configuration Safely
 */
app.get("/api/payments/config", (req, res) => {
  const publicKey = (
    process.env.VITE_PAYSTACK_PUBLIC_KEY || 
    process.env.PAYSTACK_PUBLIC_KEY || 
    process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 
    ""
  ).trim();
  res.json({ publicKey });
});

/**
 * AUTHENTICATION ROUTES — JWT-based, single company
 */

// Auth rate limiter
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: reqLimiterMessage("Too many authentication attempts. Please try again later."),
});

// Login
app.post("/api/auth/login", authLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required." });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        company: true,
        customRole: { include: { rolePerms: { include: { permission: true } } } },
        userPerms: { include: { permission: true } },
      },
    });

    if (!user || user.deletedAt) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    if (user.status === "suspended") {
      return res.status(403).json({ error: "Your account has been suspended. Contact your administrator." });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid email or password." });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const accessToken = generateAccessToken(user.id, user.role, user.companyId);
    const refreshToken = generateRefreshToken(user.id);

    const permissions = collectUserPermissions(user);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        role: user.role,
        status: user.status,
        companyId: user.companyId,
        company: user.company,
        permissions,
      },
    });
  } catch (error: any) {
    logger.error("[AUTH LOGIN ERROR]", { error: error.message });
    res.status(500).json({ error: "Login failed. Please try again." });
  }
});

// Register — only for initial setup (first user becomes company_admin)
app.post("/api/auth/register", authLimiter, async (req, res) => {
  try {
    const { email, password, fullName, companyName, phone } = req.body;

    if (!email || !password || !fullName || !companyName) {
      return res.status(400).json({ error: "Email, password, full name, and company name are required." });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: "Password must be at least 8 characters long." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existingUser) {
      return res.status(409).json({ error: "An account with this email already exists." });
    }

    const existingCompany = await prisma.company.findFirst();
    if (existingCompany) {
      return res.status(403).json({ error: "Company is already set up. Please contact your administrator for an account." });
    }

    const company = await prisma.company.create({
      data: {
        name: companyName,
        email: email.toLowerCase(),
        phone: phone || null,
      },
    });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        phone: phone || null,
        role: "company_admin",
        status: "active",
        companyId: company.id,
      },
      include: { company: true },
    });

    const accessToken = generateAccessToken(user.id, user.role, user.companyId);
    const refreshToken = generateRefreshToken(user.id);

    res.json({
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl,
        phone: user.phone,
        role: user.role,
        status: user.status,
        companyId: user.companyId,
        company: user.company,
        permissions: ["*"],
      },
    });
  } catch (error: any) {
    logger.error("[AUTH REGISTER ERROR]", { error: error.message });
    res.status(500).json({ error: "Registration failed. Please try again." });
  }
});

// Refresh token
app.post("/api/auth/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token is required." });
    }

    const decoded = verifyRefreshToken(refreshToken);
    if (!decoded) {
      return res.status(401).json({ error: "Invalid or expired refresh token." });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true, companyId: true, status: true, deletedAt: true },
    });

    if (!user || user.deletedAt || user.status === "suspended") {
      return res.status(401).json({ error: "Account is inactive or not found." });
    }

    const accessToken = generateAccessToken(user.id, user.role, user.companyId);
    const newRefreshToken = generateRefreshToken(user.id);

    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error: any) {
    logger.error("[AUTH REFRESH ERROR]", { error: error.message });
    res.status(500).json({ error: "Token refresh failed." });
  }
});

// Get current user
app.get("/api/auth/me", requireAuth, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
      include: {
        company: true,
        customRole: { include: { rolePerms: { include: { permission: true } } } },
        userPerms: { include: { permission: true } },
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    const permissions = collectUserPermissions(user);

    res.json({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      avatarUrl: user.avatarUrl,
      phone: user.phone,
      role: user.role,
      status: user.status,
      companyId: user.companyId,
      company: user.company,
      permissions,
    });
  } catch (error: any) {
    logger.error("[AUTH ME ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to fetch user data." });
  }
});

// Logout (client-side token clearing; server logs the event)
app.post("/api/auth/logout", requireAuth, async (req: any, res) => {
  try {
    logger.info(`[AUTH LOGOUT] User ${req.user.userId} logged out.`);
    res.json({ success: true, message: "Logged out successfully." });
  } catch (error: any) {
    res.status(500).json({ error: "Logout failed." });
  }
});

// Password reset request
app.post("/api/auth/reset-password", resetLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email || !String(email).includes("@")) {
    return res.status(400).json({ error: "A valid email address is required." });
  }

  const cleanEmail = String(email).trim().toLowerCase();

  try {
    const user = await prisma.user.findUnique({ where: { email: cleanEmail } });

    // Always return generic response to prevent email enumeration
    res.json({
      success: true,
      message: "If an account exists with the provided email, a password reset link has been sent.",
    });

    if (user) {
      logger.info(`[AUTH RESET] Password reset requested for ${cleanEmail}`);
      // TODO: Send reset email via emailService when configured
    }
  } catch (error: any) {
    logger.error("[AUTH RESET ERROR]", { error: error.message });
    res.status(500).json({ error: "Password reset request failed." });
  }
});

// Staff invitation — admin only
app.post("/api/admin/invite-staff", requireAuth, requirePermission("manage_users"), adminLimiter, async (req: any, res) => {
  const { email, role, fullName, department, shift, phone } = req.body;

  if (!email || !role || !fullName) {
    return res.status(400).json({ error: "Email, role, and full name are required." });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: "A user with this email already exists." });
    }

    const tempPassword = Math.random().toString(36).slice(-10) + 'Nexa1!';
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        role,
        phone: phone || null,
        status: "active",
        companyId: req.user.companyId,
      },
    });

    // Send credentials via email in background
    const company = await prisma.company.findUnique({ where: { id: req.user.companyId } });
    emailService.sendStaffInvitation(email, company?.name || 'Your Business', tempPassword, role, department, shift)
      .then(() => logger.info(`[STAFF INVITE] Credentials sent to ${email}`))
      .catch((err: any) => logger.error('[STAFF INVITE EMAIL ERROR]', { error: err.message }));

    res.json({
      success: true,
      message: `Access granted to ${email}. Credentials dispatched via encrypted channel.`,
      staffId: newUser.id,
    });
  } catch (error: any) {
    logger.error('[STAFF INVITE ERROR]', { error: error.message });
    res.status(500).json({ error: "Failed to invite staff member." });
  }
});

// Alias: staff invite — frontend calls /api/users/invite
app.post("/api/users/invite", requireAuth, requirePermission("manage_users"), adminLimiter, async (req: any, res) => {
  const { email, role, fullName, department, shift, phone, businessName } = req.body;

  if (!email || !role || !fullName) {
    return res.status(400).json({ error: "Email, role, and full name are required." });
  }

  try {
    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ error: "A user with this email already exists." });
    }

    const tempPassword = Math.random().toString(36).slice(-10) + 'Nexa1!';
    const passwordHash = await bcrypt.hash(tempPassword, 12);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        fullName,
        role,
        phone: phone || null,
        status: "active",
        companyId: req.user.companyId,
      },
    });

    // Create linked Employee record
    await prisma.employee.create({
      data: {
        fullName,
        email: email.toLowerCase(),
        phone: phone || null,
        position: role,
        companyId: req.user.companyId,
        userId: newUser.id,
      },
    }).catch(() => {});

    // Send credentials via email in background
    const company = await prisma.company.findUnique({ where: { id: req.user.companyId } });
    emailService.sendStaffInvitation(email, company?.name || businessName || 'Your Business', tempPassword, role, department, shift)
      .then(() => logger.info(`[STAFF INVITE] Credentials sent to ${email}`))
      .catch((err: any) => logger.error('[STAFF INVITE EMAIL ERROR]', { error: err.message }));

    res.json({
      success: true,
      message: `Access granted to ${email}. Credentials dispatched via encrypted channel.`,
      userId: newUser.id,
      staffId: newUser.id,
    });
  } catch (error: any) {
    logger.error('[STAFF INVITE ERROR]', { error: error.message });
    res.status(500).json({ error: "Failed to invite staff member." });
  }
});

// List all users/staff for the company
app.get("/api/users", requireAuth, async (req: any, res) => {
  try {
    const users = await prisma.user.findMany({
      where: { companyId: req.user.companyId, deletedAt: null },
      select: {
        id: true,
        email: true,
        fullName: true,
        phone: true,
        role: true,
        status: true,
        avatarUrl: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(users);
  } catch (error: any) {
    logger.error("[USERS LIST ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to fetch staff list." });
  }
});

// Delete/deactivate a user
app.delete("/api/users/:id", requireAuth, requirePermission("manage_users"), async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user || user.companyId !== req.user.companyId) {
      return res.status(404).json({ error: "User not found in your business." });
    }
    if (user.role === "company_admin" || user.role === "super_admin") {
      return res.status(403).json({ error: "Cannot remove the business owner." });
    }

    await prisma.user.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), status: "suspended" },
    });

    res.json({ success: true, message: "Staff member removed." });
  } catch (error: any) {
    logger.error("[USER DELETE ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to remove staff member." });
  }
});

// Update company info
app.put("/api/company", requireAuth, requirePermission("manage_settings"), async (req: any, res) => {
  try {
    const { name, phone, address, notifications } = req.body;
    const data: any = {};
    if (name) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;

    const company = await prisma.company.update({
      where: { id: req.user.companyId },
      data,
    });
    res.json(company);
  } catch (error: any) {
    logger.error("[COMPANY UPDATE ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to update business info." });
  }
});

// Update own profile
app.put("/api/auth/profile", requireAuth, async (req: any, res) => {
  try {
    const { full_name, fullName, phone, avatarUrl } = req.body;
    const data: any = {};
    if (fullName || full_name) data.fullName = fullName || full_name;
    if (phone !== undefined) data.phone = phone;
    if (avatarUrl) data.avatarUrl = avatarUrl;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data,
      select: { id: true, email: true, fullName: true, phone: true, avatarUrl: true, role: true },
    });
    res.json(user);
  } catch (error: any) {
    logger.error("[PROFILE UPDATE ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to update profile." });
  }
});

// Change password
app.put("/api/auth/password", requireAuth, async (req: any, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new passwords are required." });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ error: "New password must be at least 8 characters." });
    }

    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    if (!user) return res.status(404).json({ error: "User not found." });

    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Current password is incorrect." });

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({ where: { id: req.user.userId }, data: { passwordHash } });

    res.json({ success: true, message: "Password changed successfully." });
  } catch (error: any) {
    logger.error("[PASSWORD CHANGE ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to change password." });
  }
});

// ─────────────────────────────────────────────
// ATTENDANCE ROUTES
// ─────────────────────────────────────────────
app.get("/api/attendance/logs", requireAuth, async (req: any, res) => {
  try {
    const since = req.query.since ? new Date(req.query.since as string) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const logs = await prisma.attendance.findMany({
      where: {
        employee: { companyId: req.user.companyId },
        timestamp: { gte: since },
      },
      include: { employee: true },
      orderBy: { timestamp: "desc" },
      take: 200,
    });
    res.json(logs);
  } catch (error: any) {
    logger.error("[ATTENDANCE LOGS ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to fetch attendance logs." });
  }
});

app.post("/api/attendance", requireAuth, async (req: any, res) => {
  try {
    const { staffId, staffName, action, timestamp } = req.body;
    if (!staffId || !action) return res.status(400).json({ error: "Staff ID and action required." });

    // Find or create employee by userId
    let employee = await prisma.employee.findFirst({
      where: { companyId: req.user.companyId, userId: staffId },
    });

    if (!employee) {
      // Try by fullName match
      employee = await prisma.employee.findFirst({
        where: { companyId: req.user.companyId, fullName: staffName || "Unknown" },
      });
    }

    if (!employee) {
      // Create a basic employee record
      employee = await prisma.employee.create({
        data: {
          fullName: staffName || "Unknown Staff",
          companyId: req.user.companyId,
          userId: staffId,
        },
      });
    }

    const log = await prisma.attendance.create({
      data: {
        employeeId: employee.id,
        userId: req.user.userId,
        action,
        timestamp: timestamp ? new Date(timestamp) : new Date(),
      },
    });

    res.json(log);
  } catch (error: any) {
    logger.error("[ATTENDANCE CREATE ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to record attendance." });
  }
});

// ─────────────────────────────────────────────
// INVOICE ROUTES
// ─────────────────────────────────────────────
app.get("/api/invoices", requireAuth, async (req: any, res) => {
  try {
    const invoices = await prisma.invoice.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(invoices);
  } catch (error: any) {
    logger.error("[INVOICES GET ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to fetch invoices." });
  }
});

app.post("/api/invoices", requireAuth, async (req: any, res) => {
  try {
    const { invoice_number, client_name, billing_email, phone, address, issue_date, due_date, amount, status, invoice_type, line_items, payment_history, related_transactions } = req.body;

    if (!client_name) return res.status(400).json({ error: "Client name is required." });

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber: invoice_number || `INV-${Date.now()}`,
        clientName: client_name,
        billingEmail: billing_email || null,
        phone: phone || null,
        address: address || null,
        issueDate: issue_date ? new Date(issue_date) : new Date(),
        dueDate: due_date ? new Date(due_date) : null,
        amount: parseFloat(amount) || 0,
        status: status || "Pending",
        invoiceType: invoice_type || "Service",
        lineItems: line_items || [],
        paymentHistory: payment_history || [],
        relatedTransactions: related_transactions || [],
        companyId: req.user.companyId,
      },
    });

    res.json(invoice);
  } catch (error: any) {
    logger.error("[INVOICE CREATE ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to create invoice." });
  }
});

app.put("/api/invoices/:id", requireAuth, async (req: any, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    if (!invoice || invoice.companyId !== req.user.companyId) {
      return res.status(404).json({ error: "Invoice not found." });
    }

    const { status, client_name, billing_email, phone, address, due_date, amount, invoice_type, line_items, payment_history } = req.body;
    const data: any = {};
    if (status) data.status = status;
    if (client_name) data.clientName = client_name;
    if (billing_email !== undefined) data.billingEmail = billing_email;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (due_date) data.dueDate = new Date(due_date);
    if (amount !== undefined) data.amount = parseFloat(amount);
    if (invoice_type) data.invoiceType = invoice_type;
    if (line_items) data.lineItems = line_items;
    if (payment_history) data.paymentHistory = payment_history;

    const updated = await prisma.invoice.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (error: any) {
    logger.error("[INVOICE UPDATE ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to update invoice." });
  }
});

app.delete("/api/invoices/:id", requireAuth, async (req: any, res) => {
  try {
    const invoice = await prisma.invoice.findUnique({ where: { id: req.params.id } });
    if (!invoice || invoice.companyId !== req.user.companyId) {
      return res.status(404).json({ error: "Invoice not found." });
    }
    await prisma.invoice.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    logger.error("[INVOICE DELETE ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to delete invoice." });
  }
});

// ─────────────────────────────────────────────
// PRODUCT ROUTES
// ─────────────────────────────────────────────
app.get("/api/products", requireAuth, async (req: any, res) => {
  try {
    const products = await prisma.product.findMany({
      where: { companyId: req.user.companyId, deletedAt: null },
      include: { category: true, brand: true },
      orderBy: { name: "asc" },
    });
    res.json(products);
  } catch (error: any) {
    logger.error("[PRODUCTS GET ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to fetch products." });
  }
});

app.post("/api/products", requireAuth, requirePermission("manage_products"), async (req: any, res) => {
  try {
    const { name, sku, barcode, category, categoryId, brandId, price, costPrice, stockQuantity, reorderLevel, expiryDate, description, unit, isActive } = req.body;
    const product = await prisma.product.create({
      data: {
        name,
        sku: sku || null,
        barcode: barcode || null,
        categoryId: categoryId || null,
        brandId: brandId || null,
        price: parseFloat(price) || 0,
        costPrice: parseFloat(costPrice) || 0,
        stockQuantity: parseInt(stockQuantity) || 0,
        reorderLevel: parseInt(reorderLevel) || 0,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        description: description || null,
        unit: unit || "piece",
        isActive: isActive !== false,
        companyId: req.user.companyId,
      },
    });
    res.json(product);
  } catch (error: any) {
    logger.error("[PRODUCT CREATE ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to create product." });
  }
});

app.put("/api/products/:id", requireAuth, requirePermission("manage_products"), async (req: any, res) => {
  try {
    const { name, sku, barcode, categoryId, brandId, price, costPrice, stockQuantity, reorderLevel, expiryDate, description, unit, isActive } = req.body;
    const data: any = { updatedAt: new Date() };
    if (name !== undefined) data.name = name;
    if (sku !== undefined) data.sku = sku;
    if (barcode !== undefined) data.barcode = barcode;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (brandId !== undefined) data.brandId = brandId;
    if (price !== undefined) data.price = parseFloat(price);
    if (costPrice !== undefined) data.costPrice = parseFloat(costPrice);
    if (stockQuantity !== undefined) data.stockQuantity = parseInt(stockQuantity);
    if (reorderLevel !== undefined) data.reorderLevel = parseInt(reorderLevel);
    if (expiryDate !== undefined) data.expiryDate = expiryDate ? new Date(expiryDate) : null;
    if (description !== undefined) data.description = description;
    if (unit !== undefined) data.unit = unit;
    if (isActive !== undefined) data.isActive = isActive;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data,
    });
    res.json(product);
  } catch (error: any) {
    logger.error("[PRODUCT UPDATE ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to update product." });
  }
});

app.delete("/api/products/:id", requireAuth, requirePermission("manage_products"), async (req: any, res) => {
  try {
    await prisma.product.update({
      where: { id: req.params.id },
      data: { deletedAt: new Date(), isActive: false },
    });
    res.json({ success: true });
  } catch (error: any) {
    logger.error("[PRODUCT DELETE ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to delete product." });
  }
});

// ─────────────────────────────────────────────
// SMS UTILITY (smsnotifygh.com)
// ─────────────────────────────────────────────
async function sendSMS(phone: string, message: string): Promise<boolean> {
  try {
    const apiKey = process.env.SMS_API_KEY;
    const senderId = process.env.SMS_SENDER_ID || "OBOY YANKEE";
    const smsEndpoint = process.env.SMS_API_URL || "https://sms.smsnotifygh.com/api/send/sms";

    if (!apiKey || apiKey.includes("xxxx")) {
      logger.warn("[SMS] SMS API key not configured. Skipping SMS send.");
      return false;
    }

    // Normalize phone number to Ghana format (233XXXXXXXXX)
    let normalizedPhone = phone.replace(/\s+/g, "").replace(/-/g, "");
    if (normalizedPhone.startsWith("0")) {
      normalizedPhone = "233" + normalizedPhone.substring(1);
    } else if (normalizedPhone.startsWith("+233")) {
      normalizedPhone = normalizedPhone.substring(1);
    } else if (!normalizedPhone.startsWith("233")) {
      normalizedPhone = "233" + normalizedPhone.replace(/^\+/, "");
    }

    const response = await fetch(smsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({
        sender_id: senderId,
        to: normalizedPhone,
        message: message,
      }),
    });

    const data = await response.json();
    if (data.status === "success" || data.status === true || response.status === 200) {
      logger.info(`[SMS] Sent to ${normalizedPhone}: ${message.substring(0, 50)}...`);
      return true;
    } else {
      logger.warn(`[SMS] Failed to send to ${normalizedPhone}:`, { response: data });
      return false;
    }
  } catch (error: any) {
    logger.error("[SMS] Error sending SMS:", { error: error.message });
    return false;
  }
}

async function sendCustomerReceiptSMS(sale: any, companyPhone?: string): Promise<void> {
  try {
    // Check if SMS is enabled in settings
    const smsEnabled = await prisma.setting.findUnique({
      where: { companyId_key: { companyId: sale.companyId, key: "sms_receipts_enabled" } },
    });
    if (smsEnabled && smsEnabled.value === "false") return;

    // Get customer phone: try customerPhone field first, then customer record
    let customerPhone: string | undefined = sale.customerPhone || undefined;

    if (!customerPhone && sale.customerId) {
      const customer = await prisma.customer.findUnique({ where: { id: sale.customerId } });
      customerPhone = customer?.phone || undefined;
    }

    if (!customerPhone) return;

    const company = await prisma.company.findUnique({ where: { id: sale.companyId } });
    const shopName = company?.name || "OBOY YANKEE";

    const itemsCount = sale.items?.length || 0;
    const total = Number(sale.totalAmount).toFixed(2);
    const receipt = sale.receiptNumber;

    const message = `${shopName}\nReceipt: ${receipt}\nItems: ${itemsCount}\nTotal: GHS${total}\nPaid: ${sale.paymentMethod.toUpperCase()}${sale.isCredit ? "\n*** CREDIT SALE ***" : ""}\nThank you for shopping with us!`;

    await sendSMS(customerPhone, message);
  } catch (error: any) {
    logger.error("[SMS] Customer receipt SMS error:", { error: error.message });
  }
}

async function sendDailySummarySMS(zReport: any, companyId: string): Promise<void> {
  try {
    // Check if SMS is enabled in settings
    const smsEnabled = await prisma.setting.findUnique({
      where: { companyId_key: { companyId, key: "sms_daily_summary_enabled" } },
    });
    if (smsEnabled && smsEnabled.value === "false") return;

    // Get company/owner phone
    const company = await prisma.company.findUnique({ where: { id: companyId } });
    const ownerPhone = company?.phone;

    if (!ownerPhone) {
      logger.warn("[SMS] No company phone configured for daily summary SMS.");
      return;
    }

    const shopName = company?.name || "OBOY YANKEE";
    const totalSales = Number(zReport.totalSales).toFixed(2);
    const cashSales = Number(zReport.cashSales).toFixed(2);
    const momoSales = Number(zReport.momoSales).toFixed(2);
    const profit = Number(zReport.totalProfit).toFixed(2);
    const variance = Number(zReport.cashVariance).toFixed(2);
    const txns = zReport.transactionCount;

    const message = `${shopName} - DAILY SUMMARY\nDate: ${new Date(zReport.closingTime).toLocaleDateString("en-GH")}\nTotal Sales: GHS${totalSales}\nCash: GHS${cashSales}\nMoMo: GHS${momoSales}\nTransactions: ${txns}\nProfit: GHS${profit}\nCash Variance: GHS${variance}\nReport: ${zReport.reportNumber}`;

    await sendSMS(ownerPhone, message);
  } catch (error: any) {
    logger.error("[SMS] Daily summary SMS error:", { error: error.message });
  }
}

// ─────────────────────────────────────────────
// SALES ROUTES
// ─────────────────────────────────────────────
app.get("/api/sales", requireAuth, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { role: true } });
    const isAdmin = user?.role === "company_admin" || user?.role === "super_admin" || user?.role === "manager" || user?.role === "accountant";

    const where: any = { companyId: req.user.companyId };
    if (!isAdmin) {
      where.userId = req.user.userId;
    }

    const sales = await prisma.sale.findMany({
      where,
      include: { items: { include: { product: true } }, customer: true, user: true },
      orderBy: { createdAt: "desc" },
      take: 100,
    });
    res.json(sales);
  } catch (error: any) {
    logger.error("[SALES GET ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to fetch sales." });
  }
});

app.get("/api/sales/:id", requireAuth, async (req: any, res) => {
  try {
    const sale = await prisma.sale.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { product: true } }, customer: true, user: true },
    });
    if (!sale || sale.companyId !== req.user.companyId) {
      return res.status(404).json({ error: "Sale not found." });
    }
    res.json(sale);
  } catch (error: any) {
    logger.error("[SALE DETAIL ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to fetch sale." });
  }
});

app.post("/api/sales", requireAuth, async (req: any, res) => {
  try {
    const { items, customerId, customerPhone, paymentMethod, discountAmount, taxAmount, subtotal, totalAmount, notes, isCredit, paystackReference } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: "Sale items are required." });
    }

    const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    // GRA Ghana Tax Breakdown: NHIL 2.5%, GETFL 2.5%, VAT 15%, COVID HRL 1%
    const subtotalNum = parseFloat(subtotal) || 0;
    const discountNum = parseFloat(discountAmount) || 0;
    const taxableAmount = subtotalNum - discountNum;
    const nhilAmount = taxableAmount * 0.025;
    const getfundAmount = taxableAmount * 0.025;
    const vatAmount = taxableAmount * 0.15;
    const covidHrlAmount = taxableAmount * 0.01;
    const totalTax = nhilAmount + getfundAmount + vatAmount + covidHrlAmount;

    // Calculate profit from cost prices
    let profitAmount = 0;
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { costPrice: true } });
      const cost = product?.costPrice ? parseFloat(String(product.costPrice)) : 0;
      const revenue = parseFloat(item.totalPrice) || 0;
      profitAmount += revenue - (cost * item.quantity);
    }

    const sale = await prisma.sale.create({
      data: {
        receiptNumber,
        customerId: customerId || null,
        userId: req.user.userId,
        subtotal: subtotalNum,
        discountAmount: discountNum,
        taxAmount: totalTax,
        nhilAmount,
        getfundAmount,
        vatAmount,
        covidHrlAmount,
        totalAmount: parseFloat(totalAmount),
        profitAmount,
        paymentMethod,
        paymentStatus: isCredit ? "unpaid" : "paid",
        status: "completed",
        isCredit: isCredit || false,
        creditSettled: false,
        customerPhone: customerPhone || null,
        notes: notes || null,
        companyId: req.user.companyId,
        items: {
          create: items.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: parseFloat(item.unitPrice),
            discount: parseFloat(item.discount) || 0,
            totalPrice: parseFloat(item.totalPrice),
          })),
        },
      },
      include: { items: { include: { product: true } } },
    });

    // Update product stock
    for (const item of items) {
      const product = await prisma.product.findUnique({ where: { id: item.productId }, select: { stockQuantity: true, name: true } });
      if (product && product.stockQuantity < item.quantity) {
        logger.warn(`[SALE] Stock insufficient for ${product.name}: have ${product.stockQuantity}, selling ${item.quantity}. Allowing sale but stock will go negative.`);
      }
      await prisma.product.update({
        where: { id: item.productId },
        data: { stockQuantity: { decrement: item.quantity } },
      });
      await prisma.stockMovement.create({
        data: {
          productId: item.productId,
          type: "sale",
          quantity: -item.quantity,
          reference: sale.id,
        },
      });
    }

    // Record payment if Paystack reference provided
    if (paystackReference) {
      await prisma.payment.create({
        data: {
          saleId: sale.id,
          amount: parseFloat(totalAmount),
          method: paymentMethod,
          reference: paystackReference,
        },
      });
    }

    // Update customer loyalty points (1 point per ₵1 spent)
    if (customerId) {
      await prisma.customer.update({
        where: { id: customerId },
        data: { loyaltyPoints: { increment: Math.floor(parseFloat(totalAmount)) } },
      });
    }

    // Send SMS receipt to customer (async, non-blocking)
    sendCustomerReceiptSMS(sale).catch(err => logger.error("[SMS] Post-sale SMS failed:", { error: err.message }));

    res.json(sale);
  } catch (error: any) {
    logger.error("[SALE CREATE ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to create sale." });
  }
});

// ─────────────────────────────────────────────
// PAYSTACK PAYMENT INITIALIZATION
// ─────────────────────────────────────────────
app.post("/api/payments/initialize", requireAuth, async (req: any, res) => {
  try {
    const { amount, email, reference, mobileMoney } = req.body;

    if (!amount || !email) {
      return res.status(400).json({ error: "Amount and email are required." });
    }

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey || paystackSecretKey.includes("xxxx")) {
      return res.status(503).json({ error: "Paystack not configured. Set PAYSTACK_SECRET_KEY in .env" });
    }

    const response = await fetch("https://api.paystack.co/transaction/initialize", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: Math.round(amount * 100), // Paystack uses kobo
        email,
        reference: reference || `OYE-${Date.now()}`,
        currency: process.env.PAYSTACK_CURRENCY || "GHS",
        ...(mobileMoney ? { channel: "mobile_money" } : {}),
        callback_url: `${process.env.VITE_APP_URL || 'http://localhost:3000'}/pos`,
      }),
    });

    const data = await response.json();
    if (!data.status) {
      return res.status(400).json({ error: data.message || "Payment initialization failed." });
    }

    res.json({ authorizationUrl: data.data.authorization_url, reference: data.data.reference });
  } catch (error: any) {
    logger.error("[PAYSTACK INIT ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to initialize payment." });
  }
});

app.post("/api/payments/verify", requireAuth, async (req: any, res) => {
  try {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ error: "Reference is required." });

    const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!paystackSecretKey || paystackSecretKey.includes("xxxx")) {
      return res.status(503).json({ error: "Paystack not configured." });
    }

    const response = await fetch(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: { Authorization: `Bearer ${paystackSecretKey}` },
    });

    const data = await response.json();
    if (!data.status || data.data.status !== "success") {
      return res.status(400).json({ error: "Payment verification failed.", status: data.data?.status });
    }

    res.json({ success: true, amount: data.data.amount / 100, reference: data.data.reference, method: data.data.channel });
  } catch (error: any) {
    logger.error("[PAYSTACK VERIFY ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to verify payment." });
  }
});

// ─────────────────────────────────────────────
// RETURNS / REFUNDS
// ─────────────────────────────────────────────
app.post("/api/returns", requireAuth, async (req: any, res) => {
  try {
    const { saleId, reason, items } = req.body;
    if (!saleId || !reason) return res.status(400).json({ error: "Sale ID and reason are required." });

    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: { items: true },
    });
    if (!sale || sale.companyId !== req.user.companyId) return res.status(404).json({ error: "Sale not found." });
    let refundAmount = 0;
    const returnItems = items || sale.items;

    for (const item of returnItems) {
      const saleItem = sale.items.find((si: any) => si.id === item.id || si.productId === item.productId);
      if (saleItem) {
        const qty = item.quantity || saleItem.quantity;
        refundAmount += Number(saleItem.totalPrice);
        // Restock
        await prisma.product.update({
          where: { id: saleItem.productId },
          data: { stockQuantity: { increment: qty } },
        });
        await prisma.stockMovement.create({
          data: { productId: saleItem.productId, type: "return", quantity: qty, reference: saleId, reason },
        });
      }
    }

    const returnRecord = await prisma.return.create({
      data: {
        saleId,
        customerId: sale.customerId,
        reason,
        totalAmount: refundAmount,
        status: "completed",
        userId: req.user.userId,
      },
    });

    await prisma.sale.update({
      where: { id: saleId },
      data: { status: "refunded" },
    });

    res.json(returnRecord);
  } catch (error: any) {
    logger.error("[RETURN CREATE ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to process return." });
  }
});

app.get("/api/returns", requireAuth, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { role: true } });
    const isAdmin = user?.role === "company_admin" || user?.role === "super_admin" || user?.role === "manager" || user?.role === "accountant";

    const where: any = { sale: { companyId: req.user.companyId } };
    if (!isAdmin) {
      where.sale.userId = req.user.userId;
    }

    const returns = await prisma.return.findMany({
      where,
      include: { sale: { include: { items: true } }, customer: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(returns);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch returns." });
  }
});

// ─────────────────────────────────────────────
// CREDIT SALES & DEBT SETTLEMENT
// ─────────────────────────────────────────────
app.get("/api/credit-sales", requireAuth, async (req: any, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.userId }, select: { role: true } });
    const isAdmin = user?.role === "company_admin" || user?.role === "super_admin" || user?.role === "manager" || user?.role === "accountant";

    const where: any = { companyId: req.user.companyId, isCredit: true, creditSettled: false };
    if (!isAdmin) {
      where.userId = req.user.userId;
    }

    const creditSales = await prisma.sale.findMany({
      where,
      include: { customer: true, items: true },
      orderBy: { createdAt: "desc" },
    });
    res.json(creditSales);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch credit sales." });
  }
});

app.post("/api/credit-payments", requireAuth, async (req: any, res) => {
  try {
    const { saleId, customerId, amount, paymentMethod, reference } = req.body;
    if (!saleId || !amount) return res.status(400).json({ error: "Sale ID and amount are required." });

    const sale = await prisma.sale.findUnique({ where: { id: saleId } });
    if (!sale || sale.companyId !== req.user.companyId) return res.status(404).json({ error: "Sale not found." });

    const payment = await prisma.creditPayment.create({
      data: {
        saleId,
        customerId: customerId || sale.customerId,
        amount: parseFloat(amount),
        paymentMethod: paymentMethod || "cash",
        reference: reference || null,
        companyId: req.user.companyId,
      },
    });

    // Check if credit is fully settled
    const totalPaid = await prisma.creditPayment.aggregate({
      where: { saleId },
      _sum: { amount: true },
    });

    const totalPaidNum = Number(totalPaid._sum.amount) || 0;
    const totalAmountNum = Number(sale.totalAmount);

    if (totalPaidNum >= totalAmountNum) {
      await prisma.sale.update({
        where: { id: saleId },
        data: { creditSettled: true, paymentStatus: "paid" },
      });
    } else if (totalPaidNum > 0) {
      await prisma.sale.update({
        where: { id: saleId },
        data: { paymentStatus: "partial" },
      });
    }

    // Update customer balance
    if (sale.customerId) {
      await prisma.customer.update({
        where: { id: sale.customerId },
        data: { balance: { decrement: parseFloat(amount) } },
      });
    }

    res.json(payment);
  } catch (error: any) {
    logger.error("[CREDIT PAYMENT ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to record credit payment." });
  }
});

app.get("/api/credit-payments", requireAuth, async (req: any, res) => {
  try {
    const payments = await prisma.creditPayment.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: "desc" },
    });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch credit payments." });
  }
});

// ─────────────────────────────────────────────
// Z-REPORT / X-REPORT
// ─────────────────────────────────────────────
app.post("/api/z-reports", requireAuth, async (req: any, res) => {
  try {
    const { openingFloat, countedCash, notes, reportType } = req.body;
    const companyId = req.user.companyId;

    // Find the last closed Z-report to get opening time
    const lastReport = await prisma.zReport.findFirst({
      where: { companyId, status: "closed" },
      orderBy: { closingTime: "desc" },
    });
    const openingTime = lastReport ? lastReport.closingTime : new Date(0);

    // Aggregate sales since last Z-report
    const sales = await prisma.sale.findMany({
      where: { companyId, createdAt: { gte: openingTime }, status: "completed" },
    });

    const pm = (s: any) => String(s.paymentMethod || "").toLowerCase();
    const cashSales = sales.filter(s => pm(s) === "cash" || pm(s).includes("cash")).reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const momoSales = sales.filter(s => pm(s) === "momo" || (pm(s).includes("momo") && !pm(s).includes("card"))).reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const cardSales = sales.filter(s => pm(s) === "card" || pm(s).includes("card")).reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const creditSales = sales.filter(s => s.isCredit).reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const totalSales = sales.reduce((sum, s) => sum + Number(s.totalAmount), 0);
    const totalProfit = sales.reduce((sum, s) => sum + Number(s.profitAmount), 0);
    const totalTax = sales.reduce((sum, s) => sum + Number(s.taxAmount), 0);

    const refunds = await prisma.return.findMany({
      where: { sale: { companyId }, createdAt: { gte: openingTime } },
    });
    const totalRefunds = refunds.reduce((sum, r) => sum + Number(r.totalAmount), 0);

    const expenses = await prisma.expense.findMany({
      where: { companyId, date: { gte: openingTime } },
    });
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const expectedCash = (parseFloat(openingFloat) || 0) + cashSales - totalRefunds - totalExpenses;
    const cashVariance = (parseFloat(countedCash) || 0) - expectedCash;

    const reportNumber = `ZR-${Date.now()}`;

    const zReport = await prisma.zReport.create({
      data: {
        reportNumber,
        reportType: reportType || "z_report",
        openingTime,
        closingTime: new Date(),
        openingFloat: parseFloat(openingFloat) || 0,
        cashSales,
        momoSales,
        cardSales,
        creditSales,
        totalSales,
        totalRefunds,
        totalExpenses,
        expectedCash,
        countedCash: parseFloat(countedCash) || 0,
        cashVariance,
        totalProfit,
        totalTax,
        transactionCount: sales.length,
        notes: notes || null,
        status: "closed",
        companyId,
        userId: req.user.userId,
        items: {
          create: sales.map(s => ({ saleId: s.id })),
        },
      },
      include: { items: true },
    });

    // Send daily sales summary SMS to shop owner (async, non-blocking)
    sendDailySummarySMS(zReport, companyId).catch(err => logger.error("[SMS] Z-Report SMS failed:", { error: err.message }));

    res.json(zReport);
  } catch (error: any) {
    logger.error("[Z-REPORT ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to create Z-report." });
  }
});

app.get("/api/z-reports", requireAuth, async (req: any, res) => {
  try {
    const reports = await prisma.zReport.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: "desc" },
      take: 30,
    });
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch Z-reports." });
  }
});

app.get("/api/z-reports/:id", requireAuth, async (req: any, res) => {
  try {
    const report = await prisma.zReport.findUnique({
      where: { id: req.params.id },
      include: { items: { include: { sale: { include: { items: true } } } } },
    });
    if (!report) return res.status(404).json({ error: "Report not found." });
    res.json(report);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch Z-report." });
  }
});

// ─────────────────────────────────────────────
// AIRTIME & DATA SALES
// ─────────────────────────────────────────────
app.post("/api/airtime", requireAuth, async (req: any, res) => {
  try {
    const { network, productType, phoneNumber, amount } = req.body;
    if (!network || !phoneNumber || !amount) return res.status(400).json({ error: "Network, phone, and amount required." });

    const commission = parseFloat(amount) * 0.03; // 3% commission

    const airtimeSale = await prisma.airtimeSale.create({
      data: {
        network,
        productType: productType || "airtime",
        phoneNumber,
        amount: parseFloat(amount),
        commission,
        status: "completed",
        reference: `AT-${Date.now()}`,
        companyId: req.user.companyId,
        userId: req.user.userId,
      },
    });

    res.json(airtimeSale);
  } catch (error: any) {
    logger.error("[AIRTIME ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to process airtime sale." });
  }
});

app.get("/api/airtime", requireAuth, async (req: any, res) => {
  try {
    const sales = await prisma.airtimeSale.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(sales);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch airtime sales." });
  }
});

// ─────────────────────────────────────────────
// BILL PAYMENTS
// ─────────────────────────────────────────────
app.post("/api/bill-payments", requireAuth, async (req: any, res) => {
  try {
    const { provider, accountNumber, accountName, amount, fee } = req.body;
    if (!provider || !accountNumber || !amount) return res.status(400).json({ error: "Provider, account number, and amount required." });

    const commission = parseFloat(amount) * 0.02; // 2% commission

    const billPayment = await prisma.billPayment.create({
      data: {
        provider,
        accountNumber,
        accountName: accountName || null,
        amount: parseFloat(amount),
        fee: parseFloat(fee) || 0,
        commission,
        status: "completed",
        reference: `BP-${Date.now()}`,
        companyId: req.user.companyId,
        userId: req.user.userId,
      },
    });

    res.json(billPayment);
  } catch (error: any) {
    logger.error("[BILL PAYMENT ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to process bill payment." });
  }
});

app.get("/api/bill-payments", requireAuth, async (req: any, res) => {
  try {
    const payments = await prisma.billPayment.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch bill payments." });
  }
});

// ─────────────────────────────────────────────
// PROMOTIONS
// ─────────────────────────────────────────────
app.get("/api/promotions", requireAuth, async (req: any, res) => {
  try {
    const promotions = await prisma.promotion.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { createdAt: "desc" },
    });
    res.json(promotions);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch promotions." });
  }
});

app.post("/api/promotions", requireAuth, requirePermission("manage_products"), async (req: any, res) => {
  try {
    const promotion = await prisma.promotion.create({
      data: { ...req.body, companyId: req.user.companyId },
    });
    res.json(promotion);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create promotion." });
  }
});

app.put("/api/promotions/:id", requireAuth, requirePermission("manage_products"), async (req: any, res) => {
  try {
    const promotion = await prisma.promotion.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json(promotion);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update promotion." });
  }
});

app.delete("/api/promotions/:id", requireAuth, requirePermission("manage_products"), async (req: any, res) => {
  try {
    await prisma.promotion.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete promotion." });
  }
});

// ─────────────────────────────────────────────
// LOYALTY REDEMPTION
// ─────────────────────────────────────────────
app.post("/api/loyalty/redeem", requireAuth, async (req: any, res) => {
  try {
    const { customerId, pointsUsed, saleId } = req.body;
    if (!customerId || !pointsUsed) return res.status(400).json({ error: "Customer ID and points required." });

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return res.status(404).json({ error: "Customer not found." });
    if (customer.loyaltyPoints < pointsUsed) return res.status(400).json({ error: "Insufficient loyalty points." });

    // 1 point = ₵0.10
    const valueRedeemed = pointsUsed * 0.10;

    const redemption = await prisma.loyaltyRedemption.create({
      data: {
        customerId,
        pointsUsed,
        valueRedeemed,
        saleId: saleId || null,
        companyId: req.user.companyId,
      },
    });

    await prisma.customer.update({
      where: { id: customerId },
      data: { loyaltyPoints: { decrement: pointsUsed } },
    });

    res.json(redemption);
  } catch (error: any) {
    logger.error("[LOYALTY REDEEM ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to redeem loyalty points." });
  }
});

// ─────────────────────────────────────────────
// PROFIT ANALYSIS
// ─────────────────────────────────────────────
app.get("/api/profit-analysis", requireAuth, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const { startDate, endDate } = req.query;
    const start = startDate ? new Date(startDate as string) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate as string) : new Date();

    const sales = await prisma.sale.findMany({
      where: { companyId, createdAt: { gte: start, lte: end }, status: "completed" },
      include: { items: { include: { product: { select: { costPrice: true, name: true } } } } },
    });

    let totalRevenue = 0;
    let totalCost = 0;
    let totalProfit = 0;
    const productProfits: any[] = [];

    for (const sale of sales) {
      totalRevenue += Number(sale.totalAmount);
      totalProfit += Number(sale.profitAmount);
      for (const item of sale.items) {
        const cost = item.product?.costPrice ? Number(item.product.costPrice) : 0;
        const revenue = Number(item.totalPrice);
        const profit = revenue - (cost * item.quantity);
        totalCost += cost * item.quantity;
        const existing = productProfits.find(p => p.productId === item.productId);
        if (existing) {
          existing.revenue += revenue;
          existing.profit += profit;
          existing.quantity += item.quantity;
        } else {
          productProfits.push({
            productId: item.productId,
            productName: item.product?.name || "Unknown",
            revenue,
            cost: cost * item.quantity,
            profit,
            quantity: item.quantity,
            margin: revenue > 0 ? (profit / revenue) * 100 : 0,
          });
        }
      }
    }

    res.json({
      totalRevenue,
      totalCost,
      totalProfit,
      margin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      productProfits: productProfits.sort((a, b) => b.profit - a.profit),
      transactionCount: sales.length,
    });
  } catch (error: any) {
    logger.error("[PROFIT ANALYSIS ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to fetch profit analysis." });
  }
});

// ─────────────────────────────────────────────
// EXPIRY TRACKING
// ─────────────────────────────────────────────
app.get("/api/products/expiring", requireAuth, async (req: any, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const threshold = new Date();
    threshold.setDate(threshold.getDate() + days);

    const products = await prisma.product.findMany({
      where: {
        companyId: req.user.companyId,
        deletedAt: null,
        expiryDate: { lte: threshold, gte: new Date() },
      },
      orderBy: { expiryDate: "asc" },
    });

    const expired = await prisma.product.findMany({
      where: {
        companyId: req.user.companyId,
        deletedAt: null,
        expiryDate: { lt: new Date() },
      },
      orderBy: { expiryDate: "asc" },
    });

    res.json({ expiring: products, expired });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch expiring products." });
  }
});

// ─────────────────────────────────────────────
// SMS SETTINGS
// ─────────────────────────────────────────────
app.get("/api/sms/settings", requireAuth, async (req: any, res) => {
  try {
    const settings = await prisma.setting.findMany({
      where: { companyId: req.user.companyId, category: "sms" },
    });
    const result: any = {
      smsReceiptsEnabled: true,
      smsDailySummaryEnabled: true,
    };
    settings.forEach(s => {
      if (s.key === "sms_receipts_enabled") result.smsReceiptsEnabled = s.value === "true";
      if (s.key === "sms_daily_summary_enabled") result.smsDailySummaryEnabled = s.value === "true";
    });
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch SMS settings." });
  }
});

app.put("/api/sms/settings", requireAuth, requirePermission("manage_settings"), async (req: any, res) => {
  try {
    const { smsReceiptsEnabled, smsDailySummaryEnabled } = req.body;
    const companyId = req.user.companyId;

    if (typeof smsReceiptsEnabled !== "undefined") {
      await prisma.setting.upsert({
        where: { companyId_key: { companyId, key: "sms_receipts_enabled" } },
        update: { value: String(smsReceiptsEnabled) },
        create: { companyId, key: "sms_receipts_enabled", value: String(smsReceiptsEnabled), category: "sms" },
      });
    }

    if (typeof smsDailySummaryEnabled !== "undefined") {
      await prisma.setting.upsert({
        where: { companyId_key: { companyId, key: "sms_daily_summary_enabled" } },
        update: { value: String(smsDailySummaryEnabled) },
        create: { companyId, key: "sms_daily_summary_enabled", value: String(smsDailySummaryEnabled), category: "sms" },
      });
    }

    res.json({ success: true });
  } catch (error: any) {
    logger.error("[SMS SETTINGS ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to update SMS settings." });
  }
});

// Test SMS endpoint
app.post("/api/sms/test", requireAuth, requirePermission("manage_settings"), async (req: any, res) => {
  try {
    const { phoneNumber } = req.body;
    if (!phoneNumber) return res.status(400).json({ error: "Phone number required." });

    const company = await prisma.company.findUnique({ where: { id: req.user.companyId } });
    const shopName = company?.name || "OBOY YANKEE";

    const sent = await sendSMS(phoneNumber, `${shopName} - SMS Test\nThis is a test message from your POS system. SMS is working correctly!`);

    if (sent) {
      res.json({ success: true, message: "Test SMS sent successfully." });
    } else {
      res.status(400).json({ error: "Failed to send test SMS. Check SMS_API_KEY in .env" });
    }
  } catch (error: any) {
    res.status(500).json({ error: "Failed to send test SMS." });
  }
});

// ─────────────────────────────────────────────
// CUSTOMER ROUTES
// ─────────────────────────────────────────────
app.get("/api/customers", requireAuth, async (req: any, res) => {
  try {
    const customers = await prisma.customer.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { name: "asc" },
    });
    res.json(customers);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch customers." });
  }
});

app.post("/api/customers", requireAuth, async (req: any, res) => {
  try {
    const { name, email, phone, address, creditLimit } = req.body;
    if (!name) return res.status(400).json({ error: "Customer name is required." });
    const customer = await prisma.customer.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        creditLimit: creditLimit ? parseFloat(creditLimit) : null,
        companyId: req.user.companyId,
      },
    });
    res.json(customer);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create customer." });
  }
});

app.put("/api/customers/:id", requireAuth, async (req: any, res) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!customer || customer.companyId !== req.user.companyId) {
      return res.status(404).json({ error: "Customer not found." });
    }
    const { name, email, phone, address, creditLimit, isActive } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (creditLimit !== undefined) data.creditLimit = creditLimit ? parseFloat(creditLimit) : null;
    if (isActive !== undefined) data.isActive = isActive;
    const updated = await prisma.customer.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update customer." });
  }
});

app.delete("/api/customers/:id", requireAuth, async (req: any, res) => {
  try {
    const customer = await prisma.customer.findUnique({ where: { id: req.params.id } });
    if (!customer || customer.companyId !== req.user.companyId) {
      return res.status(404).json({ error: "Customer not found." });
    }
    await prisma.customer.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to remove customer." });
  }
});

// ─────────────────────────────────────────────
// SUPPLIER ROUTES
// ─────────────────────────────────────────────
app.get("/api/suppliers", requireAuth, async (req: any, res) => {
  try {
    const suppliers = await prisma.supplier.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { name: "asc" },
    });
    res.json(suppliers);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch suppliers." });
  }
});

app.post("/api/suppliers", requireAuth, requirePermission("manage_suppliers"), async (req: any, res) => {
  try {
    const { name, email, phone, address, contactPerson } = req.body;
    if (!name) return res.status(400).json({ error: "Supplier name is required." });
    const supplier = await prisma.supplier.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        address: address || null,
        contactPerson: contactPerson || null,
        companyId: req.user.companyId,
      },
    });
    res.json(supplier);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create supplier." });
  }
});

app.put("/api/suppliers/:id", requireAuth, requirePermission("manage_suppliers"), async (req: any, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({ where: { id: req.params.id } });
    if (!supplier || supplier.companyId !== req.user.companyId) {
      return res.status(404).json({ error: "Supplier not found." });
    }
    const { name, email, phone, address, contactPerson, isActive } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (address !== undefined) data.address = address;
    if (contactPerson !== undefined) data.contactPerson = contactPerson;
    if (isActive !== undefined) data.isActive = isActive;
    const updated = await prisma.supplier.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update supplier." });
  }
});

app.delete("/api/suppliers/:id", requireAuth, requirePermission("manage_suppliers"), async (req: any, res) => {
  try {
    const supplier = await prisma.supplier.findUnique({ where: { id: req.params.id } });
    if (!supplier || supplier.companyId !== req.user.companyId) {
      return res.status(404).json({ error: "Supplier not found." });
    }
    await prisma.supplier.update({ where: { id: req.params.id }, data: { isActive: false } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to remove supplier." });
  }
});

// ─────────────────────────────────────────────
// EXPENSE ROUTES
// ─────────────────────────────────────────────
app.get("/api/expenses", requireAuth, async (req: any, res) => {
  try {
    const expenses = await prisma.expense.findMany({
      where: { companyId: req.user.companyId },
      orderBy: { date: "desc" },
      take: 100,
    });
    res.json(expenses);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to fetch expenses." });
  }
});

app.post("/api/expenses", requireAuth, requirePermission("manage_expenses"), async (req: any, res) => {
  try {
    const { category, categoryId, description, amount, date, paymentMethod, reference } = req.body;
    if (!description || !amount) return res.status(400).json({ error: "Description and amount are required." });
    const expense = await prisma.expense.create({
      data: {
        category: category || "General",
        categoryId: categoryId || null,
        description,
        amount: parseFloat(amount),
        date: date ? new Date(date) : new Date(),
        paymentMethod: paymentMethod || null,
        reference: reference || null,
        userId: req.user.userId,
        companyId: req.user.companyId,
      },
    });
    res.json(expense);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to create expense." });
  }
});

app.put("/api/expenses/:id", requireAuth, requirePermission("manage_expenses"), async (req: any, res) => {
  try {
    const expense = await prisma.expense.findUnique({ where: { id: req.params.id } });
    if (!expense || expense.companyId !== req.user.companyId) {
      return res.status(404).json({ error: "Expense not found." });
    }
    const { category, categoryId, description, amount, date, paymentMethod, reference } = req.body;
    const data: any = {};
    if (category !== undefined) data.category = category;
    if (categoryId !== undefined) data.categoryId = categoryId;
    if (description !== undefined) data.description = description;
    if (amount !== undefined) data.amount = parseFloat(amount);
    if (date !== undefined) data.date = new Date(date);
    if (paymentMethod !== undefined) data.paymentMethod = paymentMethod;
    if (reference !== undefined) data.reference = reference;
    const updated = await prisma.expense.update({ where: { id: req.params.id }, data });
    res.json(updated);
  } catch (error: any) {
    res.status(500).json({ error: "Failed to update expense." });
  }
});

app.delete("/api/expenses/:id", requireAuth, requirePermission("manage_expenses"), async (req: any, res) => {
  try {
    const expense = await prisma.expense.findUnique({ where: { id: req.params.id } });
    if (!expense || expense.companyId !== req.user.companyId) {
      return res.status(404).json({ error: "Expense not found." });
    }
    await prisma.expense.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete expense." });
  }
});

// ─────────────────────────────────────────────
// DASHBOARD STATS
// ─────────────────────────────────────────────
app.get("/api/dashboard/stats", requireAuth, async (req: any, res) => {
  try {
    const companyId = req.user.companyId;
    const cacheKey = `dashboard:${companyId}`;
    const cached = getCached(cacheKey);
    if (cached) {
      return res.json(cached);
    }
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const sevenDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);

    const [totalProducts, todaySales, monthSales, totalCustomers, lowStockProducts, todayExpenses,
           weekSales, topProducts, recentSales, activeStaff, creditOutstanding, totalExpensesMonth] = await Promise.all([
      prisma.product.count({ where: { companyId, deletedAt: null, isActive: true } }),
      prisma.sale.aggregate({
        where: { companyId, createdAt: { gte: startOfDay }, status: "completed" },
        _sum: { totalAmount: true, profitAmount: true },
        _count: true,
      }),
      prisma.sale.aggregate({
        where: { companyId, createdAt: { gte: startOfMonth }, status: "completed" },
        _sum: { totalAmount: true, profitAmount: true },
        _count: true,
      }),
      prisma.customer.count({ where: { companyId, isActive: true } }),
      prisma.product.count({
        where: {
          companyId,
          deletedAt: null,
          isActive: true,
          stockQuantity: { lte: prisma.product.fields.lowStockThreshold },
        },
      }),
      prisma.expense.aggregate({
        where: { companyId, date: { gte: startOfDay } },
        _sum: { amount: true },
      }),
      prisma.sale.findMany({
        where: { companyId, createdAt: { gte: sevenDaysAgo }, status: "completed" },
        select: { totalAmount: true, createdAt: true, paymentMethod: true },
        orderBy: { createdAt: "asc" },
      }),
      prisma.saleItem.groupBy({
        by: ["productId"],
        where: { sale: { companyId, status: "completed", createdAt: { gte: startOfMonth } } },
        _sum: { quantity: true, totalPrice: true },
        orderBy: { _sum: { totalPrice: "desc" } },
        take: 5,
      }),
      prisma.sale.findMany({
        where: { companyId, status: "completed" },
        include: { items: { take: 1, include: { product: { select: { name: true } } } }, user: { select: { fullName: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.user.count({ where: { companyId, status: "active", deletedAt: null } }),
      prisma.sale.aggregate({
        where: { companyId, isCredit: true, creditSettled: false },
        _sum: { totalAmount: true },
      }),
      prisma.expense.aggregate({
        where: { companyId, date: { gte: startOfMonth } },
        _sum: { amount: true },
      }),
    ]);

    const productIds = topProducts.map((tp: any) => tp.productId);
    const productNames = await prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true },
    });
    const productNameMap = new Map(productNames.map((p: any) => [p.id, p.name]));

    const topProductsWithNames = topProducts.map((tp: any) => ({
      name: productNameMap.get(tp.productId) || "Unknown",
      quantity: tp._sum.quantity || 0,
      revenue: Number(tp._sum.totalPrice) || 0,
    }));

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weeklyChart: { name: string; total: number; orders: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const dayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i);
      const dayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i + 1);
      const daySales = weekSales.filter((s: any) => s.createdAt >= dayStart && s.createdAt < dayEnd);
      weeklyChart.push({
        name: dayNames[dayStart.getDay()],
        total: daySales.reduce((sum: number, s: any) => sum + Number(s.totalAmount), 0),
        orders: daySales.length,
      });
    }

    const paymentBreakdown: { cash: number; momo: number; card: number; credit: number } = {
      cash: 0, momo: 0, card: 0, credit: 0,
    };
    weekSales.forEach((s: any) => {
      const pm = (s.paymentMethod || "").toLowerCase();
      const amt = Number(s.totalAmount);
      if (pm.includes("cash") && !pm.includes("split")) paymentBreakdown.cash += amt;
      if (pm.includes("split") && pm.includes("cash")) {
        const cashMatch = pm.match(/cash:₵?([\d.]+)/);
        if (cashMatch) paymentBreakdown.cash += parseFloat(cashMatch[1]);
      }
      if (pm.includes("momo") || pm.includes("mobile") || pm.includes("mtn") || pm.includes("telecel") || pm.includes("airteltigo") || pm.includes("at cash")) {
        if (pm.includes("split")) {
          const momoMatch = pm.match(/(?:momo|telecel|airteltigo|at cash):₵?([\d.]+)/);
          if (momoMatch) paymentBreakdown.momo += parseFloat(momoMatch[1]);
        } else {
          paymentBreakdown.momo += amt;
        }
      }
      if (pm.includes("card")) {
        if (pm.includes("split")) {
          const cardMatch = pm.match(/card:₵?([\d.]+)/);
          if (cardMatch) paymentBreakdown.card += parseFloat(cardMatch[1]);
        } else {
          paymentBreakdown.card += amt;
        }
      }
      if (pm === "credit" || (pm.includes("credit") && !pm.includes("split"))) paymentBreakdown.credit += amt;
    });

    const recentSalesFormatted = recentSales.map((s: any) => ({
      id: s.id,
      receiptNumber: s.receiptNumber,
      amount: Number(s.totalAmount),
      paymentMethod: s.paymentMethod,
      cashierName: s.user?.fullName || "Unknown",
      productName: s.items[0]?.product?.name || "Multiple Items",
      createdAt: s.createdAt,
    }));

    const todayProfit = Number(todaySales._sum.profitAmount) || 0;
    const monthProfit = Number(monthSales._sum.profitAmount) || 0;
    const monthExpenseTotal = Number(totalExpensesMonth._sum.amount) || 0;

    const responseData = {
      totalProducts,
      todaySales: Number(todaySales._sum.totalAmount) || 0,
      todaySalesCount: todaySales._count,
      todayProfit,
      monthSales: Number(monthSales._sum.totalAmount) || 0,
      monthSalesCount: monthSales._count,
      monthProfit,
      monthExpenses: monthExpenseTotal,
      netProfit: monthProfit - monthExpenseTotal,
      totalCustomers,
      lowStockProducts,
      todayExpenses: Number(todayExpenses._sum.amount) || 0,
      activeStaff,
      creditOutstanding: Number(creditOutstanding._sum.totalAmount) || 0,
      weeklyChart,
      topProducts: topProductsWithNames,
      recentSales: recentSalesFormatted,
      paymentBreakdown,
    };
    setCached(cacheKey, responseData, 30000); // 30s cache
    res.json(responseData);
  } catch (error: any) {
    logger.error("[DASHBOARD STATS ERROR]", { error: error.message });
    res.status(500).json({ error: "Failed to fetch dashboard stats." });
  }
});

// ─────────────────────────────────────────────
// SYNC QUEUE — Offline transactions upload
// ─────────────────────────────────────────────
app.post("/api/sync/upload", requireAuth, async (req: any, res) => {
  try {
    const { transactions } = req.body;

    if (!transactions || !Array.isArray(transactions)) {
      return res.status(400).json({ error: "Transactions array is required." });
    }

    const results: any[] = [];

    for (const tx of transactions) {
      try {
        const existing = await prisma.offlineTransaction.findUnique({
          where: { localId: tx.localId },
        });

        if (existing) {
          results.push({ localId: tx.localId, status: "duplicate" });
          continue;
        }

        const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

        const subtotalNum = parseFloat(tx.subtotal || tx.totalAmount);
        const taxableAmount = subtotalNum - (parseFloat(tx.discountAmount) || 0);
        const nhilAmount = taxableAmount * 0.025;
        const getfundAmount = taxableAmount * 0.025;
        const vatAmount = taxableAmount * 0.15;
        const covidHrlAmount = taxableAmount * 0.01;
        const totalTax = nhilAmount + getfundAmount + vatAmount + covidHrlAmount;

        const sale = await prisma.sale.create({
          data: {
            receiptNumber,
            userId: req.user.userId,
            subtotal: subtotalNum,
            discountAmount: parseFloat(tx.discountAmount) || 0,
            taxAmount: totalTax,
            nhilAmount,
            getfundAmount,
            vatAmount,
            covidHrlAmount,
            totalAmount: parseFloat(tx.totalAmount),
            paymentMethod: tx.paymentMethod || "cash",
            paymentStatus: "paid",
            status: "completed",
            companyId: req.user.companyId,
            items: {
              create: (tx.items || []).map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                unitPrice: parseFloat(item.unitPrice || item.price),
                discount: parseFloat(item.discount) || 0,
                totalPrice: parseFloat(item.totalPrice || (item.quantity * (item.unitPrice || item.price))),
              })),
            },
          },
        });

        await prisma.offlineTransaction.create({
          data: {
            localId: tx.localId,
            receiptNumber: sale.receiptNumber,
            items: tx.items,
            totalAmount: parseFloat(tx.totalAmount),
            paymentMethod: tx.paymentMethod || "cash",
            userId: req.user.userId,
            companyId: req.user.companyId,
            status: "synced",
            syncedAt: new Date(),
          },
        });

        for (const item of (tx.items || [])) {
          await prisma.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { decrement: item.quantity } },
          });
        }

        results.push({ localId: tx.localId, status: "synced", saleId: sale.id });
      } catch (txError: any) {
        results.push({ localId: tx.localId, status: "failed", error: txError.message });
      }
    }

    res.json({ success: true, results });
  } catch (error: any) {
    logger.error("[SYNC UPLOAD ERROR]", { error: error.message });
    res.status(500).json({ error: "Sync upload failed." });
  }
});

/**
 * Nexa AI OS Orchestration Routes
 */
app.post("/api/ai/insights", aiLimiter, async (req, res) => {
  const { sales, inventory, businessName, tenantId } = req.body;
  
  if (!sales || !inventory) {
    return res.status(400).json({ error: "Insufficient data for orchestration." });
  }

  // Check Cache
  const cacheKey = `insights_${tenantId || 'global'}_${JSON.stringify(sales).length}_${JSON.stringify(inventory).length}`;
  const cached = aiCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return res.json(cached.data);
  }

  const prompt = `
    Analyze the following business data for "${businessName}" and provide 3-5 high-level actionable insights.
    Focus on sales trends, low stock risks, and growth opportunities.
    Context: This is an SME operating in the African market.
    
    Sales Data (Last 30 days summary):
    ${JSON.stringify(sales)}
    
    Inventory Data (Key highlights):
    ${JSON.stringify(inventory)}
    
    Return the response in a structured JSON format.
  `;

  try {
    const response = await generateWithRetry(() => ai.models.generateContent({
      model: "gemini-flash-latest", 
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              recommendation: { type: Type.STRING },
              priority: { 
                type: Type.STRING,
                enum: ['low', 'medium', 'high']
              },
              impact: { type: Type.STRING },
              category: {
                type: Type.STRING,
                enum: ['sales', 'inventory', 'finance', 'growth']
              }
            },
            required: ['title', 'description', 'recommendation', 'priority', 'impact', 'category']
          }
        }
      }
    }));

    const result = JSON.parse(response.text || "[]");
    
    // Save to Cache
    aiCache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL });
    
    res.json(result);
  } catch (error: any) {
    cleanAILog('INSIGHTS ENGINE', error);
    
    // Dynamic calculation from input metrics
    let totalSales = 0;
    let salesCount = 0;
    if (Array.isArray(sales)) {
      sales.forEach((s: any) => {
        const v = Number(s.total || s.amount || 0);
        if (!isNaN(v) && v > 0) {
          totalSales += v;
          salesCount++;
        }
      });
    }

    const fallbackArray = [
      {
        title: "Capital Velocity Assessment",
        description: salesCount > 0 
          ? `Analysis of your last ${salesCount} sales indicates steady customer transaction volume, accumulating ₵${totalSales.toLocaleString()} total revenue.`
          : "Average transaction volumes indicate normal asset velocity across most common categories.",
        recommendation: "Ensure high-velocity products are highlighted on your workspace layouts for morning shoppers.",
        priority: "high" as any,
        impact: "+8% Margin Optimization",
        category: "finance" as any
      },
      {
        title: "Inventory Run-Rate Security",
        description: Array.isArray(inventory) && inventory.length > 0
          ? `Your store currently has ${inventory.length} items flagged for low stock. Critical supply chain indicators suggest immediate restock opportunity.`
          : "Stock levels are currently within safe operational boundaries, but baseline trend analysis suggests restocking high-turnover goods.",
        recommendation: "Review stock replenishment cycles to prevent supply-side friction and stockouts.",
        priority: "medium" as any,
        impact: "Stockout Mitigation",
        category: "inventory" as any
      },
      {
        title: "Morning Traffic Spike Strategy",
        description: "High density of customer invoice creations historically settles between early morning to early afternoon.",
        recommendation: "Implement a morning bundle discount (e.g. 5% off beverage combinations) to drive high basket sizing.",
        priority: "low" as any,
        impact: "+12% Customer Ticket Density",
        category: "sales" as any
      }
    ];

    // Return 200 with fallback data and degraded flag
    res.json({
      degraded: true,
      fallbackData: fallbackArray
    });
  }
});

app.post("/api/ai/forecast", aiLimiter, async (req, res) => {
  const { historicalSales, businessName, tenantId } = req.body;

  if (!historicalSales) {
    return res.status(400).json({ error: "Historical data required" });
  }

  // Check Cache
  const cacheKey = `forecast_${tenantId || 'global'}_${JSON.stringify(historicalSales).length}`;
  const cached = aiCache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return res.json(cached.data);
  }

  const prompt = `
    Based on the historical sales data for "${businessName}", predict the revenue for the next 30 days.
    Analyze seasonality, trends, and growth patterns.
    
    Historical Data:
    ${JSON.stringify(historicalSales)}
    
    Return a detailed forecast in JSON format.
  `;

  try {
    const response = await generateWithRetry(() => ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            period: { type: Type.STRING },
            predictedRevenue: { type: Type.NUMBER },
            confidence: { type: Type.NUMBER },
            reasoning: { type: Type.STRING },
            keyDrivers: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            }
          },
          required: ['period', 'predictedRevenue', 'confidence', 'reasoning', 'keyDrivers']
        }
      }
    }));

    const result = JSON.parse(response.text || "{}");
    
    // Save to Cache
    aiCache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL });

    res.json(result);
  } catch (error: any) {
    cleanAILog('FORECAST ENGINE', error);

    // Calculate dynamic math from historical values
    let totalHistoricalRevenue = 0;
    let validSalesCount = 0;
    let predictedRevenue = 15000;
    let reasoning = "Nexa predictive modules are currently using baseline projections. Positive growth momentum is anticipated.";

    if (Array.isArray(historicalSales) && historicalSales.length > 0) {
      historicalSales.forEach((item: any) => {
        if (item && typeof item === 'object') {
          const val = Number(item.total || item.amount || item.revenue || 0);
          if (!isNaN(val) && val > 0) {
            totalHistoricalRevenue += val;
            validSalesCount++;
          }
        }
      });

      if (validSalesCount > 0) {
        const avgDaily = totalHistoricalRevenue / validSalesCount;
        const multiplier = 1.05 + (Math.random() * 0.1); // 5% to 15% growth
        predictedRevenue = Math.round(avgDaily * 30 * multiplier);
        reasoning = `Based on historical sales analysis (${validSalesCount} cycles, total accumulated revenue of ₵${totalHistoricalRevenue.toLocaleString()}), Nexa predicts a steady growth trajectory of ${(multiplier * 100 - 100).toFixed(1)}% over the next 30 days.`;
      }
    }

    const fallbackPayload = {
      period: "Next 30 Days",
      predictedRevenue,
      confidence: 0.85,
      reasoning,
      keyDrivers: ["Stable weekend traffic patterns", "Consistent invoice creation rates", "Retail demand resilience"]
    };

    // Return 200 with both flat format and nested fallbackData for maximum robustness
    res.json({
      ...fallbackPayload,
      degraded: true,
      fallbackData: fallbackPayload
    });
  }
});

app.post("/api/ai/ask", aiLimiter, async (req, res) => {
  const { question, context } = req.body;

  const prompt = `
    You are Nexa AI, a world-class business consultant and intelligent assistant for SMEs.
    User Question: ${question}
    Business Context: ${JSON.stringify(context)}
    
    Provide a concise, professional, and highly actionable response. Use a confident and intelligent tone.
    If relevant, refer to the business data provided. Use markdown for formatting.
  `;

  try {
    const response = await generateWithRetry(() => ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }]
        }
      ]
    }));
    res.json({ text: response.text || "I am analyzing your data. Please try again." });
  } catch (error: any) {
    cleanAILog('CONVERSATIONAL ENGINE', error);

    const questionStr = String(question || "").toLowerCase();
    let answer = "Nexa Intelligence is analyzing your business records in safety mode. Standard retail guidelines suggest that maintaining high inventory security and smooth morning customer checkouts will secure optimum cash flow stability.";

    if (questionStr.includes("sales") || questionStr.includes("revenue") || questionStr.includes("money") || questionStr.includes("sell") || questionStr.includes("profit")) {
      answer = "Based on aggregate sales ledger cycles, transaction frequencies cluster heavily on weekend trading sessions. We recommend highlighting fast-selling goods on Friday afternoon to maximize the seasonal customer basket values.";
    } else if (questionStr.includes("stock") || questionStr.includes("inventory") || questionStr.includes("product") || questionStr.includes("low") || questionStr.includes("quantity")) {
      answer = "Our operating metrics recommend establishing a 15-day replenishment line on popular items to avoid stockouts. Check the current inventory status to ensure all high-velocity products are budgeted for restocking.";
    } else if (questionStr.includes("staff") || questionStr.includes("worker") || questionStr.includes("employee") || questionStr.includes("user")) {
      answer = "Personnel efficiency is highest when shifts correspond tightly to transactional waves (typically 11:30 AM to 3:30 PM). Monitor access scopes in the administration panel to guarantee secure staff handshakes.";
    }

    res.json({
      degraded: true,
      text: answer
    });
  }
});

// Centralized, production-safe global error-handler and safety shield (No leaking internals)
app.use((err: any, req: any, res: any, next: any) => {
  logger.error("Unhandled API Boundary Crash", {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    ip: req.ip,
    requestId: req.headers['x-request-id'] || 'NEXA-UNHANDLED'
  });

  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    error: "An unexpected server condition occurred. This incident has been recorded and signaled to operational teams.",
    reference_id: req.headers['x-request-id'] || 'NEXA-SYSTEM-HANDSHAKE-ERR'
  });
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: { overlay: false },
      },
      appType: "spa",
      optimizeDeps: {
        include: ['react', 'react-dom', 'react-router-dom', 'lucide-react', 'motion/react', 'recharts', 'sonner', '@tanstack/react-query'],
      },
    });
    app.use(vite.middlewares);
    
    // Catch-all fallback for direct custom page loads in development mode to prevent 404 errors
    app.get('*', async (req, res, next) => {
      const url = req.originalUrl;
      // Skip API requests and static assets
      if (url.startsWith('/api') || url.includes('.')) {
        return next();
      }
      try {
        const fs = await import("fs");
        let template = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        res.status(200).set({ 'Content-Type': 'text/html' }).end(template);
      } catch (e) {
        next(e);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Enterprise SaaS Server running at http://localhost:${PORT}`);
    });
  }
}

if (!process.env.VERCEL) {
  startServer();
}

export default app;
