import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import compression from "compression";

const app = express();
const PORT = 8080;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(compression());

app.use(express.static(path.join(__dirname, "dist")));

app.get("/health", (req, res) => {
  console.log(`Received health request`);
  res.status(200).send("OK");
});

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server is running on port 8080 of this container`);
});
