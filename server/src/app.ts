import express from "express";
import cors from "cors";
import helmet from "helmet";
import planRouter from "./routes/plan.routes";
import videoRouter from "./routes/video.routes";
import chapterRouter from "./routes/chapter.routes";
import { errorHandler } from "./middleware/errorHandler.middleware";

const app = express();

app.set("trust proxy", 1);

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use("/api", planRouter);
app.use("/api", videoRouter);
app.use("/api", chapterRouter);

app.use(errorHandler);

export default app;
