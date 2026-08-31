<div align="center">

# 🗺️ Crime Repo
### GIS-Based Crime Reporting & Analysis System for Kano State, Nigeria

*Report it. Map it. Act on it.*


| | | |
|:---:|:---:|:---:|
| ![Screenshot 1](https://github.com/c0dnux/KANO-GIS/raw/9b946d9f30bf76caeed8e3512af55e74d1d019f1/Screenshot_2026-08-31_13-18-40.png) | ![Screenshot 2](https://github.com/c0dnux/KANO-GIS/raw/9b946d9f30bf76caeed8e3512af55e74d1d019f1/Screenshot_2026-08-31_13-19-44.png) | ![Screenshot 3](https://github.com/c0dnux/KANO-GIS/raw/9b946d9f30bf76caeed8e3512af55e74d1d019f1/Screenshot_2026-08-31_13-21-22.png) |
| ![Screenshot 4](https://github.com/c0dnux/KANO-GIS/raw/9b946d9f30bf76caeed8e3512af55e74d1d019f1/Screenshot_2026-08-31_13-21-52.png) | ![Screenshot 5](https://github.com/c0dnux/KANO-GIS/raw/9b946d9f30bf76caeed8e3512af55e74d1d019f1/Screenshot_2026-08-31_13-22-04.png) | ![Screenshot 6](https://github.com/c0dnux/KANO-GIS/raw/9b946d9f30bf76caeed8e3512af55e74d1d019f1/Screenshot_2026-08-31_13-22-42.png) |

</div>

---

## 📍 Overview

**Crime Repo** is a full-stack, server-rendered web application that lets citizens report crimes in real time, gives administrators the tools to verify and manage reports, and lets responders track and update case statuses — all on top of an interactive GIS map.

Under the hood it combines **geocoding**, **geospatial duplicate detection**, **role-based access control**, **Redis caching**, and a **severity-weighted heatmap** to turn raw crime reports into an actionable picture of what's happening, where.

> Built as a final-year Software Engineering project — Bayero University, Kano.

---

## ✨ Features

| | |
|---|---|
| 🚨 **Crime Reporting** | Citizens submit reports with automatic address-to-coordinate geocoding (HERE API) |
| 🧭 **Interactive GIS Map** | Leaflet + OpenStreetMap, with marker clustering and filters by type, date, and location |
| 🔥 **Heatmap Mode** | Toggle between marker view and a crime-severity-weighted heatmap (Murder → Theft) |
| 🕵️ **Duplicate Detection** | Geo + time + crime-type proximity checks stop the same incident being reported twice |
| 🔐 **Role-Based Access** | Admin, Responder, and User roles with dedicated permissions |
| 📊 **Admin Analytics** | Dashboard with charts, user management, and suspension/ban controls |
| 📥 **Excel Export** | One-click `.xlsx` report generation via ExcelJS |
| 🔔 **Notifications** | In-app updates whenever a reported crime's status changes |
| ✉️ **Email Flows** | Signup confirmation, password reset, and update notifications (Mailtrap dev / Brevo prod) |
| ⚡ **Redis Caching** | Response, view, and per-user caching with automatic invalidation |
| 🌗 **Dark Mode** | System-aware theme toggle across the whole UI |
| 📱 **Responsive UI** | Mobile-first layout with a collapsible nav |

---

## 🏗️ Architecture

Crime Repo follows a clean **MVC** structure on top of Express 5:

```
GIS Project/
├── app.js                 # Express app setup, middleware, routes
├── server.js              # Entry point, DB connection, process handlers
├── controllers/           # authController, crimesController, viewController, errorController
├── models/                # crimeModel (GeoJSON + 2dsphere), userModel, notificationModel, update_log_model
├── routes/                # crimeRoutes, userRoutes, viewRoutes
├── utils/                 # cache.js, redis.js, emailBrevo.js, appError.js, catchAsync.js
├── views/                 # Pug templates + email templates
└── public/                # Frontend JS (map.js, api.js, auth.js), compiled Tailwind CSS
```

**Key design choices:**
- 🔑 **Auth** — JWT stored in `httpOnly` cookies (`sameSite: Strict` + `secure` in prod)
- 🌍 **Geospatial data** — GeoJSON `Point` schema with MongoDB `2dsphere` indexing
- ♻️ **API resilience** — centralized Axios client (`public/js/api.js`) with automatic token refresh and a request queue to prevent race conditions on concurrent 401s
- 🧯 **Error handling** — custom `AppError` class + `catchAsync` wrapper + dev/prod error controller
- 🗃️ **Audit trail** — every crime-record change is logged via `update_log_model.js`

---

## 🛡️ Security

- **Helmet.js** with a full Content Security Policy tuned for every external CDN/API in use
- **Rate limiting** at multiple tiers — global, login, and public crime API
- **NoSQL injection & XSS protection** via `express-mongo-sanitize` and `sanitize-html`
- **HTTP parameter pollution protection** via `hpp`
- **bcrypt** password hashing (12 salt rounds) with password-change JWT invalidation
- **Field whitelisting** on signup and role-restricted routes via `restrictTo()`

---

## 🧰 Tech Stack

<div align="center">

| Layer | Technology |
|---|---|
| **Runtime** | Node.js |
| **Framework** | Express 5 |
| **Database** | MongoDB + Mongoose (2dsphere geospatial indexing) |
| **Templating** | Pug |
| **Styling** | Tailwind CSS 4 |
| **Maps** | Leaflet.js + MarkerCluster + Leaflet.heat |
| **Geocoding** | HERE Geocode API |
| **Caching** | Redis (ioredis) |
| **Email** | Mailtrap (dev) / Brevo API (prod) |
| **Exports** | ExcelJS |

</div>

---

## 🚀 Getting Started

```bash
# Clone the repo
git clone https://github.com/c0dnux/crime-repo.git
cd crime-repo

# Install dependencies
npm install

# Configure environment variables
cp .env.example config.env
# then fill in your MongoDB URI, JWT secret, HERE API key,
# Mailtrap/Brevo credentials, and Redis connection details

# Run in development
npm run dev

# Run in production
npm start
```

> ⚠️ **Never commit `config.env`.** Rotate any secrets that have previously been pushed to version control.

---

## 🗂️ Roles at a Glance

| Role | Can Do |
|---|---|
| **User** | Submit crime reports, view public map, receive notifications |
| **Responder** | Update crime status, view assigned reports |
| **Admin** | Manage users (suspend/ban), verify reports, view analytics, export data |

---

## 🗺️ Roadmap

- [ ] Pagination on the public crimes API
- [ ] Swagger/OpenAPI documentation
- [ ] Automated test suite (unit + integration)
- [ ] Docker support for consistent deployments
- [ ] CI/CD pipeline
- [ ] Health check endpoint

---

## 👤 Author

**Abdulrahman Mustapha Sani**
B.Sc. Software Engineering, Bayero University, Kano

[![GitHub](https://img.shields.io/badge/GitHub-c0dnux-181717?style=flat-square&logo=github)](https://github.com/c0dnux)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?style=flat-square&logo=linkedin)](https://ng.linkedin.com/in/abdulrahman-mustapha-b92699246)

---

<div align="center">

*Built to make Kano State a little safer, one report at a time.* 🇳🇬

</div>
