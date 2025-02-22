import express from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;
const BASE_DIR = "/tmp/repos"; // Use /tmp for compatibility with Render

// Ensure base directory exists
if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
}

// API to Clone Repo and Run
app.post("/run-repo", async (req, res) => {
    const { repoUrl } = req.body;
    if (!repoUrl) {
        return res.status(400).json({ error: "Repo URL is required" });
    }

    const repoName = repoUrl.split("/").pop().replace(".git", "");
    const repoPath = path.join(BASE_DIR, repoName);

    // Clone Repo
    exec(`git clone ${repoUrl} ${repoPath}`, (error, stdout, stderr) => {
        if (error) return res.status(500).json({ error: `Git clone failed: ${stderr}` });

        // Install Dependencies
        exec(`cd ${repoPath} && npm install`, (error, stdout, stderr) => {
            if (error) return res.status(500).json({ error: `NPM install failed: ${stderr}` });

            res.json({ message: "Repo cloned and dependencies installed!", logs: stdout });
        });
    });
});

// Start Express Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
