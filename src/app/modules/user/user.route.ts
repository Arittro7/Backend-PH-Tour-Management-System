import { validateRequest } from './../../middlewares/validateRequest';
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Router } from "express";
import { UserControllers } from "./user.controllers";
import { createUserZodSchema, updateUserZodSchema } from './user.validation';
import { checkAuth } from '../../middlewares/checkAuth';
import { Role } from './user.interface';

const router = Router();

router.post("/register",validateRequest(createUserZodSchema),UserControllers.createUser);
router.get("/all-users", checkAuth(Role.ADMIN, Role.SUPER_ADMIN) ,UserControllers.getAllUsers);
router.patch("/:id", validateRequest(updateUserZodSchema), checkAuth(...Object.values(Role)), UserControllers.updateUser)

export const UserRoutes = router;
