import { makeApp } from "./server";
import * as dotenv from "dotenv";
import initDb from "../utils/initDatabase";
import OAuth2Client from "@fwl/oauth2";

dotenv.config();

const oauthClient = new OAuth2Client({
  openIDConfigurationURL: process.env.CONNECT_OPEN_ID_CONFIGURATION_URL || "",
  clientID: process.env.CONNECT_APPLICATION_CLIENT_ID || "",
  clientSecret: process.env.CONNECT_APPLICATION_CLIENT_SECRET || "",
  redirectURI: process.env.CONNECT_REDIRECT_URI || "",
  audience: process.env.CONNECT_AUDIENCE || "",
  scopes: (process.env.CONNECT_APPLICATION_SCOPES || "").split(" "),
});

initDb()
  .then(async (mongoClient) => {
    const app = makeApp(mongoClient, oauthClient);

    app.listen(process.env.PORT, () => {
      console.log(`listen on http://localhost:${process.env.PORT}`);
    });
  })
  .catch(console.error);
