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
  {
    description: "Armed robbery at a petrol station. Suspects fled with over 500,000 naira.",
    crimeType: "Theft",
    date: new Date("2025-08-07T21:10:00"),
    status: "Under Investigation",
    crimeAuth: "Verified",
    location: {
      address: "NNPC Filling Station, GSM Village",
      city: "Kano",
      localGovernment: "Nassarawa",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.545, 11.985] },
    },
    victims: 3,
  },
  {
    description: "Fraudulent land deal reported. Victim lost over 2 million naira in fake allocation.",
    crimeType: "Fraud",
    date: new Date("2025-08-08T10:00:00"),
    status: "Under Investigation",
    crimeAuth: "Pending",
    location: {
      address: "Hotoro GRA",
      city: "Kano",
      localGovernment: "Kano Municipal",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.56, 12.0] },
    },
    victims: 1,
  },
  {
    description: "Multiple vehicles set on fire during a protest. Property damage extensive.",
    crimeType: "Vandalism",
    date: new Date("2025-08-09T15:30:00"),
    status: "Unknown",
    crimeAuth: "Pending",
    location: {
      address: "Farm Center Roundabout",
      city: "Kano",
      localGovernment: "Kano Municipal",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.53, 12.01] },
    },
    victims: 0,
  },
  {
    description: "Hit-and-run incident on a busy highway. Victim hospitalized with critical injuries.",
    crimeType: "Assault",
    date: new Date("2025-08-10T07:45:00"),
    status: "Under Investigation",
    crimeAuth: "Verified",
    location: {
      address: "Kano-Kaduna Expressway",
      city: "Kano",
      localGovernment: "Ungogo",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.49, 12.03] },
    },
    victims: 1,
  },
  {
    description: "Attempted kidnapping of a school child. Child was rescued by bystanders.",
    crimeType: "Kidnapping",
    date: new Date("2025-08-11T13:00:00"),
    status: "Resolved",
    crimeAuth: "Verified",
    location: {
      address: "Tudun Murtala Primary School",
      city: "Kano",
      localGovernment: "Tarauni",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.535, 11.995] },
    },
    victims: 1,
  },
  {
    description: "Shooting reported near a night club. Two people injured.",
    crimeType: "Murder",
    date: new Date("2025-08-12T02:15:00"),
    status: "Under Investigation",
    crimeAuth: "Pending",
    location: {
      address: "Club Road, GRA",
      city: "Kano",
      localGovernment: "Kano Municipal",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.52, 12.015] },
    },
    victims: 2,
  },
  {
    description: "Internet cafe used for identity theft. Over 50 victims identified.",
    crimeType: "Fraud",
    date: new Date("2025-08-14T11:30:00"),
    status: "Under Investigation",
    crimeAuth: "Verified",
    location: {
      address: "Sabon Gari Market Area",
      city: "Kano",
      localGovernment: "Fagge",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.515, 12.005] },
    },
    victims: 50,
  },
  {
    description: "Motorcycle stolen from outside a mosque during Friday prayers.",
    crimeType: "Theft",
    date: new Date("2025-08-15T12:45:00"),
    status: "Unknown",
    crimeAuth: "Pending",
    location: {
      address: "Central Mosque, Kofar Mata",
      city: "Kano",
      localGovernment: "Kano Municipal",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.518, 12.008] },
    },
    victims: 1,
  },
  {
    description: "Chemical spill from a tanker truck blocking major road. Environmental hazard reported.",
    crimeType: "Other",
    date: new Date("2025-08-16T09:00:00"),
    status: "Under Investigation",
    crimeAuth: "Verified",
    location: {
      address: "Jakara Bridge",
      city: "Kano",
      localGovernment: "Kano Municipal",
      state: "Kano",
      coordinates: { type: "Point", coordinates: [8.51, 12.01] },
    },
    victims: 0,
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

  

    // Create Admin
    const user = await User.create({
      name: "Sani Abdulrahman",
      email: "saniabdulrahman851@gmial.com",
      password: "password123",
      confirmPassword: "password123",
      role: "admin",
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
