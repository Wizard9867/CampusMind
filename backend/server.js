const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const db = require("./db");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json());
app.use(cors({ origin: "*" }));

// ---------------- REGISTER ----------------
app.post("/register", async (req, res) => {
    const { name, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const sql = "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

    db.query(sql, [name, email, hashedPassword, role], (err) => {
        if (err) return res.status(500).json({ message: "User exists" });
        res.json({ message: "Registered" });
    });
});

// ---------------- FILE UPLOAD ----------------
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
    }
});

const upload = multer({ storage });

app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }

    res.json({
        message: "File uploaded successfully",
        fileName: req.file.filename
    });
});

// ---------------- STATS ----------------
app.get("/stats", (req, res) => {
    const files = fs.readdirSync(uploadsPath);

    res.json({
        totalResources: files.length,
        documents: files.length
    });
});

// ---------------- SERVER START ----------------
app.listen(3000, () => {
    console.log("Backend running at http://localhost:3000");
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const user = results[0];

        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return res.status(400).json({ message: "Invalid credentials" });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role },
            "SUPER_SECRET_KEY",
            { expiresIn: "1h" }
        );

        res.json({
            message: "Login successful",
            token,
            role: user.role
        });
    });
});
