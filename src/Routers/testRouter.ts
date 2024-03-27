import { express, Router, Request, Response } from "../dependencies"
const router = Router();
router.get("/gg", (req: Request, res: Response) => {
    res.send("Hi...Hello World from TypeScript")
})
export default router;