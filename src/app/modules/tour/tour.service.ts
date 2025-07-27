import { ITour, ITourTypes,} from "./tour.interface";
import { Tour, TourTypes,  } from "./tour.model";

const createTour = async (payload: ITour) => {
    const existingTour = await Tour.findOne({ title: payload.title });
    if (existingTour) {
        throw new Error("A tour with this title already exists.");
    }

    const tour = await Tour.create(payload)

    return tour;
};

const getAllTours = async () => {

    const tours = await Tour.find({location: "Rangpur"})
    const totalTours = await Tour.countDocuments()
    
    return {
        data: tours,
        meta: {
            total: totalTours
        }
    }
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

    const updatedTourType = await TourTypes.findByIdAndUpdate(id, payload, { new: true });
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