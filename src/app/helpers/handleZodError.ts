import { TErrorSources, TGenericErrorResponse } from "../interfaces/errorTypes";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const handleZodError = (err: any):TGenericErrorResponse =>{
  
    const errorSources:TErrorSources[] = [];

    err.issues.forEach((issue: any) => {
      errorSources.push({
        // path: issue.path.length > 1 && issue.path.reverse().join("inside"), //🔦 if path has more then 1 element

        path: issue.path[issue.path.length - 1],
        message: issue.message,
      });
    });

    return{
      statusCode : 400,
      message : "Zod Validation",
      errorSources 
    }
}