import * as Yup from "yup";
import {
  LoginSchema,
  RegisterSchema,
} from "../utils/validations/auth.validation.js";
import { AuthService } from "../services/auth.service.js";
import { CustomError } from "../utils/customError.js";

export const AuthController = {
  Register: async (
    req,
    res,
    _next
  ) => {
    try {
      await RegisterSchema.validate(req.body, {
        abortEarly: false,
      });

      const user = await AuthService.CreateUser(req.body);

      res.status(201).json({
        success: true,
        message: "User successfully registered",
        data: user,
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        _next(new CustomError(400, "Validation failed", error.errors));
      }
      _next(error);
    }
  },

  GetAllUsers: async (req, res, _next) => {
    try {
      const users = await AuthService.GetAllUsers();

      res.status(200).json({
        success: true,
        message: "Users retrieved successfully",
        data: users,
      });
    } catch (error) {
      _next(error);
    }
  },

  DeleteUser: async (req, res, _next) => {
    try {
      const { id } = req.params;
      await AuthService.DeleteUser(id);

      res.status(200).json({
        success: true,
        message: "User deleted successfully",
      });
    } catch (error) {
      _next(error);
    }
  },

  Login: async (req, res, _next) => {
    try {
      await LoginSchema.validate(req.body, {
        abortEarly: false,
      });

      const user = await AuthService.Login(req.body);

      res.status(200).json({
        success: true,
        message: "User successfully logged in",
        data: user,
      });
    } catch (error) {
      if (error instanceof Yup.ValidationError) {
        _next(new CustomError(400, "Validation failed", error.errors));
      }
      _next(error);
    }
  },
};