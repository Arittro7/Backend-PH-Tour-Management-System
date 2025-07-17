import { Router } from "express";
import { AuthController } from "./auth.controller";

const router = Router()

router.post("/login" , AuthController.credentialsLogin)
router.post("/refresh-token" , AuthController.credentialsLogin)

export const AuthRoutes = router