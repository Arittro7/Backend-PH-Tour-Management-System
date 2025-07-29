import { Types } from "mongoose";

export interface ITourTypes{
  name: string
}

export interface ITour{
  title : string;
  slug : string;
  description ?: string;
  images ?: string[];
  location ?: string;
  costFrom ?: number;
  startDate ?: Date; //`JS date use as type 
  endDate ?: Date;
  departureLocation ?: string;
  arrivalLocation ?: string;
  included ?: string[]; //` [] bcoz multiple items can be added 
  excluded ?: string[];
  amenities ?: string[];
  tourPlan ?: string[];
  maxGuest ?: number;
  minAge ?: number;
  division : Types.ObjectId
  tourType : Types.ObjectId //> Filter will applied based on tour type(short, long, week etc). Another file will created to contain tour types.
}