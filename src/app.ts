import express from "express";
import * as path from "path";
import cookieParser from "cookie-parser";
import logger from "morgan";
import compression from "compression";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import router from "./router";
import "./passport";
dotenv.config();
if (process.env.NODE_ENV !== "testing") {
  require("./dbConfigs/production");
}

const app = express();
app.set("port", process.env.PORT || 3000);
app.use(compression());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    const headers = {};
    headers["Access-Control-Allow-Origin"] = "*";
    headers["Access-Control-Allow-Methods"] = "POST, GET, PUT, DELETE, OPTIONS";
    headers["Access-Control-Allow-Credentials"] = true;
    headers["Access-Control-Max-Age"] = "86400"; // 24 hours
    headers["Access-Control-Allow-Headers"] = "*";
    res.writeHead(200, headers);
    res.end();
  } else {
    next();
  }
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "POST PUT GET");
  next();
});

app.use("/", router);

export default app;
