# Crime Repo - GIS Crime Reporting & Analysis System
## Comprehensive Project Analysis

**Author:** Mustapha Abdulrahman Sani (CST/20/SWE/00504)  
**Tech Stack:** Node.js, Express 5, MongoDB/Mongoose, Pug Templates, Tailwind CSS, Leaflet Maps  
**Purpose:** GIS-based crime analysis and reporting system for Kano State, Nigeria

---

## 1. PROJECT OVERVIEW

This is a full-stack server-rendered web application that allows citizens to report crimes, administrators to manage and verify reports, and responders to update crime statuses. It features an interactive GIS map (Leaflet + OpenStreetMap), geocoding via HERE API, email notifications via Brevo/Mailtrap, Excel export, and role-based access control.

### Architecture
- **MVC Pattern:** Models (`models/`), Controllers (`controllers/`), Routes (`routes/`), Views (`views/`)
- **Server:** Express 5 with Pug templating engine
- **Database:** MongoDB with Mongoose ODM, 2dsphere geospatial indexing
- **Auth:** JWT (JSON Web Tokens) stored in httpOnly cookies + Bearer token
- **Email:** Dual provider setup - Mailtrap (dev) and Brevo API (prod)
- **Styling:** Tailwind CSS 4 (via CDN `<script>` tag + local build)
- **Maps:** Leaflet.js with MarkerCluster, OpenStreetMap tiles
- **Geocoding:** HERE Geocode API for address-to-coordinates conversion
- **Caching:** Redis (ioredis) for response caching, view caching, and global counter caching

### Core Features
1. User registration with email confirmation flow
2. Role-based access (admin, responder, user)
3. Crime reporting with automatic geocoding
4. Duplicate crime detection (geo + time + type proximity check)
5. Interactive GIS map with filters (type, date, location)
6. Admin analytics dashboard with charts
7. User management (suspend, ban, create users)
8. Notifications system for crime updates
9. Excel (.xlsx) report download
10. Public API endpoint for crime data (rate-limited)
11. Password reset via email
12. Dark mode support
13. Responsive design with mobile hamburger menu

---

## 2. PROS (Strengths)

### 2.1 Security Implementation
- **Helmet.js** with comprehensive CSP (Content Security Policy) headers configured for all external CDNs and APIs
- **Rate limiting** applied at multiple levels: global (100 req/15min), login (5 req/5min), crime API (100 req/24hr)
- **Input sanitization** against NoSQL injection (`express-mongo-sanitize`) and XSS (`sanitize-html`)
- **Parameter pollution protection** via `hpp` middleware
- **JWT stored in httpOnly cookies** with `sameSite: "Strict"` and `secure` flag in production
- **Password hashing** with bcrypt (salt rounds: 12)
- **Password change detection** - invalidates JWT if password changed after token issuance
- **Role-based authorization** via `restrictTo()` middleware
- **User suspension/ban system** with time-based suspension expiry
- **Input whitelisting** on signup - only allowed fields are extracted from `req.body`

### 2.2 Architecture & Code Organization
- Clean MVC separation with dedicated files for each concern
- Proper error handling hierarchy: `AppError` custom class, `catchAsync` wrapper, `errorController` with dev/prod modes
- Centralized utility functions (`utils/`) for reusable logic
- Separate email templates for different purposes (welcome, password reset, report notification)
- Update logging system (`update_log_model.js`) tracks who changed what and when
- GeoJSON-compliant schema design for location data with 2dsphere index

### 2.3 Geospatial Features
- Proper GeoJSON Point type with `[longitude, latitude]` ordering (correct for MongoDB)
- Geocoding integration via HERE API converts text addresses to coordinates
- Duplicate detection using `$geoWithin` + `$centerSphere` with 100m radius + 2hr time window
- Leaflet map with MarkerCluster for handling dense data
- Color-coded crime type markers on the map
- Client-side filtering by crime type, date range, and location

### 2.4 User Experience
- Dark mode support (system preference detection + class toggle)
- Responsive design with Tailwind CSS
- Loading states on form submission buttons (disable + text change)
- User-friendly error messages via `AppError` operational errors
- Toast/alert system for success/error feedback
- "Time ago" format for notifications

### 2.5 Email System
- Dual email provider setup: Mailtrap (dev) / Brevo API (prod)
- Pug-rendered HTML email templates
- Plain text fallback via `html-to-text`
- Emails for: welcome/confirmation, password reset, crime update notifications

### 2.6 Data Export
- ExcelJS integration for .xlsx export with styled headers
- Public API endpoint (`/api/v1/crimes/allCrimes`) with dedicated rate limiter

### 2.7 Caching (Redis)
- **Response caching** for JSON API endpoints (`getAllCrimes`, `getCrime`) via `cacheMiddleware`
- **View caching** for server-rendered pages (`home`, `map`, `analytics`, `allCrimes`, `userDetails`, `dashboard`) via `viewCacheMiddleware`
- **Per-user cache isolation** for personalized routes (`home`, `map`, `dashboard`) using `{ perUser: true }` option
- **Global notification count caching** in app.js middleware (30s TTL) to eliminate per-request DB hits
- **Production-safe invalidation** using `SCAN` instead of `KEYS` to avoid blocking Redis
- **Cache-Control headers** set on all cached responses
- **Graceful degradation** - all cache operations catch errors and continue without cache if Redis is unavailable
- **Automatic invalidation** on crime create/update across all related cache patterns

### 2.7 Production Readiness
- Graceful shutdown handling (`SIGTERM`)
- Unhandled rejection and uncaught exception handlers
- Environment-based configuration (`config.env`)
- Development-only logging (morgan)

---

## 3. CONS (Weaknesses & Issues)

### 3.1 CRITICAL: Secrets Exposed in config.env (Committed to Git)
- **`config.env` is tracked in git** despite being in `.gitignore` - the file exists in the repo with ALL secrets visible
- Database credentials, JWT secret, API keys (HERE, Brevo, Mailtrap) are all in plaintext
- The `.gitignore` only has `config.env` listed, meaning it was likely added AFTER the file was already committed
- **Impact:** Complete system compromise. Anyone with repo access has DB credentials, API keys, and can forge JWTs

### 3.2 Security Vulnerabilities
- **Weak JWT secret:** `jhsdhsdvsdvsdcjkkjvsvddvsfvbsfbdfuyibdidbcmk` - appears randomly generated but is hardcoded and short for production use
- **CORS hardcoded to localhost:** `origin: "http://localhost:3000"` - won't work in production deployment without changing
- **No email verification on login** - the `isLoggedIn` middleware silently ignores errors
- **`createUser` sets password to `00000000`** - hardcoded weak default password with no forced change
- **Rate limiter comment says "60 minutes" but window is 15 minutes** - misleading comment
- **The `allCrimes` API endpoint has no authentication** - public access to all crime data including potentially sensitive descriptions
- **No CSRF protection** - relies only on `sameSite: "Strict"` cookies

### 3.3 Code Quality Issues
- **Unused/dead code:** `email.js` (old email utility) is never imported anywhere but still exists
- **Unused imports:** `const { set } = require("mongoose")` in crimesController.js:11 - `set` is never used
- **`isLoggedIn` has undeclared `token` variable:** Line 161 uses `token = req.cookies.jwt` without `let`/`const` - creates implicit global
- **Inconsistent error codes:** `protect` returns 503 for missing token (should be 401)
- **Mixed coding patterns:** Some files use `const X = require("...")`, others mix with destructuring
- **Multiple `console.log` statements** left in production code (viewController.js:324, 377, 399, 429; authController.js:44, 209)
- **Typo in function name:** `suspentAccount` should be `suspendAccount` (authController.js:289)
- **Typo in function name:** `dashborad` should be `dashboard` (viewController.js:190)
- **Comment says "60 minutes"** but rate limit window is 15 minutes (app.js:107)

### 3.4 Missing Features / Incomplete Implementation
- **Contact form** on the homepage has no backend handler - form submission does nothing
- **`UpdateLog` in `updatePassword`** references `UpdateLog` without importing it (authController.js:276)
- **Commented-out routes:** `cartRouter`, `orderRouter`, `categoryRouter` suggest incomplete features
- **No pagination** on `getAllCrimes` - loads ALL records at once (will not scale)
- **No search/filtering on the API endpoint** - returns everything
- **No data validation on the update endpoint** - uses `$set: req.body` directly, allowing arbitrary field updates
- **No logging/audit trail for logins** - only crime updates are logged

### 3.5 Performance Concerns
- **`getAllCrimes` fetches all records without pagination** - will degrade with data growth
- **No database connection error handling** in server.js - `mongoose.connect()` doesn't have `.catch()`
- **`dashboard.pug` includes axios via CDN `<script>` tag** despite it already being in the bundle
- **Tailwind loaded via CDN** (`<script src="https://cdn.tailwindcss.com">`) in some views - not recommended for production
- ~~**No caching strategy** - all queries hit MongoDB directly~~ **Resolved:** Redis caching implemented for API responses, views, and global counters

### 3.6 Testing & DevOps
- **Zero tests** - `package.json` scripts.test is just `echo "Error: no test specified"`
- **No linting configuration** - no ESLint or Prettier setup
- **No CI/CD pipeline** configuration
- **No Docker/containerization** setup
- **No health check endpoint**
- **`nodemon` used in `start:prod`** script - should use plain `node` in production
- **No environment validation** on startup - app will crash if required env vars are missing

### 3.7 Frontend Issues
- **Map data embedded in HTML** via `data-crimes` attribute - will break with large datasets (entire JSON payload in HTML)
- **Inline scripts in pug templates** mixing with bundled JS - inconsistent approach
- **Contact form** has no `action` or JS handler
- **No form validation** on the frontend (e.g., required fields, email format) beyond what the browser provides
- **Dashboard admin check:** `if user.role==="responder" && user.role === 'admin'` (dashboard.pug:60) - this condition is ALWAYS false (a user can't be both roles simultaneously)

### 3.8 Database Design
- **`confirmTokenExpires` is `String` type** (userModel.js:55) - should be `Date` for proper querying and comparison
- **`date` field has duplicate `required`** in crimeModel.js:30 - `required: [true, "Date is required"], type: Date, required: true`
- **No index on `reportId`** field despite using it for lookups frequently (only unique constraint)
- **No TTL index on notifications** - old notifications accumulate forever
- **`active` field defaults to `false`** - new users can't log in until admin activates, but there's no admin notification for pending activations

### 3.9 Documentation
- **No README.md** in the project root
- **No API documentation** (Swagger/OpenAPI)
- **No inline code comments** explaining complex logic (geo-duplicate detection, auth flow)
- **Misleading comments** throughout (rate limiter description, etc.)

---

## 4. FILE STRUCTURE ANALYSIS

```
GIS Project/
├── app.js                    # Express app setup, middleware, routes
├── server.js                 # Server entry point, DB connection, process handlers
├── config.env                # Environment variables (SECRETS - should not be committed)
├── package.json              # Dependencies and scripts
├── tailwind.config.js        # Tailwind CSS configuration
├── controllers/
│   ├── authController.js     # Auth: signup, login, protect, roles, password reset, user mgmt
│   ├── crimesController.js   # Crime CRUD, geocoding, duplicate check, Excel export
│   ├── errorController.js    # Centralized error handling (dev/prod modes)
│   └── viewController.js     # Page rendering for all views
├── models/
│   ├── crimeModel.js         # Crime report schema with GeoJSON + 2dsphere index
│   ├── userModel.js          # User schema with bcrypt, JWT, tokens
│   ├── notificationModel.js  # Simple notification schema
│   └── update_log_model.js   # Audit log for record changes
├── routes/
│   ├── crimeRoutes.js        # Crime API routes with rate limiting
│   ├── userRoutes.js         # Auth API routes with login rate limiting
│   └── viewRoutes.js         # Page routes with auth middleware
├── utils/
│   ├── appError.js           # Custom error class
│   ├── cache.js              # Redis cache middleware + invalidation helpers
│   ├── catchAsync.js         # Async error wrapper
│   ├── customfuncs.js        # JWT token signing helper
│   ├── email.js              # Old email utility (UNUSED)
│   ├── emailBrevo.js         # Active email utility (Mailtrap + Brevo)
│   ├── redis.js              # Redis client (ioredis) with connection/retry logic
│   └── slidingWindow.js      # Custom in-memory rate limiter
├── views/                    # Pug templates (19 files)
│   ├── *.pug                 # Page templates
│   └── email/*.pug           # Email templates
├── public/
│   ├── js/                   # Frontend JavaScript (7 files)
│   ├── output.css            # Compiled Tailwind CSS
│   └── *.png, *.jpg          # Static assets
└── src/
    └── input.css             # Tailwind source CSS
```

---

## 5. DEPENDENCY ANALYSIS

### Production Dependencies (18)
| Package | Version | Purpose | Notes |
|---------|---------|---------|-------|
| express | ^5.1.0 | Web framework | Express 5 (latest) - good |
| mongoose | ^8.19.1 | MongoDB ODM | Latest major - good |
| pug | ^3.0.3 | Template engine | Server-side rendering |
| tailwindcss | ^4.1.14 | CSS framework | v4 (latest) |
| bcrypt | ^6.0.0 | Password hashing | Good |
| jsonwebtoken | ^9.0.2 | JWT auth | Good |
| helmet | ^8.1.0 | Security headers | Good |
| express-rate-limit | ^8.1.0 | Rate limiting | Good |
| express-mongo-sanitize | ^2.2.0 | NoSQL injection prevention | Good |
| hpp | ^0.2.3 | Parameter pollution protection | Good |
| sanitize-html | ^2.17.0 | XSS prevention | Good |
| axios | ^1.12.2 | HTTP client (geocoding) | Used in controller |
| nodemailer | ^6.9.4 | Email sending | Used for Mailtrap |
| mailtrap | ^4.3.0 | Dev email testing | Good |
| exceljs | ^4.4.0 | Excel export | Good |
| cookie-parser | ^1.4.7 | Cookie parsing | Good |
| cors | ^2.8.5 | CORS | Configured but hardcoded origin |
| dotenv | ^17.2.3 | Env config | Good |
| validator | ^13.15.15 | String validation | Used in user model |
| morgan | ^1.10.1 | HTTP logging | Dev only - good |
| html-to-text | ^9.0.5 | Email text fallback | Good |
| ioredis | ^6.0.0 | Redis client | Response/view caching, invalidation |

### Dev Dependencies (3)
| Package | Version | Purpose |
|---------|---------|---------|
| cross-env | ^10.1.0 | Cross-platform env vars |
| autoprefixer | ^10.4.21 | CSS autoprefixer |
| postcss | ^8.5.6 | CSS processing |

### Notable: `@tailwindcss/cli` and `@tailwindcss/vite` are in production deps but should be dev deps

---

## 6. RECOMMENDATIONS

### Immediate (High Priority)
1. **Rotate ALL secrets** in `config.env` since they've been committed to git
2. **Fix the `dashboard.pug` admin check** (line 60) - the condition `user.role==="responder" && user.role === 'admin'` is impossible
3. **Add `.catch()` to `mongoose.connect()`** in server.js
4. **Fix the `UpdateLog` missing import** in `authController.js` `updatePassword`
5. **Fix undeclared `token` variable** in `isLoggedIn` middleware
6. **Fix function name typos:** `suspentAccount` -> `suspendAccount`, `dashborad` -> `dashboard`
7. **Remove dead code:** `email.js`, unused imports, `console.log` statements
8. **Add pagination** to `getAllCrimes` endpoint
9. **Validate and whitelist update fields** in `updateCrime` instead of `$set: req.body`

### Medium Priority
10. **Add input validation** on the frontend (required fields, email format)
11. **Implement the contact form** backend handler
12. **Add a health check endpoint** (`/health`)
13. **Move unread count query** out of global middleware (use caching or compute only when needed)
14. **Fix `confirmTokenExpires` type** from String to Date
15. **Add proper `.env.example`** file for required environment variables
16. **Add environment variable validation** on app startup
17. **Move `@tailwindcss/cli` and `@tailwindcss/vite`** to devDependencies
18. **Use `node` instead of `nodemon`** in `start:prod` script

### Low Priority (Improvements)
19. **Add ESLint and Prettier** configuration
20. **Write unit and integration tests**
21. **Add API documentation** with Swagger/OpenAPI
22. **Create a README.md** with setup instructions
23. ~~**Implement caching** (Redis) for frequently accessed data~~ **Done:** Redis caching implemented via `utils/cache.js` and `utils/redis.js`
24. **Add Docker support** for consistent deployments
25. **Replace CDN Tailwind** with compiled CSS in production
26. **Consider JSON payload size** for map data (streaming/pagination)
27. **Add TTL index** on notifications for automatic cleanup
28. **Add index on `reportId`** for faster lookups

---

## 7. SUMMARY

| Aspect | Rating | Notes |
|--------|--------|-------|
| Security | 6/10 | Good middleware setup but secrets exposed, weak JWT config |
| Architecture | 7/10 | Clean MVC, good error handling, but some code quality issues |
| Features | 8/10 | Comprehensive feature set for a crime reporting system |
| Code Quality | 5/10 | Typos, dead code, unused imports, inconsistent patterns |
| Testing | 0/10 | No tests whatsoever |
| Documentation | 2/10 | No README, no API docs, minimal comments |
| Performance | 7/10 | Redis caching for API/views/counters, but no pagination |
| Scalability | 4/10 | Loads all data, no pagination, CDN-based Tailwind |
| Production Readiness | 4/10 | Nodemon in prod, secrets in repo, no health checks |
| Overall | 6/10 | Solid prototype/MVP with caching, but security and quality gaps remain |

**Verdict:** This is a well-structured MVP/final year project that demonstrates strong understanding of Node.js/Express patterns, security middleware, GIS integration, and now Redis caching. The main concerns are the exposed secrets (critical security issue), lack of tests, and several code quality issues that should be addressed before any production deployment.
