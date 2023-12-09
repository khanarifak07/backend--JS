import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

const app = express();

//Configuration for cross origin resource sharing
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
//configuration for json response
app.use(
  express.json({
    limit: "16kb",
  })
);
//configuration for url response
app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  })
);
//configuration for some assets e.g. pdf, images, some files
app.use(express.static("public"));
//configuration for cookie-parser
app.use(cookieParser());

export { app };


