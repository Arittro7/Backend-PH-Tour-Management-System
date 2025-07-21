/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy, Profile, VerifyCallback } from "passport-google-oauth20";
import { envVars } from "./env";
import { User } from "../modules/user/user.model";
import { Role } from "../modules/user/user.interface";

passport.use(
  new GoogleStrategy(
    {
      clientID: envVars.GOOGLE_CLIENT_ID,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET,
      callbackURL: envVars.GOOGLE_CALLBACK_URL
    }, async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => { //🔦
      // >as its a async function will use try-catch
      try {
        const email = profile.emails?.[0].value
        
        if(!email){
          return done(null, false, {message: "No Email Found"})
        }

        let user = await User.findOne({email}) //chatGPT: why let used here?

        // create user if doesn't exist
        if(!user){
          user = await User.create({
            email,
            name: profile.displayName,
            picture: profile.photos?.[0].value,
            role: Role.USER, //as only normal-users will create acc. using google
            isVerified: true,
            auths:[
              {
                provider: "google",
                providerId: profile.id
              }
            ]
          })
        }

        return done(null, user )
      } catch (error) {
        console.log("Google Strategy Error", error);
        return done(error)
      } 
    }
  )
)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
passport.serializeUser((user: any, done: (err: any, id?: unknown) => void)=>{
  done(null, user._id)
})

passport.deserializeUser(async (id:string, done:any) =>{
  try {
    const user = await User.findById(id)
    done(null, user)
  } catch (error) {
    console.log(error);
    done(error)
  }
})