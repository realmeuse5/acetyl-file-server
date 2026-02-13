const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

const cors = require("cors");
app.use(cors({
    origin: [
        "http://127.0.0.1:3000",
        "https://realmeuse5.github.io",
        "https://acetyl-client.onrender.com"
    ],
    methods: ["GET", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"]
}));

// Storage config (Render version)
const UPLOAD_DIR = path.join(__dirname, "uploads");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, UPLOAD_DIR);
    },
    filename: (req, file, cb) => {
        const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, unique + ext);
    }
});

const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

app.use(express.json());

// Serve uploaded files
app.use("/uploads", express.static(UPLOAD_DIR));

// Test route
app.get("/", (req, res) => {
    res.send("File server is running.");
});

// Upload route
app.post("/upload", upload.single("file"), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }

    const fileUrl = `/uploads/${req.file.filename}`;
    res.json({ url: fileUrl });
});

// Delete file route
app.delete("/delete-file", (req, res) => {
    const filename = req.query.name;
    if (!filename) return res.status(400).json({ error: "Missing filename" });

    const filePath = path.join(UPLOAD_DIR, filename);

    fs.unlink(filePath, (err) => {
        if (err) {
            console.error("Failed to delete file:", err);
            return res.status(500).json({ error: "Failed to delete file" });
        }
        res.json({ success: true });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
