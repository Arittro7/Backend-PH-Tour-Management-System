/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */

import { NextFunction, Request, Response } from "express"
import { envVars } from "../config/env"
import AppError from "../errorHelpers/AppError"

export const globalErrorHandler = (err: any, req: Request, res: Response, next: NextFunction) =>{
  console.log(err);

  const errorSources : any = []
  let statusCode = 500
  let message = 'Something went wrong!'
  
  //`duplicate error 
  if(err.code === 11000){
    console.log("Duplicate entry detected", err.message);
    const duplicate = err.message.match(/"([^"]*)"/)
    console.log(duplicate);
    statusCode = 400
    message = `${duplicate[1]} already Exist`
  }
  //` Cast Object Id 
  else if(err.name === "CastError"){
    statusCode =400
    message = "Invalid Object Id, Please Provide a Correct Object Id"
  }
  //`Validation error 
  else if( err.name === "ValidationError"){
    statusCode = 400
    const errors = Object.values(err.errors)
    // const errorSources : any = [] 
    errors.forEach((errorObject : any) => errorSources.push({
      path: errorObject.path,
      message: errorObject.message
    }))
    console.log(errorSources);
    message = "Validation error occurred"
  }
  else if(err instanceof AppError){
    statusCode = err.statusCode
    message = err.message
  } else if( err instanceof Error){
    statusCode = 500 
    message = err.message
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources,
    err,
    stack : envVars.NODE_ENV === 'development' ? err.stack : null
  })
}