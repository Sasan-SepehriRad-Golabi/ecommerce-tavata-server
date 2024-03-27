import { executesql, express, Request, checkUserRegistered, Response, NextFunction, cors, cookieParser, Router } from "../dependencies"
const router = Router();
router.use([express.json(), express.urlencoded({ extended: false }), cors({
    credentials: true,
    origin: true
}), cookieParser(), checkUserRegistered]);

export default router;