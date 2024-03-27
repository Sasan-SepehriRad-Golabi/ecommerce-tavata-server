import { httpServer, Request, Response, NextFunction, expressApp, testRouter, initialRouter, userRouter, loginRouter, profileRouter, adminRouter, express, path, fs } from "./dependencies"

expressApp.use(express.static(path.join(__dirname, "../public")))
expressApp.use("/tt", testRouter)
expressApp.use("/user", userRouter)
expressApp.use("/login", loginRouter);
expressApp.use("/profile", profileRouter)
expressApp.use("/@dm1n", adminRouter);
expressApp.get("/@dm1nn", (req: Request, res: Response) => {
    fs.createReadStream(path.join(__dirname, "../admin/index.html")).pipe(res)
})
expressApp.get("*", (req: Request, res: Response) => {
    fs.createReadStream(path.join(__dirname, "../client/index.html")).pipe(res)
})


//Start Server On Port 3002
httpServer.listen(3002, () => {
    console.log("server started on port 3002")
})