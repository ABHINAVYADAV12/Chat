require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();

const connection = require("./db/db.js");
const userRoute = require("./routes/userRoute.js");
const avatarRoute = require("./routes/avatarRoute.js");
const createWebSocketServer = require("./wsServer.js");

// Connect to the database
connection();

// Middlewares
app.use(express.json());
app.use(cookieParser());

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4000",
  "https://swifty-chatty-appy.onrender.com"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 204,
  credentials: true
};

app.use(cors(corsOptions));

// Routes
app.use("/api/user", userRoute);
app.use("/api/avatar", avatarRoute);

// Serve frontend in production
app.use(express.static(path.join(__dirname, "..", "frontend", "dist")));

app.get("/*", (req, res) => {
  res.sendFile(path.join(__dirname, "..", "frontend", "dist", "index.html"), err => {
    if (err) {
      console.error("Error sending file:", err);
      res.status(500).send("Error loading app");
    }
  });
});

// Start server
const port = process.env.PORT || 8000;
const server = app.listen(port, () => {
  console.log(`Application running on port ${port}`);
  createWebSocketServer(server);
});
