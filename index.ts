// require("dotenv-safe").config();
import express from "express";
import { join } from "path";
// import "reflect-metadata";
// import { User } from "./entities/User";
// import { Strategy as GitHubStrategy } from "passport-github";
import cors from "cors";
// import { Todo } from "./entities/Todo";
// import { isAuth } from "./isAuth";

const main = async () => {

    const app = express();
    app.use(cors({ origin: "*" }));
    app.use(express.json());  // for parsing requests. 

    app.get('/', (_req, res) => {
        res.send("hello");
    });

    app.listen(3002, () => {
        console.log("listening on localhost:3002");
    });
};

main();