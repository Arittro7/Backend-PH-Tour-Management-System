import  httpStatus  from 'http-status-codes';
import AppError from "../../errorHelpers/AppError";
import { IAuthProvider, IUser } from "./user.interface";
import { User } from "./user.model";
import bcryptjs from "bcryptjs";

const createUser = async (payload: Partial<IUser>) => {
  const { email, password, ...rest } = payload;

  const isUserExist =  await User.findOne({email})

  if(isUserExist){
    throw new AppError(httpStatus.BAD_REQUEST, "User Already Exist")
  }

  const hashedPassword = await bcryptjs.hash(password as string, 10)

  const authProvider : IAuthProvider = {provider: "credentials", providerId: email as string}

  // console.log(hashedPassword);

  const user = await User.create({
    email,
    password: hashedPassword,
    auths: [authProvider],
    ...rest
  })

  return user
};
// > 26.9
async function getAllUsers() {
  const users = await User.find({});
  const totalUsers = await User.countDocuments()

  return {
    data: users,
    meta: {
      total: totalUsers
    }
  }
}

export const userServices = {
  createUser,
  getAllUsers
}
