require("dotenv").config()
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const generateFeed = require("./generateFeed")

const dataLimiter = rateLimit({
    message:
    "Easy there pal it's a t2 micro",
    windowMs: 15 * 60 * 1000, // 60 minutes
    max: 1000
  });

  const authLimiter = rateLimit({
    message:
    "You are acting shady imo - can you plz chill a bit?",
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 25
  });


const usersRouter = require("./users/users-router.js")
const authRouter = require("./auth/auth-router.js");
const boardRouter = require("./board/board-router.js");
const generateFeed = require("./generateFeed.js");

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());
server.use(morgan("dev"));

server.use("/users", dataLimiter, usersRouter);
server.use("/auth", authLimiter, authRouter);
server.use("/board", dataLimiter, boardRouter);

setInterval(_ => generateFeed(), (1000 * 60 * 5))

const port = process.env.PORT || 5000;

server.get("/", (req,res) => {
    res.json({message: "Server is up and running"})
})


server.listen(port, _ => {
    console.log("\n Server is listening on port " + port + "\n");
})