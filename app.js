const express = require("express");
const app = express();
const cors = require("cors");
const errorController = require("./controllers/errorController");
require("dotenv").config();
const AppError = require("./utils/appError");
const Notification = require("./models/notificationModel");
const userRouter = require("./routes/userRoutes");
const crimeRouter = require("./routes/crimeRoutes");
const viewRouter = require("./routes/viewRoutes");
const slidingWindow = require("./utils/slidingWindow");
const helmet = require("helmet");
const ems = require("express-mongo-sanitize");
const sanitizeHtml = require("sanitize-html");
const path = require("path");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const morgan = require("morgan");
const { cacheGet, cacheSet } = require("./utils/cache");
//            Global MiddleWares
app.set("trust proxy", 1);
//////CORS
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "http://localhost:3000",
    credentials: true,
  }),
);
//Set security HTTP headers
app.use(helmet());

app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],

      // ✅ Allow inline & CDN scripts (Leaflet, Tailwind, Paystack, etc.)
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'", // Some libraries (like Leaflet clustering) need this
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
        "https://js.paystack.co",
        "https://cdn.tailwindcss.com",
        "https://api.mapbox.com", // If you later use Mapbox
        "https://maps.googleapis.com", // For Google Maps JS API
        "https://*.hereapi.com", // For HERE maps/geocoding
      ],

      // ✅ Allow inline styles & Google Fonts
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "https://maxcdn.bootstrapcdn.com",
        "https://fonts.googleapis.com",
        "https://unpkg.com", // For Leaflet CSS
      ],

      // ✅ Allow loading fonts from Google Fonts & CDNs
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "https://maxcdn.bootstrapcdn.com",
      ],

      // ✅ Allow images from CDN, inline, blob, and HTTPS (useful for map tiles)
      imgSrc: [
        "'self'",
        "data:",
        "blob:",
        "https:",
        "https://*.tile.openstreetmap.org",
        "https://*.googleusercontent.com",
      ],

      // ✅ Allow Leaflet map tile connections, HERE API, etc.
      connectSrc: [
        "'self'",
        "https://*.openstreetmap.org",
        "https://*.googleapis.com",
        "https://*.hereapi.com",
        "https://api.mapbox.com",
        "https://events.mapbox.com",
        "https://cdnjs.cloudflare.com", // <-- FIX: Add this line
      ],

      // ✅ Allow frames if you’re embedding Paystack or map widgets
      frameSrc: ["'self'", "https://js.paystack.co"],
    },
  }),
);

// Development Log

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limitter
const limiter = slidingWindow({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests. Try again in 15 minutes.",
});

app.use(express.static(path.join(__dirname, "public")));

app.use(limiter);
//Body Parser (req.body)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

//data sanitization against NoSQL query injection
/* The below code is to fix an issue with req.query being non-writable in some environments. */
app.use((req, _res, next) => {
  Object.defineProperty(req, "query", {
    ...Object.getOwnPropertyDescriptor(req, "query"),
    value: req.query,
    writable: true,
  });

  next();
});
app.use(ems());

//Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  }),
);

//Data sanitization against XSS
app.use((req, res, next) => {
  if (req.body) {
    req.body = JSON.parse(
      JSON.stringify(req.body, (key, value) =>
        typeof value === "string"
          ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
          : value,
      ),
    );
  }
  next();
});
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
// Middleware to make unread count available everywhere
app.use(async (req, res, next) => {
  res.locals.unreadCount = 0;
  if (req.cookies.jwt) {
    try {
      const cached = await cacheGet("global:unreadCount");
      if (cached !== null) {
        res.locals.unreadCount = cached;
      } else {
        const unreadCount = await Notification.countDocuments({ readAt: null });
        res.locals.unreadCount = unreadCount;
        await cacheSet("global:unreadCount", unreadCount, 30);
      }
    } catch (err) {
      res.locals.unreadCount = 0;
    }
  }
  next();
});
//Routes

app.use("/", viewRouter);
// app.use("/api/v1/cart", cartRouter);
// app.use("/api/v1/order", orderRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/crimes", crimeRouter);
// app.use("/api/v1/category", categoryRouter);

//Catch undefinded path
app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server.`, 404));
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use(errorController);
module.exports = app;
