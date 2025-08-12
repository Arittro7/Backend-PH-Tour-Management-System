/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env";
import AppError from "../errorHelpers/AppError";

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
  api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
  api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const deleteImageFromCloudinary = async (url: string) => {
  try {
    //https://res.cloudinary.com/dsfelbnhj/image/upload/v1754914581/47v6brnouop-1754914579811-pangthumai-waterfall-jpg.jpg.jpg

    //  I will use a regex to get the public id - it will remove the extension and then separate the url and keep them in array like below
    /** 
     * /v1754914581/47v6brnouop-1754914579811-pangthumai-waterfall-jpg.jpg.jpg
     * 47v6brnouop-1754914579811-pangthumai-waterfall-jpg.jpg
     * jpg
     */
    const regex = /\/v\d+\/(.*?)\.(jpg|jpeg|png|gif|webp)$/i;

    const match = url.match(regex);

    if (match && match[1]) {
      const public_id = match[1];
      await cloudinary.uploader.destroy(public_id);
      console.log(`File ${public_id} is deleted from cloudinary`);
    }
  } catch (error : any) {
    throw new AppError(401, "Cloudinary image deletion failed", error.message)
  }
};

export const cloudinaryUpload = cloudinary;
