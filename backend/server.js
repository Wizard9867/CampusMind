require("dotenv").config();
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");

const PORT = process.env.PORT || 3000;

const app = express();

app.use(express.static(path.join(__dirname, "..", "Public")));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ================= REGISTER =================
app.post("/register", async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if user exists
    const checkSql = "SELECT * FROM users WHERE email = $1";
    const checkResult = await db.query(checkSql, [email]);

    if (checkResult.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertSql =
      "INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4)";

    await db.query(insertSql, [name, email, hashedPassword, role]);

    res.json({ message: "Registered successfully" });

  } catch (error) {
    console.log("REGISTER ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= LOGIN =================
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const sql = "SELECT * FROM users WHERE email = $1";
    const result = await db.query(sql, [email]);

    if (result.rows.length === 0) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const user = result.rows[0];

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({
      message: "Login successful",
      token,
      role: user.role,
    });

  } catch (error) {
    console.log("LOGIN ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ================= FILE UPLOAD =================
const uploadsPath = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadsPath)) {
  fs.mkdirSync(uploadsPath);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  res.json({
    message: "File uploaded successfully",
    fileName: req.file.filename,
  });
});

// ================= STATS =================
app.get("/stats", (req, res) => {
  try {
    const files = fs.readdirSync(uploadsPath);

    res.json({
      totalResources: files.length,
      documents: files.length,
    });
  } catch (error) {
    res.status(500).json({ message: "Stats error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});