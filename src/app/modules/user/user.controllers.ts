/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response, } from "express"
import httpStatus from 'http-status-codes';
import { userServices } from "./user.services";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

const createUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const user = await userServices.createUser(req.body)

  sendResponse(res, {
    success: true,
    statusCode : httpStatus.CREATED,
    message: "User Created Successfully",
    data: user
  })
})

const getAllUsers = catchAsync(async(req: Request, res: Response, next: NextFunction) =>{
  const result = await userServices.getAllUsers()

  sendResponse(res, {
    success: true,
    statusCode : httpStatus.CREATED,
    message: "User Created Successfully",
    data: result.data,
    meta: result.meta
  })
})

export const UserControllers = {
  createUser, getAllUsers
}