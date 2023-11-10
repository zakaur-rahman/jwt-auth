import Jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();
import client from "../database/redis.db.js";

import createHttpError from "http-errors";

export const signAccessToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const ACCESS_SECRET_KEY = process.env.ACCESS_SECRET_KEY;
    const options = {
      expiresIn: "15s",
      audience: userId, //expiration time in seconds
    };
    try {
      resolve(Jwt.sign(payload, ACCESS_SECRET_KEY, options));
    } catch (err) {}
  });
};

export const signRefreshToken = (userId) => {
  return new Promise((resolve, reject) => {
    const payload = {};
    const REFRESH_SECRET_KEY = process.env.REFRESH_SECRET_KEY;
    const options = {
      expiresIn: "1y",
      audience: userId, 
    };
    Jwt.sign(payload, REFRESH_SECRET_KEY, options, (error, token) => {
      if (error) {
        console.log("error", error);
        reject(createHttpError.InternalServerError());
      }
      try {
        client.setEx(userId, 365 * 24 * 3600, token);
        resolve(token);
      } catch (e) {
        reject(createHttpError.InternalServerError());
      }
    });
  });
};

export const verifyToken = (request, response, next) => {
  if (!request.headers["authorization"])
    return next(createHttpError.Unauthorized());
  let token = request.headers["authorization"].split(" ")[1];

  Jwt.verify(token, process.env.ACCESS_SECRET_KEY, (error, payload) => {
    if (error) {
      const message =
        error.name === "JsonWebTokenError" ? "Unauthorized" : error.message;
      return next(createHttpError.Unauthorized(message));
    }
    response.payload = payload;
    next();
  });
};


export const verifyRefreshToken = (refreshToken) => {
  return new Promise((resolve, reject) => {
    Jwt.verify(refreshToken, process.env.REFRESH_SECRET_KEY, async (error, payload) => {
      if (error) {
        return reject(createHttpError.Unauthorized());
      }
      const userId = payload.aud;
      try {
        const value = await client.get(userId); 
        if (value === refreshToken) {
          return resolve(userId);
        } else {
          reject(createHttpError.Unauthorized());
        }
      } catch (err) {
        console.error(err.message);
        reject(createHttpError.InternalServerError());
      }
    });
  });
};
