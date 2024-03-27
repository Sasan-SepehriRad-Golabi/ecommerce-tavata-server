// previously: export import dotenv = require("dotenv")
import { Server as socketServer } from "socket.io"
export * as dotenv from "dotenv"
export { default as axios } from "axios";
export { default as cookieParser } from "cookie-parser"
const express = require("express")
export { default as express, Request, Response, Router, NextFunction } from "express";
export { checkUserRegistered } from "./MiddleWares/UserCheckMiddleWare";
export { checkAdminRegistered } from "./MiddleWares/AdminCheckMiddleWare"
export import Caches = require("../Controllers/Caches")
export { User } from "../Models/User";
export { AdminUser } from "../Models/AdminUser"
export { default as helperFuncs } from "../Controllers/helperfunctions"
export { default as path } from "path";
//previously: export import fs=require("fs")
export * as  fs from "fs";
export { default as jwt } from "jsonwebtoken"
export { default as cors } from "cors";
// export import cors = require("cors");

export { Server as SocketServer } from "socket.io";
export { default as formidable, errors as formidableErrors } from 'formidable';
export { default as sharp } from "sharp"
export { executesql } from "../Controllers/dataBaseApi"
export { default as loginRouter } from "./Routers/loginRouter"
export { default as testRouter } from "./Routers/testRouter"
export { default as profileRouter } from "./Routers/profileRouter"
export { default as initialRouter } from "./Routers/initialRouter"
export { default as adminRouter } from "./Routers/adminRouter"
export { default as userRouter } from "./Routers/userRouter"
import { default as httpp } from "http"
export const expressApp = express();
export const httpServer = httpp.createServer(expressApp)
const io = new socketServer(httpServer, {
    cors: {
        origin: "*"
    }
})
io.on("connection", (socket) => {
    console.log("a user connected")
    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
    socket.on("updateUsers", () => {
        socket.broadcast.emit("updateUsers")
    })
})
