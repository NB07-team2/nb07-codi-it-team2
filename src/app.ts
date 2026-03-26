import express from "express";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import { PUBLIC_PATH, STATIC_PATH } from "./utils/constants";
import { errorHandler } from "./errors/errorHandler";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
//정적 파일 설정
app.use(STATIC_PATH, express.static(path.resolve(process.cwd(), PUBLIC_PATH)));

app.use(errorHandler);

export default app;
