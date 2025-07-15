import { Types } from "mongoose";

export enum Role {
  SUPER_ADMIN = "SUPER_ADMIN",
  ADMIN = "ADMIN",
  USER = "USER",
  GUIDE = "GUIDE"
}

export interface IAuthProvider{
  provider : "google" | "credentials"
  providerId : string;
}

export enum IsActive{
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
  BLOCKED = "BLOCKED"
}

export interface IUser{
  name : string;
  email : string;
  password ?: string;
  phone ?: string;
  picture ?: string;
  address ?: string;
  isDeleted ?: string;
  isActive ?:string;
  isVerified ?: boolean;
  role : Role;
  auths : IAuthProvider[];
  bookings ?: Types.ObjectId[];
  guides ?: Types.ObjectId[];
}

// chk: The IAuthProvider[] is an array because a user can register using Google and also create a password for the same account. This means the user can log in using either their Google account or their email and password credentials.

// > A user can make multiple bookings, and each booking can be assigned the same or different guides. Therefore, the guides field will be an array. The Bookings and Guides will be stored in separate database collections and will each have a unique Object ID. The Types will be imported from Mongoose.
