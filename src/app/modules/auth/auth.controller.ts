/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextFunction, Request, Response } from "express"
import { catchAsync } from "../../utils/catchAsync"
import { sendResponse } from "../../utils/sendResponse"
import httpStatus from 'http-status-codes';
import { AuthServices } from "./auth.service";
import AppError from "../../errorHelpers/AppError";
import { setAuthCookie } from "../../utils/setCookie";
import { createUsersToken } from "../../utils/usersToken";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import passport from "passport";

const credentialsLogin = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  
  // const loginInfo = await AuthServices.credentialsLogin(req.body)
  
  passport.authenticate("local", async (err: any, user: any, info: any) => { //🔦
    // passport named the credential based login process as local

    if(err){
      // ❌❌❌❌❌
      // throw new AppError(401, "error message")
      // next(err)
      // return new AppError(401, err)
      //` If i use any one of the above 3 it will failed to response 

      // ✅✅✅✅✅
      // return next(err) //` use any one of this
      return next(new AppError(401, err))
    }

    if(!user){
      // return new AppError(401, info.message)
      // return next(err)
      return next(new AppError(401, info.message))
    }

    const userTokens = await createUsersToken(user)

    const {password: pass, ...rest} = user.toObject()
    //` I can use any one of this 👆🏾or👇🏾 to get user info except password 
    // delete user.toObject().password

    setAuthCookie(res, userTokens)
    //` setAuthCookie function will handle both access and refresh tokens functionality based on 

    sendResponse(res, {
    success: true,
    statusCode : httpStatus.OK,
    message: "User Logged In Successfully",
    data: {
      accessToken: userTokens.accessToken,
      refreshToken : userTokens.refreshToken,
      user: rest
    }
  })

  })(req,res,next) 
  //` Manually required to trigger so that express can the fn within the fn 
  
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

//>Modify function 
const resetPassword = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  // const oldPassword = req.body.oldPassword //>remove old password
  // const {id, newPassword} = req.body //> remove if payload used
  const decodedToken = req.user
  // as i use payload thats why req.body being used instated of newPassword & id
  //zod validation must required if payload used
  await AuthServices.resetPassword(req.body, decodedToken as JwtPayload)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password Changed Successfully",
    data: null
  })
})

const changePassword = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  const oldPassword = req.body.oldPassword
  const newPassword = req.body.newPassword
  const decodedToken = req.user
  await AuthServices.changePassword(oldPassword, newPassword, decodedToken as JwtPayload)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password Changed Successfully",
    data: null
  })
})

const setPassword = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  
  const decodedToken = req.user as JwtPayload
  const {password} = req.body


  await AuthServices.setPassword(decodedToken.userId, password)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Password Changed Successfully",
    data: null
  })
})

const forgotPassword = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  
  // as it will be a public route I don't need the token
  // applied zod schema to make sure route should not work if email not provided
  const {email} = req.body

  await AuthServices.forgotPassword(email)

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Email sent Successfully",
    data: null
  })
})



const googleCallbackController = catchAsync(async(req: Request, res: Response, next: NextFunction) => {
  
  let redirectTo = req.query.state ? req.query.state as string : ""
  
  if(redirectTo.startsWith("/")){
    redirectTo = redirectTo.slice(1)
  }
  
  const user = req.user
  console.log("User", user);

  if(!user){
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
  }
  const tokenInfo = await createUsersToken(user)

  setAuthCookie(res, tokenInfo)

  res.redirect(`${envVars.FRONTEND_URL}/${redirectTo}`)
})



export const AuthController = {
  credentialsLogin, getNewAccessToken, logout, resetPassword, changePassword, googleCallbackController, setPassword, forgotPassword
}