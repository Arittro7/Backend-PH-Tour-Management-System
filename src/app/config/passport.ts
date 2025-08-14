/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import {
  Strategy as GoogleStrategy,
  Profile,
  VerifyCallback,
} from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { IsActive, Role } from "../modules/user/user.interface";
import bcryptjs from "bcryptjs";
import { Strategy as localStrategy } from "passport-local";

passport.use(
  new localStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email: string, password: string, done) => {
      try {
        const isUserExist = await User.findOne({ email });

        // if (!isUserExist) {
        //   return done(null, false, { message: "User Doesn't Exist" });
        //    //` null: cause don't want to send err, false: cause user doesn't exist
        // }
        //` 👆🏾both👇🏾are same
        if (!isUserExist) {
          return done("User does not exist");
        }
        //:> 32-8 paste the 3 copied check statement from checkAuth.ts & the done method will use instead of threw appError
        if (
          isUserExist.isActive === IsActive.BLOCKED ||
          isUserExist.isActive === IsActive.INACTIVE
        ) {
          // throw new AppError(httpStatus.BAD_REQUEST,`User is ${isUserExist.isActive}`)
          return done(`User is ${isUserExist.isActive}`);
        }

        if (isUserExist.isDeleted) {
          // throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
          return done("User is Deleted");
        }

        if (isUserExist.isVerified) {
          // throw new AppError(httpStatus.BAD_REQUEST, "User is not verified");
          return done("User is not verified");
        }

        // after email(user) checking before matching the password we will check is the user google authenticate or not

        const isGoogleAuthenticate = isUserExist.auths.some(
          (providerObjects) => providerObjects.provider == "google"
        );
        //chk: On the DB the auths field contain the login method, It will check is the provider method google or credential

        if (isGoogleAuthenticate && !isUserExist.password) {
          return done(null, false, {
            message:
              "You are authenticated using Google. You need to set a password for login with credentials, first login using your authenticate gmail and set a password for your account then you can login using email and password",
          });
        }
        // `👆🏾any one of this👇🏾can apply
        // if(isGoogleAuthenticate){
        //   return done("You are authenticated using Google. You need to set a password for login with credentials, first login using your authenticate gmail and set a password for your account then you can login using email and password")
        // }

        const isPasswordMatched = await bcryptjs.compare(
          password as string,
          isUserExist.password as string
        );

        if (!isPasswordMatched) {
          return done(null, false, { message: "Password Doesn't Match" });
        }

        return done(null, isUserExist);
        //chk: if above validation was successful then send the user. call done fn. null: no error, user:isUserExits
      } catch (error) {
        console.log(error);
        done(error);
      }
    }
  )
);

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL,
    },
    async (accessToken: string, refreshToken: string, profile: Profile,done: VerifyCallback) => {
      //🔦
      // >as its a async function will use try-catch
      try {
        const email = profile.emails?.[0].value;

        if (!email) {
          return done(null, false, { message: "No Email Found" });
        }
        //:> 32-8 m
        let isUserExist = await User.findOne({ email });
        if(isUserExist && !isUserExist.isVerified){
          return done(null, false, {message:"User is not verified"})
        }

        if (isUserExist && (isUserExist.isActive === IsActive.BLOCKED || isUserExist.isActive === IsActive.INACTIVE)
        ) {
          // throw new AppError(httpStatus.BAD_REQUEST,`User is ${isUserExist.isActive}`)
          return done(`User is ${isUserExist.isActive}`);
        }

        if (isUserExist && isUserExist.isDeleted) {
          // throw new AppError(httpStatus.BAD_REQUEST, "User is deleted");
          return done(null, false, {message:"User is Deleted"})
        }

        //[note: if google authentication failed I will redirect user to the frontend login page with some message on query -check auth.route.ts]
        
        // create user if doesn't exist
        if (!isUserExist) {
          isUserExist = await User.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0].value,
            role: Role.USER, //as only normal-users will create acc. using google
            isVerified: true,
            auths: [
              {
                provider: "google",
                providerId: profile.id,
              },
            ],
          });
        }

        return done(null, isUserExist);
      } catch (error) {
        console.log("Google Strategy Error", error);
        return done(error);
      }
    }
  )
);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void) => {
  done(null, user._id);
});

passport.deserializeUser(async (id: string, done: any) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    console.log(error);
    done(error);
  }
});
