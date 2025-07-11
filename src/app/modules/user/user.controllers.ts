/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response, } from "express"
import httpStatus from 'http-status-codes';
import { userServices } from "./user.services";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";

// before catchAsync function created
// const createUser = async (req: Request, res: Response, next : NextFunction) =>{
//   try {
//     throw new AppError(httpStatus.BAD_REQUEST, "Fake Error")
    
//     const user = await userServices.createUser(req.body)


//     res.status(httpStatus.CREATED).json({
//       message: "User created Successfully",
//       user
//     })
//   } catch (err : any) {
//     console.log(err);
//     next(err)
//   }
// }

// > updated createUser after catchAsync fn create
const createUser = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const user = await userServices.createUser(req.body)

  sendResponse(res, {
    success: true,
    statusCode : httpStatus.CREATED,
    message: "User Created Successfully",
    data: user
  })
})

// before catchAsync function created
// const getAllUsers = async (req: Request, res: Response, next : NextFunction) =>{
//   try {
//     const users = await userServices.getAllUsers()

//     return users
//   } catch (err : any) {
//     console.log(err);
//     next(err)
//   }
// }

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