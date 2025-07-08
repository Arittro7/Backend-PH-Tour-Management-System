/* eslint-disable no-console */
import  {Server}  from "http";
import mongoose from "mongoose";
import app from "./app";
import { envVars } from "./app/config/env";

let server: Server;

const startServer = async () => {
  try {
    await mongoose.connect(envVars.DB_URL);

    console.log("Connected to DB⛳");

    server = app.listen(envVars.PORT, () => {
      console.log(`Server is Listening to port ${envVars.PORT}`);
    })

  } catch (error) {
    console.log(error);
  }
};

startServer()


// > Unhandled Rejection
process.on("unhandledRejection",(err)=>{
  console.log("Unhandled Rejection detected server is Shutting Down" ,err);

  if(server){
    server.close(() =>{
      process.exit(1)
    })
  }
  process.exit(1)
})

//note: Promise works with unhandled Rejection
// add the following line 👇🏻 to test the unhandled rejection
// Promise.reject(new Error ("SERVER Shut down")) 

// > Uncaught Exception

process.on("uncaughtException", (err) => {
  console.log("Uncaught Exception happened SERVER Shutting down soon!", err);
  
  if(server){
    server.close(() =>{
      process.exit(1)
    })
  }

  process.exit(1)
})

//note: Uncaught exception happened when error happened on local server 
// add the following line 👇🏻 to test the uncaught exception
// throw error ("Something wrong with local server") 

// > signal termination

process.on("SIGTERM", () => {
  // nothing will console cause it's from the server provider
  if(server){
    server.close(() =>{
      process.exit(1)
    })
  }
  process.exit(1)
})