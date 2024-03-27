///<reference path="../../typings/index.d.ts" />
import { Caches, jwt, Request, Response, NextFunction } from "../dependencies"

export function checkUserRegistered(req: Request, res: Response, next: NextFunction): void {
    const token = req.cookies && req.cookies.token;
    console.log(req.body.codeNumber)
    console.log(token)
    if (token == null) {
        res.send({
            res: "R4" //security problem, do registering again.
        })
    }
    else {
        jwt.verify(token, process.env.ACCESS_TOKEN_SECRET as string, (err: any, Proxyphone: any) => {
            if (err) {
                console.log(err)
                res.send({
                    res: "R4" //security problem, do registering again.
                })
            }
            else {
                console.log(Proxyphone)
                const foundUser = Caches.UsersArray.find((user) => user.mobileNumber == Proxyphone.userMobile);
                if (foundUser != undefined) {
                    req.user = foundUser;
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