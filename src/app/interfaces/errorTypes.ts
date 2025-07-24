export interface TErrorSources {
  path: string;  //string from typeScript
  message: string;
}

export interface TGenericErrorResponse {
  statusCode : number;
  message: string;
  errorSources ?: TErrorSources[]
}