/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response, } from "express"
import httpStatus from 'http-status-codes';
import { userServices } from "./user.services";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { JwtPayload } from "jsonwebtoken";
// import { verifyToken } from "../../utils/jwt";
// import { envVars } from "../../config/env";
// import { JwtPayload } from "jsonwebtoken";

const createUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const user = await userServices.createUser(req.body)

  sendResponse(res, {
    success: true,
    statusCode : httpStatus.CREATED,
    message: "User Created Successfully",
    data: user
  })
})

const updateUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const userId = req.params.id;
  // const token = req.headers.authorization
  // const verifiedToken = verifyToken(token as string, envVars.JWT_ACCESS_SECRET) as JwtPayload

  const verifiedToken = req.user

  const payload = req.body
  const user = await userServices.updateUser(userId, payload, verifiedToken as JwtPayload)

  sendResponse(res, {
    success: true,
    statusCode : httpStatus.CREATED,
    message: "User Updated Successfully",
    data: user
  })
})

const getAllUsers = catchAsync(async(req: Request, res: Response, next: NextFunction) =>{
  const result = await userServices.getAllUsers()

  sendResponse(res, {
    success: true,
    statusCode : httpStatus.CREATED,
    message: "All user retrieved successfully",
    data: result.data,
    meta: result.meta
  })
})

export const UserControllers = {
  createUser, getAllUsers, updateUser
}