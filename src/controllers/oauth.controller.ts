import { Request, Response } from "express";
import OAuth2Client from "@fwl/oauth2";
import UserModel from "../models/userModel";

export function index(oauthClient: OAuth2Client) {
  return async (request: Request, response: Response): Promise<void> => {
    response.redirect((await oauthClient.getAuthorizationURL()).toString());
  };
}
export function callback(oauthClient: OAuth2Client, userModel: UserModel) {
  return async (request: Request, response: Response): Promise<void> => {
    try {
      const tokens = await oauthClient.getTokensFromAuthorizationCode(request.query.code as string);
      const decoded = await oauthClient.verifyJWT<{ sub: string }>(
        tokens.access_token,
        process.env.CONNECT_JWT_ALGORITHM || "",
      );
      console.log(tokens);
      console.log(decoded);
      if (decoded && request.session) {
        request.session.accessToken = tokens.access_token;
        request.session.sub = decoded.sub;
        await userModel.findOrCreate({ sub: decoded.sub, email: "" });
      }
      response.redirect("/");
    } catch (error) {
      console.log(error);
      if (request.session) {
        request.session.destroy(() => response.redirect("/login"));
      } else {
        response.redirect("/login");
      }
    }
  };
}

export function logout() {
  return async (request: Request, response: Response): Promise<void> => {
    await new Promise((resolve) => (request.session ? request.session.destroy(resolve) : resolve()));
    response.redirect("/");
  };
}
