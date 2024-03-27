import {
    dotenv, express, Router, Request, Response, NextFunction, axios, cors, jwt, fs, path, checkUserRegistered,
    Caches, helperFuncs, executesql, User, cookieParser
} from "../dependencies"
dotenv.config();
const router = Router();
router.use([cors({
    credentials: true,
    origin: true
}), express.json(), express.urlencoded({ extended: false }), cookieParser()]);

export default router;