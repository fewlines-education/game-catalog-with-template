import { MongoClient } from "mongodb";
import * as core from "express-serve-static-core";
import * as nunjucks from "nunjucks";
import bodyParser from "body-parser";
import express from "express";
import mongoSession from "connect-mongo";
import OAuth2Client from "@fwl/oauth2";
import session from "express-session";
import * as gamesController from "./controllers/games.controller";
import * as oauthController from "./controllers/oauth.controller";
import * as platformsController from "./controllers/platforms.controller";
import GameModel, { Game } from "./models/gameModel";
import PlatformModel, { Platform } from "./models/platformModel";
import UserModel, { User } from "./models/userModel";
import { Request, Response } from "express";

const clientWantsJson = (request: express.Request): boolean => request.get("accept") === "application/json";

const jsonParser = bodyParser.json();
const formParser = bodyParser.urlencoded({ extended: true });

export function makeApp(mongoClient: MongoClient, oauthClient: OAuth2Client): core.Express {
  const app = express();

  const mongoStore = mongoSession(session);
  if (process.env.NODE_ENV === "production") {
    app.set("trust proxy", 1);
  }
  const sessionParser = session({
    secret: "this_should_be_a_long_string_with_more_than_32_characters_also_known_as_keyboard_cat",
    name: "sessionId",
    resave: false,
    saveUninitialized: true,
    store: new mongoStore({
      client: mongoClient,
    }),
    cookie: {
      secure: process.env.NODE_ENV === "production",
      expires: new Date(Date.now() + 3600000),
    },
  });

  nunjucks.configure("views", {
    autoescape: true,
    express: app,
  });

  app.use("/assets", express.static("public"));
  app.set("view engine", "njk");

  const platformModel = new PlatformModel(mongoClient.db().collection<Platform>("platforms"));
  const gameModel = new GameModel(mongoClient.db().collection<Game>("games"));
  const userModel = new UserModel(mongoClient.db().collection<User>("users"));

  app.get("/", sessionParser, (request, response) => {
    let isLogguedIn = false;
    if (!request.session || !request.session.accessToken) {
      isLogguedIn = true;
    }
    response.render("pages/home", { isLogguedIn });
  });
  app.get("/api", (_request, response) => response.render("pages/api"));

  app.get("/login", async (request: Request, response: Response) => {
    const url = await oauthClient.getAuthorizationURL();
    const stringifiedUrl = url.toString();
    console.log(stringifiedUrl);

    response.redirect(stringifiedUrl);
  });

  app.get("/oauth/login", oauthController.index(oauthClient));
  app.get("/oauth/callback", sessionParser, oauthController.callback(oauthClient, userModel));
  app.get("/logout", sessionParser, oauthController.logout());

  app.get("/platforms", platformsController.index(platformModel));
  app.get("/platforms/new", platformsController.newPlatform());
  app.get("/platforms/:slug", platformsController.show(platformModel));
  app.get("/platforms/:slug/edit", platformsController.edit(platformModel));
  app.post("/platforms", jsonParser, formParser, platformsController.create(platformModel));
  app.put("/platforms/:slug", jsonParser, platformsController.update(platformModel));
  app.post("/platforms/:slug", formParser, platformsController.update(platformModel));
  app.delete("/platforms/:slug", jsonParser, platformsController.destroy(platformModel));

  app.get("/platforms/:slug/games", gamesController.list(gameModel));
  app.get("/games", gamesController.index(gameModel));
  app.get("/games/new", gamesController.newGame());
  app.get("/games/:slug", gamesController.show(gameModel));
  app.get("/games/:slug/edit", gamesController.edit(gameModel));
  app.post("/games", jsonParser, formParser, gamesController.create(gameModel, platformModel));
  app.put("/games/:slug", jsonParser, gamesController.update(gameModel, platformModel));
  app.post("/games/:slug", formParser, gamesController.update(gameModel, platformModel));
  app.delete("/games/:slug", jsonParser, gamesController.destroy(gameModel));

  app.get("/*", (request, response) => {
    console.log(request.path);
    if (clientWantsJson(request)) {
      response.status(404).json({ error: "Not Found" });
    } else {
      response.status(404).render("pages/not-found");
    }
  });

  return app;
}
