import { deleteImageFromCloudinary } from "../../config/cloudinary.config";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { tourSearchableFields } from "./tour.constant";
import { ITour, ITourTypes } from "./tour.interface";
import { Tour, TourTypes } from "./tour.model";

const createTour = async (payload: ITour) => {
  const existingTour = await Tour.findOne({ title: payload.title });
  if (existingTour) {
    throw new Error("A tour with this title already exists.");
  }

  const tour = await Tour.create(payload);

  return tour;
};

const getAllTours = async (query: Record<string, string>) => {
  const queryBuilder = new QueryBuilder(Tour.find(), query);
  const tours = await queryBuilder
    .search(tourSearchableFields)
    .filter()
    .sort()
    .fields()
    .paginate()

  //   const meta = await queryBuilder.getMeta()

  const [data, meta] = await Promise.all([
    tours.build(),
    queryBuilder.getMeta(), // make sure getMeta call after build as it destructured as meta after data
  ]);

  return {
    data,
    meta,
  };
};

const updateTour = async (id: string, payload: Partial<ITour>) => {
  const existingTour = await Tour.findById(id);

  if (!existingTour) {
    throw new Error("Tour not found.");
  }

  //user add image
  if(payload.images && payload.images.length > 0 && existingTour.images && existingTour.images.length > 0){ //🔦
    payload.images = [...payload.images, ...existingTour.images] //🔦
  }
  //user add image
  if(payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0){ //🔦

    const restDBImages = existingTour.images.filter(imageUrl => !payload.deleteImages?.includes(imageUrl)) //🔦

    const updatedPayloadImages = (payload.images || [])  //🔦
      .filter(imageUrl => !payload.deleteImages?.includes(imageUrl))
      .filter(imageUrl => !restDBImages.includes(imageUrl))

    payload.images = [...restDBImages, ...updatedPayloadImages] //🔦
  }

  const updatedTour = await Tour.findByIdAndUpdate(id, payload, { new: true });

  if(payload.deleteImages && payload.deleteImages.length > 0 && existingTour.images && existingTour.images.length > 0){
    await Promise.all(payload.deleteImages.map(url => deleteImageFromCloudinary(url)))
  }

  return updatedTour;
};

const deleteTour = async (id: string) => {
  return await Tour.findByIdAndDelete(id);
};

const createTourType = async (payload: ITourTypes) => {
  const existingTourType = await TourTypes.findOne({ name: payload.name });

  if (existingTourType) {
    throw new Error("Tour type already exists.");
  }

  return await TourTypes.create({ name: payload.name });
};

const getAllTourTypes = async () => {
  return await TourTypes.find();
};
const updateTourType = async (id: string, payload: ITourTypes) => {
  const existingTourType = await TourTypes.findById(id);
  if (!existingTourType) {
    throw new Error("Tour type not found.");
  }

  const updatedTourType = await TourTypes.findByIdAndUpdate(id, payload, {
    new: true,
  });
  return updatedTourType;
};
const deleteTourType = async (id: string) => {
  const existingTourType = await TourTypes.findById(id);
  if (!existingTourType) {
    throw new Error("Tour type not found.");
  }

  return await TourTypes.findByIdAndDelete(id);
};

export const TourService = {
  createTour,
  createTourType,
  deleteTourType,
  updateTourType,
  getAllTourTypes,
  getAllTours,
  updateTour,
  deleteTour,
};
