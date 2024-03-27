///<reference path="../../typings/ModelsTypes.d.ts" />
import {
    Router, Request, Response, NextFunction, express, cors,
    cookieParser, checkUserRegistered, fs, sharp, formidable, path, executesql
} from "../dependencies"
const router = Router();
router.use([cors({
    credentials: true,
    origin: true
}), express.json(), express.urlencoded({ extended: false }), cookieParser(), checkUserRegistered]);
router.use(checkUserRegistered)

export default router;