/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from 'http-status-codes';
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";

const credentialsLogin = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  
  const loginInfo = await AuthServices.credentialsLogin(req.body)
  setAuthCookie(res, loginInfo) 
  // note: setAuthCookie function will handle both access and refresh tokens functionality based on

  sendResponse(res, {
    success: true,
    statusCode : httpStatus.OK,
    message: "User Logged In Successfully",
    data: loginInfo 
  })
})

const getNewAccessToken = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const refreshToken = req.cookies.refreshToken
  if(!refreshToken){
    throw new AppError(httpStatus.BAD_REQUEST, "No Refresh Token received from cookies")
  }
  const tokenInfo = await AuthServices.getNewAccessToken(refreshToken)
  setAuthCookie(res, tokenInfo)

  sendResponse(res, {
    success: true,
    statusCode : httpStatus.OK,
    message: "New Access Token Retrieve Successfully",
    data: tokenInfo 
  })
})

const logout = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  })
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: false,
    sameSite: "lax"
  })

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Logout Successfully",
    data: null
  })
})

const resetPassword = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const oldPassword = req.body.oldPassword
  const newPassword = req.body.newPassword
  const decodedToken = req.user
  await AuthServices.resetPassword(oldPassword, newPassword, decodedToken)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password Changed Successfully",
    data: null
  })
})

export const AuthController = {
  credentialsLogin, getNewAccessToken, logout, resetPassword
}