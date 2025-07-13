import { validateRequest } from './../../middlewares/validateRequest';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from "express";
import { UserControllers } from "./user.controllers";
import { createUserZodSchema } from './user.validation';

const router = Router();

router.post("/register",validateRequest(createUserZodSchema),UserControllers.createUser);
router.get("/all-users", UserControllers.getAllUsers);

export const UserRoutes = router;
