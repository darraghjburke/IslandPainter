import Arena from "@colyseus/arena";
import { monitor } from "@colyseus/monitor";
import basicAuth from "express-basic-auth";

/**
 * Import your Room files
 */
import { MyRoom } from "./rooms/MyRoom";

const MONITOR_USER = process.env.MONITOR_USER || "admin";
const MONITOR_PASSWORD = process.env.MONITOR_PASSWORD;

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(",")
    : ["https://darraghjburke.github.io"];

export default Arena({
    getId: () => "Island Painter",

    initializeGameServer: (gameServer) => {
        /**
         * Define your room handlers:
         */
        gameServer.define('my_room', MyRoom);

    },

    initializeExpress: (app) => {
        app.options("/*", (req, res, next) => {
            const origin = req.headers.origin;
            if (origin && ALLOWED_ORIGINS.includes(origin)) {
                res.header('Access-Control-Allow-Origin', origin);
            }
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            res.send("200");
        });
        /**
         * Bind your custom express routes here:
         */
        app.get("/", (req, res) => {
            res.send("It's time to kick ass and chew bubblegum!");
        });

        /**
         * Bind @colyseus/monitor, protected with basic auth.
         * Set MONITOR_USER and MONITOR_PASSWORD env vars in production.
         */
        if (MONITOR_PASSWORD) {
            app.use(
                "/colyseus",
                basicAuth({
                    users: { [MONITOR_USER]: MONITOR_PASSWORD },
                    challenge: true,
                }),
                monitor()
            );
        } else if (process.env.NODE_ENV === "production") {
            console.warn(
                "WARNING: MONITOR_PASSWORD is not set. The /colyseus monitor is disabled in production."
            );
        } else {
            app.use("/colyseus", monitor());
        }
    },


    beforeListen: () => {
        /**
         * Before before gameServer.listen() is called.
         */
    },
});