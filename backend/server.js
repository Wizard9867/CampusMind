const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("./db");
// const { v2: cloudinary } = require("cloudinary");
// const { CloudinaryStorage } = require("multer-storage-cloudinary");

const app = express();

app.use(express.static(path.join(__dirname, "..", "public")));

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/register", async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const checkSql = "SELECT * FROM users WHERE email = ?";
        db.query(checkSql, [email], async (checkErr, checkResults) => {

            if (checkErr) {
                console.log("DB CHECK ERROR:", checkErr);
                return res.status(500).json({ message: "Database error" });
            }

            if (checkResults.length > 0) {
                return res.status(400).json({ message: "User already exists" });
            }

            const hashedPassword = await bcrypt.hash(password, 10);

            const insertSql =
                "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)";

            db.query(insertSql, [name, email, hashedPassword, role], (insertErr) => {

                if (insertErr) {
                    console.log("DB INSERT ERROR:", insertErr);
                    return res.status(500).json({ message: "Insert failed" });
                }

                res.json({ message: "Registered successfully" });
            });
        });

    } catch (error) {
        console.log("REGISTER ERROR:", error);
        res.status(500).json({ message: "Server error" });
    }
});


app.post("/login", (req, res) => {

    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password required" });
    }

    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], async (err, results) => {

        if (err) {
            console.log("LOGIN DB ERROR:", err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
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

app.get("/stats", (req, res) => {

    try {
        const files = fs.readdirSync(uploadsPath);

        res.json({
            totalResources: files.length,
            documents: files.length
        });

    } catch (error) {
        res.status(500).json({ message: "Stats error" });
    }
});

app.listen(3000, () => {
    console.log("Backend running at http://localhost:3000");
});
