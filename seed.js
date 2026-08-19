const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/userModel");
const CrimeReport = require("./models/crimeModel");
const Notification = require("./models/notificationModel");

dotenv.config({ path: "./config.env" });

const DB_LOCAL = process.env.DB_LOCAL;
const DB_ONLINE = process.env.DB_ONLINE_COMPASS.replace(
  "<db_password>",
  process.env.DB_PASSWORD
);

const DB = process.env.NODE_ENV === "development" ? DB_LOCAL : DB_ONLINE;

const sampleCrimes = [
  {
    description: "Armed robbery at a bank on Murtala Muhammad Way. Three suspects fled with cash.",
    crimeType: "Theft",
    date: new Date("2025-07-10T09:30:00"),
    status: "Under Investigation",
    crimeAuth: "Verified",
    location: {
      address: "15 Murtala Muhammad Way",
      city: "Kano",
      localGovernment: "Kano Municipal",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.5167, 12.0] },
    },
    victims: 5,
  },
  {
    description: "Physical assault near Sabo market. Victim sustained minor injuries.",
    crimeType: "Assault",
    date: new Date("2025-07-12T14:15:00"),
    status: "Unknown",
    crimeAuth: "Pending",
    location: {
      address: "Sabo Market Road",
      city: "Kano",
      localGovernment: "Kano Municipal",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.52, 12.01] },
    },
    victims: 1,
  },
  {
    description: "Online fraud scheme targeting elderly residents. Suspect used fake investment platform.",
    crimeType: "Fraud",
    date: new Date("2025-07-15T11:00:00"),
    status: "Resolved",
    crimeAuth: "Verified",
    location: {
      address: "34 Ahmadu Bello Way",
      city: "Kano",
      localGovernment: "Nassarawa",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.53, 11.98] },
    },
    victims: 12,
  },
  {
    description: "Vandalism of public property at Kofar Mata. Windows and doors damaged.",
    crimeType: "Vandalism",
    date: new Date("2025-07-18T22:45:00"),
    status: "Unknown",
    crimeAuth: "Pending",
    location: {
      address: "Kofar Mata Area",
      city: "Kano",
      localGovernment: "Kano Municipal",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.515, 12.005] },
    },
    victims: 0,
  },
  {
    description: "Kidnapping incident near Fagge area. Victim rescued by police.",
    crimeType: "Kidnapping",
    date: new Date("2025-07-20T03:20:00"),
    status: "Resolved",
    crimeAuth: "Verified",
    location: {
      address: "Fagge Junction",
      city: "Kano",
      localGovernment: "Fagge",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.51, 12.015] },
    },
    victims: 1,
  },
  {
    description: "Burglary at residential home in Brigade. Electronics and cash stolen.",
    crimeType: "Theft",
    date: new Date("2025-07-22T01:30:00"),
    status: "Under Investigation",
    crimeAuth: "Verified",
    location: {
      address: "Brigade Quarters",
      city: "Kano",
      localGovernment: "Tarauni",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.54, 11.99] },
    },
    victims: 2,
  },
  {
    description: "Reported murder near Kurmi market. Investigation ongoing.",
    crimeType: "Murder",
    date: new Date("2025-07-25T20:00:00"),
    status: "Under Investigation",
    crimeAuth: "Pending",
    location: {
      address: "Kurmi Market Road",
      city: "Kano",
      localGovernment: "Kano Municipal",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.518, 12.002] },
    },
    victims: 1,
  },
  {
    description: "Minor theft of mobile phone at a bus stop. Suspect identified.",
    crimeType: "Theft",
    date: new Date("2025-07-28T08:00:00"),
    status: "Resolved",
    crimeAuth: "Verified",
    location: {
      address: "Bus Stop, Zoo Road",
      city: "Kano",
      localGovernment: "Kano Municipal",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.525, 12.008] },
    },
    victims: 1,
  },
  {
    description: "Suspicious activity reported at warehouse district. Potential drug operation.",
    crimeType: "Other",
    date: new Date("2025-08-01T16:45:00"),
    status: "Unknown",
    crimeAuth: "Pending",
    location: {
      address: "Industrial Layout, Sharada",
      city: "Kano",
      localGovernment: "Kano Municipal",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.55, 11.97] },
    },
    victims: 0,
  },
  {
    description: "Assault during a traffic dispute. Dashcam footage available.",
    crimeType: "Assault",
    date: new Date("2025-08-05T17:20:00"),
    status: "Under Investigation",
    crimeAuth: "Verified",
    location: {
      address: "Hadejia Road Junction",
      city: "Kano",
      localGovernment: "Ungogo",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.50, 12.02] },
    },
    victims: 2,
  },
];

async function seed() {
  try {
    console.log("Connecting to database...");
    await mongoose.connect(DB);
    console.log("Connected successfully.\n");

    // Clear existing data
    await User.deleteMany({});
    await CrimeReport.deleteMany({});
    await Notification.deleteMany({});
    console.log("Cleared existing data.");

    // Create admin user
    const admin = await User.create({
      name: "Admin User",
      email: "admin@crimerepo.com",
      password: "admin1234",
      confirmPassword: "admin1234",
      role: "admin",
      active: true,
      accessStatus: { status: "granted" },
    });
    console.log(`Admin created: ${admin.email} (id: ${admin._id})`);

    // Create the requested user
    const user = await User.create({
      name: "Sani Abdulrahman",
      email: "saniabdulrahman851@gmial.com",
      password: "password123",
      confirmPassword: "password123",
      role: "user",
      active: true,
      accessStatus: { status: "granted" },
    });
    console.log(`User created: ${user.email} (id: ${user._id})`);

    // Create responder user
    const responder = await User.create({
      name: "Responder One",
      email: "responder@crimerepo.com",
      password: "respond1234",
      confirmPassword: "respond1234",
      role: "responder",
      active: true,
      accessStatus: { status: "granted" },
    });
    console.log(`Responder created: ${responder.email} (id: ${responder._id})`);

    // Create crime reports
    const crimes = [];
    for (let i = 0; i < sampleCrimes.length; i++) {
      const reporterId = i % 2 === 0 ? user._id : admin._id;
      const crime = await CrimeReport.create({
        ...sampleCrimes[i],
        reportedBy: reporterId,
      });
      crimes.push(crime);

      // Create notification for each crime
      await Notification.create({
        crimeId: crime._id,
        createdAt: crime.createdAt,
      });
    }
    console.log(`\nCreated ${crimes.length} crime reports.`);

    // Print summary
    const totalUsers = await User.countDocuments();
    const totalCrimes = await CrimeReport.countDocuments();
    const totalNotifications = await Notification.countDocuments();

    console.log("\n--- Seed Summary ---");
    console.log(`Users: ${totalUsers}`);
    console.log(`Crimes: ${totalCrimes}`);
    console.log(`Notifications: ${totalNotifications}`);
    console.log("\nLogin credentials:");
    console.log(`  User:      saniabdulrahman851@gmial.com / password123`);
    console.log(`  Admin:     admin@crimerepo.com / admin1234`);
    console.log(`  Responder: responder@crimerepo.com / respond1234`);
    console.log("\nSeeding complete!");

    process.exit(0);
  } catch (err) {
    console.error("Seeding failed:", err);
    process.exit(1);
  }
}

seed();
