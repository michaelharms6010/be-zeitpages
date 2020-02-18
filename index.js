require("dotenv").config()
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");


const usersRouter = require("./users/users-router.js")
const authRouter = require("./auth/auth-router.js");
const boardRouter = require("./board/board-router.js")

const server = express();

server.use(helmet());
server.use(cors());
server.use(express.json());
server.use(morgan("dev"));

server.use("/users", usersRouter);
server.use("/auth", authRouter);
server.use("/board", boardRouter);



const port = process.env.PORT || 5000;

server.get("/", (req,res) => {
    res.json({message: "Server is up and running"})
})


server.listen(port, _ => {
    console.log("\n Server is listening on port " + port + "\n");
})