///<reference path="../../typings/index.d.ts" />
import { Caches, jwt, Request, Response, NextFunction } from "../dependencies"

export function checkAdminRegistered(req: Request, res: Response, next: NextFunction): void {
    const token1 = req.cookies && req.cookies.token1;
    if (token1 == null) {
        res.send({
            res: "R4" //security problem, do registering again.
        })
    }
    else {
        jwt.verify(token1, process.env.ACCESS_TOKEN_SECRET_ADMIN as string, (err: any, AdminUser: any) => {
            if (err) {
                res.send({
                    res: "R4" //security problem, do registering again.
                })
            }
            else {
                const foundUser = Caches.AdminUsers.find((user) => user.userName == AdminUser.userName && user.password == AdminUser.password);
                if (foundUser != undefined) {
                    req.admin = foundUser;
                    next();
                }
                else {
                    res.send({
                        res: "R4" //security problem, do registering again.
                    })
                }
            }
        });
    }
}