const express = require("express");
const app = express();
const errorController = require("./controllers/errorController");
require("dotenv").config();
const AppError = require("./utils/appError");
const userRouter = require("./routes/userRoutes");
const crimeRouter = require("./routes/crimeRoutes");
// const categoryRouter = require("./routes/categoryRoutes");
const viewRouter = require("./routes/viewRoutes");
// const cartRouter = require("./routes/cartRoutes");
// const orderRouter = require("./routes/orderRoutes");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const ems = require("express-mongo-sanitize");
const sanitizeHtml = require("sanitize-html");
const path = require("path");
const cookieParser = require("cookie-parser");
const hpp = require("hpp");
const morgan = require("morgan");
//            Global MiddleWares

//Set security HTTP headers
app.use(helmet());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "https://unpkg.com",
        "https://js.paystack.co",
        "https://cdn.tailwindcss.com",
      ],
      styleSrc: [
        "'self'",
        "'unsafe-inline'",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "https://maxcdn.bootstrapcdn.com",
        "https://fonts.googleapis.com", // ✅ Allow Google Fonts
      ],
      fontSrc: [
        "'self'",
        "https://fonts.gstatic.com",
        "https://cdnjs.cloudflare.com",
        "https://cdn.jsdelivr.net",
        "https://maxcdn.bootstrapcdn.com",
      ],

      imgSrc: [
        "'self'",
        "data:", // Allows inline Base64 images
        "https:", // Allows loading images from HTTPS sources
        "blob:", // If you're using Blob URLs for images
      ],
      connectSrc: ["'self'"],
    },
  })
);

// Development Log

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Limitter
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes
  limit: 20, // Limit each IP to 30 requests per `window` (here, per 60 minutes).
  standardHeaders: "draft-8", // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
  // store: ... , // Redis, Memcached, etc. See below.
  handler: (req, res, next) => {
    // Custom response when the limit is exceeded
    return next(
      new AppError("Trial limit exceeded. Wait after 60 minutes.", 429)
    );
  },
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
  })
);

//Data sanitization against XSS
app.use((req, res, next) => {
  if (req.body) {
    req.body = JSON.parse(
      JSON.stringify(req.body, (key, value) =>
        typeof value === "string"
          ? sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} })
          : value
      )
    );
  }
  next();
});
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
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

app.use(errorController);
module.exports = app;
