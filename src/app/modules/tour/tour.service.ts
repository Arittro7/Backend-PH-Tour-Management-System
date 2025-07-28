import { excludeField } from "../../constant";
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
  const filter = query; //👈dynamically exact match get query request
  const searchTerm = query.searchTerm || "";
  const sort = query.sort || "-createdAt";
  const page = Number(query.page) || 1;
  const limit = Number(query.limit) || 10; //> make sure to add page and limit in constant file
  const skip = (page - 1) * limit;

  //` Field Filtering
  const fields = query.fields?.split(",").join(" ") || "";

  for (const field of excludeField) {
    // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
    delete filter[field];
  }
  const searchQuery = {
    $or: tourSearchableFields.map((field) => ({
      [field]: { $regex: searchTerm, $options: "i" },
    })),
  };
  const tours = await Tour.find(searchQuery);
  const totalTours = await Tour.countDocuments()
    .find(filter)
    .sort(sort)
    .select(fields)
    .skip(skip)
    .limit(limit);

  return {
    data: tours,
    meta: {
      total: totalTours,
    },
  };
};

const updateTour = async (id: string, payload: Partial<ITour>) => {
  const existingTour = await Tour.findById(id);

  if (!existingTour) {
    throw new Error("Tour not found.");
  }

  const updatedTour = await Tour.findByIdAndUpdate(id, payload, { new: true });

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
