import User from "../model/user.js";
import bcrypt from "bcrypt";
import createHttpError from "http-errors";
import client from "../database/redis.db.js";
import { joiSchemaSignup, joiSchemaLogin } from "../tools/validation-schema.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "./jwt-controller.js";

export const signupUser = async (request, response, next) => {
  try {
    const result = await joiSchemaSignup.validateAsync(request.body);
    const doesExist = await User.findOne({ email: result.email });
    if (doesExist) {
      throw createHttpError.Conflict(`Email already exists`);
    }

    const hashedPassword = bcrypt.hashSync(result.password, 10);
    const user = new User({
      name: result.name,
      email: result.email,
      password: hashedPassword,
    });

    const savedUser = await user.save();
    const accessToken = await signAccessToken(savedUser.id);
    const refreshToken = await signRefreshToken(savedUser.id);
    response
      .status(200)
      .json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};

export const loginUser = async (request, response, next) => {
  try {
    const result = await joiSchemaLogin.validateAsync(request.body);
    const user = await User.findOne({ email: result.email });
    if (!user) {
      throw createHttpError.NotFound("User not Found.");
    }
    const isValidated = await bcrypt.compare(result.password, user.password);

    if (!isValidated) {
      throw createHttpError.Unauthorized("Invalid Credentials");
    }

    const accessToken = await signAccessToken(user.id);
    const refreshToken = await signRefreshToken(user.id);
    response
      .status(200)
      .json({ accessToken: accessToken, refreshToken: refreshToken });
  } catch (error) {
    if (error.isJoi === true)
      return next(createHttpError.BadRequest("Invalid Email or Password."));
    next(error);
  }
};

export const newAccessToken = async (request, response, next) => {
  try {
    const { refreshToken } = request.body;
    console.log(refreshToken);

    if (!refreshToken) throw next(createHttpError.BadRequest());
    const userId = await verifyRefreshToken(refreshToken);

    const accessToken = await signAccessToken(userId);
    const newRefreshToken = await signRefreshToken(userId);
    response
      .status(200)
      .json({ accessToken: accessToken, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
};


export const logoutUser = async (request, response, next) => {
  try {
    const { refreshToken } = request.body;
    if (!refreshToken) throw next(createHttpError.BadRequest());
    const userId = await verifyRefreshToken(refreshToken);

    await client.del(`${userId}`);
    response.sendStatus(204);
  } catch (err) {
    next(createHttpError.InternalServerError());
  }
};
