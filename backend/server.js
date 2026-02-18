const express = require("express");
const multer = require("multer");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const uploadsPath = path.join(__dirname, "uploads");

// Create uploads folder if it doesn't exist
if (!fs.existsSync(uploadsPath)) {
    fs.mkdirSync(uploadsPath);
}
const app = express();
app.use(cors({
    origin: "*"
}));

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
    const files = fs.readdirSync(uploadsPath);

    res.json({
        totalResources: files.length,
        documents: files.length
    });
});


app.listen(3000, () => {
    console.log("Backend running at http://localhost:3000");
});
