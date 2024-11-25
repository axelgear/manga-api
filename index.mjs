import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import helmet from 'helmet';
import chapter from './routers/chapter.mjs';
import manga from './routers/manga.mjs';
// Load environment variables
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
// Middleware
app.use(cors());
app.use(helmet());
// Routes
app.use("/api", manga);
app.use(express.static("./public"));
app.use("/api/chapter", chapter);
// Default route
app.use("/api", (req, res) => {
  res.send({
    status: true,
    message: "hello",
  });
});
// 404 route
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "api path not found",
  });
});
// Start server
app.listen(PORT, () => {
  console.log(`Listening on PORT: ${PORT}`);
});
