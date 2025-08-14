/* eslint-disable @typescript-eslint/no-non-null-assertion */
import  httpStatus  from 'http-status-codes';
import AppError from "../../errorHelpers/AppError"
import { IAuthProvider, IUser } from "../user/user.interface"
import { User } from "../user/user.model"
import bcryptjs from "bcryptjs";
import { createNewAccessTokenWithRefreshToken, createUsersToken } from '../../utils/usersToken';
import { JwtPayload } from 'jsonwebtoken';
import { envVars } from '../../config/env';

const credentialsLogin = async(payload : Partial<IUser>) => {
  const {email , password} = payload

  const isUserExist = await User.findOne({email})

  if(!isUserExist){
    throw new AppError(httpStatus.BAD_REQUEST, "Email does not exist")
  }

  const isPasswordMatched = await bcryptjs.compare(password as string, isUserExist.password as string)

  if(!isPasswordMatched){
    throw new AppError(httpStatus.BAD_REQUEST, "Incorrect Password")
  }

  const userToken = createUsersToken(isUserExist)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const {password : pass, ...rest} = isUserExist.toObject()

  return{
    accessToken : userToken.accessToken,
    refreshToken : userToken.refreshToken,
    rest
  }
}

const getNewAccessToken = async(refreshToken: string) => {
  
  const newAccessToken = await createNewAccessTokenWithRefreshToken(refreshToken)


  return{
    accessToken : newAccessToken
  }
}

const resetPassword = async(oldPassword: string, newPassword: string, decodedToken: JwtPayload) =>{ 

  const user = await User.findById(decodedToken.userId)
  const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string) 

  if(!isOldPasswordMatch){
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password doesn't match")
  }

  user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))

  user!.save()
}

const changePassword = async(oldPassword: string, newPassword: string, decodedToken: JwtPayload) =>{ 

  const user = await User.findById(decodedToken.userId)
  const isOldPasswordMatch = await bcryptjs.compare(oldPassword, user!.password as string) 

  if(!isOldPasswordMatch){
    throw new AppError(httpStatus.UNAUTHORIZED, "Old Password doesn't match")
  }

  user!.password = await bcryptjs.hash(newPassword, Number(envVars.BCRYPT_SALT_ROUND))

  user!.save()
}

const setPassword = async(userId: string, plainPassword: string) =>{ 
  //1. checking is user exist or not
  const user = await User.findById(userId)

  if(!user){
    throw new AppError(404, "User Not found")
  }
  // 2. if user has password and google authenticate 
  if(user.password && user.auths.some(providerObject => providerObject.provider === "google")){
    throw new AppError(httpStatus.BAD_REQUEST, "You have already set your password, If you want to change your password then Go to your profile & update password from there")
  }
  // 3.
  const hashedPassword = await bcryptjs.hash(
    plainPassword, 
    Number(envVars.BCRYPT_SALT_ROUND)
  )
  //5
  const credentialProvider : IAuthProvider = {
    provider: "credentials",
    providerId: user.email
  }
  // 4.
  const auths: IAuthProvider[] = [...user.auths, credentialProvider]
  user.password = hashedPassword
  user.auths = auths
  //6
  await user.save()
}


export const AuthServices = {
  credentialsLogin, getNewAccessToken, resetPassword, changePassword, setPassword
}