/* eslint-disable @typescript-eslint/no-unused-vars */
import mongoose from "mongoose";
import { TGenericErrorResponse } from "../interfaces/errorTypes";

export const handleCastError = (err: mongoose.Error.CastError):TGenericErrorResponse => {
  return {
    statusCode: 400,
    message: "Invalid Object Id, Please Provide a Correct Object Id",
  };
};