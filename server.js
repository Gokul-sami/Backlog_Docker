import express from "express";
import { exec } from "child_process";
import fs from "fs";
import path from "path";

const app = express();
app.use(express.json());

const BASE_DIR = "/app/repos";  // Railway stores cloned repos here

// Ensure base directory exists
if (!fs.existsSync(BASE_DIR)) {
    fs.mkdirSync(BASE_DIR, { recursive: true });
}

// API to Clone Repo and Run in Docker
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

        // Generate Dockerfile dynamically
        let dockerfileContent = `
        FROM node:latest
        WORKDIR /app
        COPY . .
        RUN npm install
        CMD ["npm", "start"]
        `;

        fs.writeFileSync(path.join(repoPath, "Dockerfile"), dockerfileContent);

        // Build & Run Docker Container
        const containerName = `container-${Date.now()}`;
        exec(`docker build -t ${containerName} ${repoPath} && docker run --rm ${containerName}`, (error, stdout, stderr) => {
            if (error) return res.status(500).json({ error: `Execution failed: ${stderr}` });
            
            res.json({ message: "Project executed!", logs: stdout });
        });
    });
});

// Start Express Server
app.listen(5000, () => console.log("Server running on Railway"));
