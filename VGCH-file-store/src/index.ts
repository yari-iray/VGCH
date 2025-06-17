import express, { Request, Response } from "express";
import multer from "multer";
import path from "path";
import fs, { readFileSync } from "fs";
import { authorize } from "./authMiddleware";
import { HttpStatusCode } from "axios";
import crypto from "crypto";
import { tokenHandler } from './tokenhandler';
import type { ContactRequest, Submission } from "./model";
import cors from 'cors';
import { marked } from "marked";
import { Synchronizer } from "./synchronizer";
import rateLimit from "express-rate-limit"

const port = process.env.PORT || 3000;

const limiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 100, 
  message: { message: "Too many requests" }
});

// Import config
const configPath = path.join(process.cwd(), "config.json");
let config: any;

try {
  const fileContent = fs.readFileSync(configPath, "utf-8");
  config = JSON.parse(fileContent);
} catch (err) {
  console.error("Error reading config.json:", err);
  throw err;
}

// Set logs
const LOG_DIR = "./log";
if (config.writeLogFile) {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR);
  }
}

const date = new Date();
const fileTablePath = path.join(process.cwd(), "FileTable.json")

const fileTableData: Record<string, string> = JSON.parse(
  fs.readFileSync(fileTablePath, "utf-8")
);
const fileTable: Map<string, string> = new Map(Object.entries(fileTableData));

let logFilePath = '';
if (config.writeLogFile) {
  logFilePath = path.join(
    process.cwd(),
    LOG_DIR,
    `app ${date.getFullYear()}-${date.getMonth()}-${date.getDate()}.log`
  );
}

// Check upload directory
const UPLOAD_DIR = "./uploads";
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR); // Save file here
  },
  filename: (req, file, callback) => {
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext; // Timestamp for file name
    callback(null, filename);
  },
});

// API endpoints
const upload = multer({ storage: storage });
const app = express();

app.use(express.json());
app.use(cors());
app.use(limiter);

const fileSynchronizer = new Synchronizer();


app.get("/", (req: Request, res: Response) => {
  res.send("This is the VGCH file store API");
});

// UPLOAD FILE
app.post(
  "/upload",
  authorize("admin"),
  upload.single("file"),
  (req: Request, res: Response) => {
    console.log(
      `${new Date().toLocaleDateString()} Incoming upload request, Auth success`
    );

    if (!req.params.name && !req.params.uri) {
      res
        .status(HttpStatusCode.BadRequest)
        .json({ message: "No uri or name provided" });
      return;
    }

    if (!req.file) {
      res
        .status(HttpStatusCode.BadRequest)
        .json({ message: "No file uploaded" });
      return;
    }

    res.status(200).json({
      message: "File uploaded successfully",
      file: req.file,
    });
  }
);

// GET BY FILENAME
app.get(
  "/files/:filename",
  authorize("user"),
  (req: Request, res: Response) => {
    const { filename } = req.params;
    const filePath = path.join(process.cwd(), UPLOAD_DIR, filename);

    console.log(
      `${new Date().toLocaleDateString()} Incoming request for: ${filePath}`
    );

    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res.status(404).json({ message: `File ${filename} not found` });
    }
  }
);

app.get(
  "/files/byIRI/:iri",
  authorize("user"),
  (req: Request, res: Response) => {
    const { iri } = req.params;

    console.log(
      `${new Date().toLocaleDateString()} Incoming request for: ${iri}`
    );

    const fileParts = iri.split("/");
    const strippedIri = fileParts.at(fileParts.length - 1) ?? "";

    const fileName = fileTable.get(strippedIri);
    if (!fileName) {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: `Key ${strippedIri} not present in file table` });
      return;
    }

    const filePath = path.join(process.cwd(), UPLOAD_DIR, fileName);
    if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
    } else {
      res
        .status(HttpStatusCode.NotFound)
        .json({ message: `File ${fileName} not found` });
    }
  }
);

app.post("/token", (req: Request, res: Response) => {
  tokenHandler.reload();
  const uuid = crypto.randomUUID();
  const expiration = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

  const tokenObj = {
    Value: uuid,
    Expiration: expiration,
    IsValid: true,
    Level: "user",
  };

  tokenHandler.addToken(tokenObj);
  res.json({ token: uuid, expires: expiration.toISOString() });
});

app.post("/submission", authorize("user"), async (req: Request, res: Response) => {
  const submission: Submission = req.body;

  if (!submission) {
    res.status(400).json({message: "No body provided"});
    return;
  }

  if (
    typeof submission.name !== "string" ||
    typeof submission.email !== "string" ||
    typeof submission.submission_type !== "string" ||
    typeof submission.message !== "string"
  ) {
    res.status(400).json({ message: "Invalid submission format" });
    return;
  }

  if (!submission.name || !submission.email || !submission.submission_type || !submission.message) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  submission.date = new Date();

  const validTypes = [
    "Update",
    "Missing/incorrect data",
    "Copyright",
    "Other"
  ];
  if (!validTypes.includes(submission.submission_type)) {
    res.status(400).json({ message: "Invalid submission type" });
    return;
  }

  const result = await fileSynchronizer.upload(submission);

  if (!result) {
    res.status(500).json({message: "An error occurred"});
    return;
  }

  res.status(200).json({ message: "Submission received" });
});

app.post("/contact", authorize("user"), async (req: Request, res: Response) => {
  const contactRequest: ContactRequest = req.body;

  if (
    typeof contactRequest !== "object" ||
    typeof contactRequest.name !== "string" ||
    typeof contactRequest.email !== "string" ||
    typeof contactRequest.message !== "string"
  ) {
    res.status(400).json({ message: "Invalid request format" });
    return;
  }

  if (!contactRequest.name || !contactRequest.email || !contactRequest.message) {
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  contactRequest.date = new Date();
  const result = await fileSynchronizer.upload(contactRequest);

  if (!result) {
    res.status(500).json({message: "An error occurred"});
    return;
  }

  res.status(200).json({ message: "Contact request received" });
});


const readmeCache = new Map<string, { html: string }>();
app.post("/readme", authorize("user"), async (req, res) => {
    if (!req.body.link) {
      res.status(400).json({message: "No link provided"})
      return;
    }

    const link = req.body.link.toLowerCase();
    const match = link.match(/github.com\/(.+?)\/(.+?)(\/|$)/);

    if (!link.includes('https://github.com/') || !match) {
        res.status(400).json({message: "invalid link"});
        return;
    }

    const owner = match[1];
    const repo = match[2];
    const cacheKey = `${owner}/${repo}`;

    if (readmeCache.has(cacheKey)) {
        const cached = readmeCache.get(cacheKey)!;
        res.status(200).json({text: cached.html});
        return;
    }

    let readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/main/README.md`;
    let response = await fetch(readmeUrl);
    if (!response.ok) {
        readmeUrl = `https://raw.githubusercontent.com/${owner}/${repo}/master/README.md`;
        response = await fetch(readmeUrl);
    }
    if (!response.ok) {
        res.status(500).json({message: `Could not fetch ${readmeUrl} `})
        console.error(
            `Could not fetch ${readmeUrl} `,
            response.status,
            response.statusText,
        );
        return;
    }

    const text = await response.text();
    const html = await marked.parse(text);
    readmeCache.set(cacheKey, { html });

    res.status(200).json({text: html});
});

// Start the server
app.listen(port, () => {
  console.log(`File store API running on http://localhost:${port}`);

  if (config.writeLogFile) {
    console.log(`Logs can be found under ${logFilePath}`);
  }

  if (config.writeLogFile) {
    console.log = (message) => {
      fs.appendFile(logFilePath, message + "\n", (err) => {
        if (err) {
          console.error("Error appending to log file:", err);
        }
      });
    };
  }
});

module.exports = app;