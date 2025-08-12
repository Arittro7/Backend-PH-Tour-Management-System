
import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinaryUpload } from "./cloudinary.config";

const storage = new CloudinaryStorage({
  cloudinary: cloudinaryUpload,
  params: {
    public_id: (req, file)=>{
      const fileName = file.originalname
      .toLowerCase()
      .replace(/\s+/g, "-") //replace white space with dash- eg. my image > my-image
      .replace(/\./g,"-") //replace . dot with dash -
      // eslint-disable-next-line no-useless-escape
      .replace(/[^a-z0-9\-\.]/g,"") //non alpha numeric special char.

      // due to use the above regex the file extension(.png) dot also replace with dash which need to keep as .(dot)
      const extension = file.originalname.split(".").pop()

      const uniqueFileName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileName + "." + extension

      return uniqueFileName
    }
  }
})

export const multerUpload = multer({storage: storage})