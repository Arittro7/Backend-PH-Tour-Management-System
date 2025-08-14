import httpStatus from "http-status-codes";
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser, Role } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";
import { envVars } from "../../config/env";
import { JwtPayload } from "jsonwebtoken";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { userSearchableFields } from "./user.constant";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist = await User.findOne({ email });

  if (isUserExist) {
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist");
  }

  const hashedPassword = await bcryptjs.hash(password as string, Number(envVars.BCRYPT_SALT_ROUND));

  const authProvider: IAuthProvider = {
    provider: "credentials",
    providerId: email as string,
  };

  // console.log(hashedPassword);

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest,
  });

  return user;
};

const updateUser = async(userId: string, payload: Partial<IUser>, decodedToken: JwtPayload) =>{

  const ifUserExist = await User.findById(userId)

  if(!ifUserExist){
    throw new AppError(httpStatus.NOT_FOUND, "User Not Found")
  }

  // Updating role
    // > user and guide will not able to update role
    if(payload.role){
      if(decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE){
        throw new AppError(httpStatus.FORBIDDEN, "You Are Not Authorized")
      }
      // > admin can't promote to super admin
      if(payload.role === Role.SUPER_ADMIN && decodedToken.role === Role.ADMIN){
        throw new AppError(httpStatus.FORBIDDEN, "You Are Not Authorized")
      }
    }

    // updating user status/activity
    // > user & guide will don't have that power
    if(payload.isActive || payload.isDeleted || payload.isVerified){
      if(decodedToken.role === Role.USER || decodedToken.role === Role.GUIDE){
        throw new AppError(httpStatus.FORBIDDEN, "You Are Not Authorized")
      }
    }

    // updating password
    if(payload.password){
      payload.password = await bcryptjs.hash(payload.password, envVars.BCRYPT_SALT_ROUND)
    }

    // > new flag - it will return the updated data instant of clone

    const newUpdatedUser = await User.findByIdAndUpdate(userId, payload, {new : true, runValidators: true})

    return newUpdatedUser

}
// update the function get me
const getAllUsers = async (query: Record<string, string>) => {

    const queryBuilder = new QueryBuilder(User.find(), query)
    const usersData = queryBuilder
        .filter()
        .search(userSearchableFields) // file create get-me
        .sort()
        .fields()
        .paginate();

    const [data, meta] = await Promise.all([
        usersData.build(),
        queryBuilder.getMeta()
    ])

    return {
        data,
        meta
    }
};

// added the missed-out route |get-me 
const getSingleUser = async (id: string) => {
    const user = await User.findById(id).select("-password");
    return {
        data: user
    }
};

const getMe = async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    return {
        data: user
    }
};

export const userServices = {
  createUser,
  getAllUsers,
  updateUser,
  getSingleUser,
  getMe
};
