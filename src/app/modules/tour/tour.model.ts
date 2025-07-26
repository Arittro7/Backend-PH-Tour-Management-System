import { model, Schema} from "mongoose";
import { ITour, ITourTypes } from "./tour.interface";

const tourTypesSchema = new Schema<ITourTypes>({
  name: {type: String, required:true, unique:true}
},{
  timestamps: true
})

export const TourTypes = model<ITourTypes>("TourType", tourTypesSchema)

const tourSchema = new Schema<ITour>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: {type: String},
    images:{type:[String], default:[]},
    location:{type:String},
    costFrom:{type:Number},
    startDate:{type:Date}, //date from JS types
    endDate:{type:Date},
    included:{type:[String], default:[]},
    excluded:{type:[String], default:[]},
    amenities:{type:[String], default:[]},
    tourPlan:{type:[String], default:[]},
    maxGuest:{type:Number},
    minAge:{type:Number},
    division:{ // this is a connection with division model 
      type: Schema.Types.ObjectId,
      ref: "Division", //imp: Make sure to use the model name which is Division. As the variable also named Division. Tips: name inside quotation
      required: true
    },
    tourType:{
      type: Schema.Types.ObjectId,
      ref:"TourTypes",
      required: true
    },
  },
  {
    timestamps: true,
  }
);


export const Tour = model<ITour>("Tour", tourSchema)


//>----------------------------------------<//

/**
 * `Division and Tour type are two different collection. To link with other collection 1. ObjectId of that collection is req. thats why Schema.Types used from mongoose 2. Referencing with that collection using ref: "ModelName" (make sure model is created like division.model.ts)   
 */