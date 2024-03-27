import { Router, express, Request, Response, helperFuncs, checkUserRegistered, User, jwt, cors, executesql, Caches, formidable, path, sharp, fs, cookieParser, axios } from '../dependencies'
const router = Router();
router.use([cors({
    credentials: true,
    origin: true
}), cookieParser(), express.json(), express.urlencoded({ extended: false })]);
router.post("/verifytel", (req: Request, res: Response) => {
    // try {
    console.log(req.body.phone)
    let verefCode = Math.floor(Math.random() * 999 + 1000);
    // let verefCode = 1212;
    let ipAddr = req.get("origin");
    // let result = "R1";
    // if (result == "R1") {
    //     Caches.UsersArray.forEach((user, index) => {
    //         if (user.mobileNumber == req.body.phone) {
    //             clearInterval(Caches.UsersArray[index].ptr);
    //             Caches.UsersArray.splice(index, 1);
    //         }
    //     })
    //     let user = new User(req.body.phone, ipAddr, verefCode, true);
    //     user.userLoginCountDown(helperFuncs.loginCountDownTime);
    //     let jwttoken = jwt.sign({ userMobile: req.body.phone }, process.env.ACCESS_TOKEN_SECRET as string);
    //     Caches.UsersArray.push(user);
    //     res.cookie("token", jwttoken, { sameSite: 'none', secure: true, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
    //     res.send({
    //         result: result,
    //         time: helperFuncs.loginCountDownTime
    //     })
    // }
    let result = "";
    // if (req.body.phone && req.body.phone.trim().length == 11) {
    axios({
        method: 'post',
        url: 'https://api.sms.ir/v1/send/verify',
        data: JSON.stringify({
            "mobile": req.body.phone,
            "templateId": 559989,
            "parameters": [
                {
                    "name": "VERIFYCODE",
                    "value": `${verefCode}`
                }
            ]
        }),
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            'X-API-KEY': 'SAOnvife4HizA32d3PBlZR8ESo6tohqrjsPkYkjt5YHGZx9oeDJ5vhkmTB4man9V'
        },
    }).then((response) => {
        if (response.status == 200) {
            if (response.data && response.data.status) {
                switch (response.data.status) {
                    case 1:
                        result = "R1";
                        break;
                    case 0:
                        result = "R2";
                        break;
                    case 104:
                        result = "R3";
                        break;
                    case 101:
                        result = "R4";
                        break;
                    case 104:
                        result = "R5";
                        break;
                    default:
                        result = "R6";
                        break;
                }

            }
            else {
                result = "R6";
            }
        }
        else {
            result = "R6";
        }
        if (result == "R1") {
            Caches.UsersArray.forEach((user, index) => {
                if (user.mobileNumber == req.body.phone) {
                    clearInterval(Caches.UsersArray[index].ptr);
                    Caches.UsersArray.splice(index, 1);
                }
            })
            console.log("yyyyyyyyy")
            let user = new User(req.body.phone, ipAddr, verefCode, true);
            user.userLoginCountDown(helperFuncs.loginCountDownTime);
            let jwttoken = jwt.sign({ userMobile: req.body.phone }, process.env.ACCESS_TOKEN_SECRET as string);
            Caches.UsersArray.push(user);
            res.cookie("token", jwttoken, { sameSite: "none", secure: true, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
            res.send({
                result: result,
                time: helperFuncs.loginCountDownTime
            })
        }
        else {
            res.send({
                result: result
            })
        }
    })
        .catch((err) => {
            fs.appendFileSync(path.join(__dirname, "../logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
            result = "R7";
            res.send({
                result: result
            })
        });
    // }
    //     else {
    //         result = "R7";
    //         res.send({
    //             result: result
    //         })
    //     }
    //     }
    //     catch (err: any) {
    //     fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
    //     res.end();
    // }
})
router.post("/authcode", checkUserRegistered, (req: Request, res: Response) => {
    // try {
    let ipAddr = req.get("origin");
    let code = req.body.code;
    let foundUser: ModelsTypes.IUser = req.user;
    if (!foundUser.logincodeok) {
        clearInterval(foundUser.ptr);
        res.send([{
            res: "R6" //user time to enter code finished.
        }])
    }
    else if (foundUser.logincodeok && (!code || code != foundUser.logincode)) {
        res.send([{
            res: "R7" //user entered wrong code.
        }])
    }
    else {
        /*
            Save User in Database...
        */
        clearInterval(foundUser.ptr);
        executesql("refreshUser",
            [{ name: 'ipAdddress', type: 'nvarchar(100)', value: foundUser.ipaddress },
            { name: 'phoneNumber', type: 'nvarchar(100)', value: foundUser.mobileNumber },
            { name: "lastvisitedInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString() },
            { name: "dateOfCreationInPersian", type: "nvarchar(max)", value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString() },
            ],
            [{ name: "result", type: "nvarchar(100)" }], (err: any, userCheckResult: any) => {
                if (err) {
                    res.send([{ res: "R5" }]);
                }
                if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "update2") {
                    let proxyOfRecordsets: (any)[];
                    foundUser.createRealatedObjects(userCheckResult.recordset ? [...userCheckResult.recordset] : <any>[]);
                    if (userCheckResult.recordset && userCheckResult.recordset.length && userCheckResult.recordset.length > 0) {
                        proxyOfRecordsets = [{ res: "update2" },
                        [{
                            up: {
                                upn: foundUser.firstName,
                                upln: foundUser.lastName,
                                upi: foundUser.imageUrl
                            },
                            uc: foundUser.isProfileCompleted,
                            mr: foundUser.readedmessageNumbers,
                            mu: foundUser.unreadedmessageNumbers,
                            rep: foundUser.reservedProductsNums,
                            bup: foundUser.buyedProductsNums,
                        }]];
                        res.send(JSON.stringify(proxyOfRecordsets));

                    }
                    else {
                        let proxyOfRecordsets = [{ res: "update2" }, []];
                        res.send(JSON.stringify(proxyOfRecordsets));
                    }
                }
                else if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "update1") {
                    let proxyOfRecordsets: (any)[];
                    foundUser.createRealatedObjects(userCheckResult.recordset ? [...userCheckResult.recordset] : <any>[]);
                    if (userCheckResult.recordset && userCheckResult.recordset.length && userCheckResult.recordset.length > 0) {
                        proxyOfRecordsets = [{ res: "update1" },
                        [{
                            up: {
                                upn: foundUser.firstName,
                                upln: foundUser.lastName,
                                upi: foundUser.imageUrl
                            },
                            uc: foundUser.isProfileCompleted,
                            mr: foundUser.readedmessageNumbers,
                            mu: foundUser.unreadedmessageNumbers,
                            rep: foundUser.reservedProductsNums,
                            bup: foundUser.buyedProductsNums,
                        }]];
                        res.send(JSON.stringify(proxyOfRecordsets));
                    }
                    else {
                        let proxyOfRecordsets = [{ res: "update1" }, []];
                        res.send(JSON.stringify(proxyOfRecordsets));
                    }
                }
                else if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "update0") {
                    let proxyOfRecordsets: (any)[];
                    foundUser.createRealatedObjects(userCheckResult.recordset ? [...userCheckResult.recordset] : <any>[]);
                    if (userCheckResult.recordset && userCheckResult.recordset.length && userCheckResult.recordset.length > 0) {
                        proxyOfRecordsets = [{ res: "update0" },
                        [{
                            up: {
                                upn: foundUser.firstName,
                                upln: foundUser.lastName,
                                upi: foundUser.imageUrl
                            },
                            uc: foundUser.isProfileCompleted,
                            mr: foundUser.readedmessageNumbers,
                            mu: foundUser.unreadedmessageNumbers,
                            rep: foundUser.reservedProductsNums,
                            bup: foundUser.buyedProductsNums,
                        }]];
                        res.send(JSON.stringify(proxyOfRecordsets));
                    }
                    else {
                        proxyOfRecordsets = [{ res: "update0" }, []];
                        res.send(JSON.stringify(proxyOfRecordsets));
                    }
                }
                else if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "blocked") {
                    var proxyOfRecordsets = [{ res: "blocked" }];
                    res.send(JSON.stringify(proxyOfRecordsets));
                }
                else {
                    var proxyOfRecordsets = [{ res: "R5" }];
                    res.send(JSON.stringify(proxyOfRecordsets));
                }
            })
    }
    // }
    // catch (err) {
    //     fs.appendFileSync(path.join(__dirname, "logs.txt"), "Error Date is " + (new Date(Date.now()).toLocaleDateString("fa-IR") + "--" + new Date(Date.now()).toLocaleTimeString("fa-IR") + "--->" + err.toString() + "\r\n"));
    //     res.end();
    // }
})

router.get("/zarRes", (req: Request, res: Response) => {
    fs.createReadStream(path.join(__dirname, "../../client/index.html")).pipe(res)
})
router.post("/verifyPay", (req: Request, res: Response) => {
    let Authority = req.body.num;
    console.log(Authority)
    executesql("getTransactionFromAuthorityNumber", [
        { name: "authNumber", type: "nvarchar(max)", value: Authority }], [], (err1: any, ress1: any) => {
            if (err1) {
                console.log(err1)
                res.send({
                    res: "R51"
                })
            }
            else {
                let transactionId = ress1 && ress1.recordset && ress1.recordset[0] ? ress1.recordset.transactionId : -1;
                let boughtNums = ress1 && ress1.recordset && ress1.recordset[0] ? ress1.recordset[0].boughtNums : 0;
                let transactionAmount = ress1 && ress1.recordset && ress1.recordset[0] ? ress1.recordset[0].transactionAmount : 0;
                axios.post("https://api.zarinpal.com/pg/v4/payment/verify.json", {
                    "merchant_id": "ff322465-8bb0-4245-9ae9-eb3012f983da",
                    "amount": boughtNums * transactionAmount * 10,
                    "authority": Authority
                })
                    .then((axiosRes) => {
                        console.log(axiosRes)
                        if (axiosRes.data &&
                            axiosRes.data.data &&
                            axiosRes.data.data.code) {
                            executesql("VerifyOrRejectOfPayment", [{ name: "transactionId", type: "int", value: transactionId },
                            {
                                name: "zarrinCode", type: "nvarchar(max)", value:
                                    (axiosRes.data &&
                                        axiosRes.data.data &&
                                        axiosRes.data.data.code &&
                                        (axiosRes.data.data.code == 100 || axiosRes.data.data.code == 101) ? axiosRes.data.data.code : -1)
                            }], [],
                                (err2: any, ress2: any) => {
                                    console.log(err2)
                                    if (err2) {
                                        res.send({
                                            res: "R52"
                                        })
                                    }
                                    else {
                                        res.send({
                                            res: "R1",
                                            resCode: (axiosRes.data &&
                                                axiosRes.data.data &&
                                                axiosRes.data.data.code &&
                                                (axiosRes.data.data.code == 100 || axiosRes.data.data.code == 101)) ? "verified" :
                                                "notVerified"
                                        })
                                    }
                                })
                        }
                        else {
                            res.send({
                                res: "R54"
                            })
                        }
                    })
                    .catch((axiosError) => {
                        res.send({
                            res: "R53"
                        })
                    })
            }
        })
})
router.post("/getFooter", (req: Request, res: Response) => {
    executesql("getFooter", [], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1",
                info: ress.recordset
            })
        }
    })
})
router.use(checkUserRegistered)
router.post("/zar", (req: Request, res: Response) => {
    let userMobil = req.user.mobileNumber;
    let userEmail = req.user.email;
    let pNums = req.body.pnums;
    let price = req.body.pprice;
    let tid = req.body.tid
    axios.post("https://api.zarinpal.com/pg/v4/payment/request.json", {
        "merchant_id": "ff322465-8bb0-4245-9ae9-eb3012f983da",
        "amount": pNums * price * 10,
        "callback_url": req.body.route,
        "description": "Pay Product Price By ZarrinPal",
        "metadata": { "mobile": userMobil, "email": userEmail }
    }).then((axiosResponse) => {
        executesql("setZarrinPallAuthority", [{ name: "ZarrinPallAuthority", type: "nvarchar(max)", value: axiosResponse.data.data.authority },
        { name: "transactionId", type: "int", value: tid },
        { name: "productNums", type: "int", value: pNums },
        { name: "resultMessageOfZarrinPal", type: "nvarchar(max)", value: axiosResponse.data.data.message },
        { name: "dateInPersian", type: "nvarchar(max)", value: new Date().toLocaleDateString("fa-IR") + "--" + new Date().toLocaleTimeString("fa-IR") }], [],
            (dbErr: any, dbRess: any) => {
                if (dbErr) {
                    if (axiosResponse.data.data.message == "Success") {
                        res.send({
                            res: "R15",//R[zarrinPal Status( 1-> success,5->not success)][database status (1->success, 5->not success)]
                            result: axiosResponse.data.data.authority
                        })
                    }
                    else {
                        res.send({
                            res: "R55"
                        })
                    }
                }
                else {
                    if (axiosResponse.data.data.message == "Success") {
                        res.send({
                            res: "R11",
                            result: axiosResponse.data.data.authority
                        })
                    }
                    else {
                        res.send({
                            res: "R51"
                        })
                    }
                }
            })
    })
        .catch((err) => {
            res.send({
                res: "R5"
            })
        })
})
router.post("/giin", (req: Request, res: Response) => {
    let foundUser: ModelsTypes.IUser = req.user;
    executesql("refreshUser",
        [{ name: 'ipAdddress', type: 'nvarchar(100)', value: foundUser.ipaddress },
        { name: 'phoneNumber', type: 'nvarchar(100)', value: foundUser.mobileNumber },
        { name: "lastvisitedInPersian", type: "nvarchar(max)", value: foundUser.lastVisitInPersian },
        { name: "dateOfCreationInPersian", type: "nvarchar(max)", value: foundUser.lastVisitInPersian },
        ],
        [{ name: "result", type: "nvarchar(100)" }], (err: any, userCheckResult: any) => {
            if (err) {
                res.send([{ res: "R5" }]);
            }
            if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "update2") {
                let proxyOfRecordsets: (any)[];
                foundUser.createRealatedObjects(userCheckResult.recordset ? [...userCheckResult.recordset] : <any>[]);
                if (userCheckResult.recordset && userCheckResult.recordset.length && userCheckResult.recordset.length > 0) {
                    proxyOfRecordsets = [{ res: "update2" },
                    [{
                        up: {
                            upn: foundUser.firstName,
                            upln: foundUser.lastName,
                            upi: foundUser.imageUrl,
                        },
                        uc: foundUser.isProfileCompleted,
                        mr: foundUser.readedmessageNumbers,
                        mu: foundUser.unreadedmessageNumbers,
                        rep: foundUser.reservedProductsNums,
                        bup: foundUser.buyedProductsNums,

                    }]];
                    res.send(JSON.stringify(proxyOfRecordsets));

                }
                else {
                    let proxyOfRecordsets = [{ res: "update2" }, []];
                    res.send(JSON.stringify(proxyOfRecordsets));
                }
            }
            else if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "update1") {
                let proxyOfRecordsets: (any)[];
                foundUser.createRealatedObjects(userCheckResult.recordset ? [...userCheckResult.recordset] : <any>[]);
                if (userCheckResult.recordset && userCheckResult.recordset.length && userCheckResult.recordset.length > 0) {
                    proxyOfRecordsets = [{ res: "update1" },
                    [{
                        up: {
                            upn: foundUser.firstName,
                            upln: foundUser.lastName,
                            upi: foundUser.imageUrl
                        },
                        uc: foundUser.isProfileCompleted,
                        mr: foundUser.readedmessageNumbers,
                        mu: foundUser.unreadedmessageNumbers,
                        rep: foundUser.reservedProductsNums,
                        bup: foundUser.buyedProductsNums,

                    }]];
                    res.send(JSON.stringify(proxyOfRecordsets));
                }
                else {
                    let proxyOfRecordsets = [{ res: "update1" }, []];
                    res.send(JSON.stringify(proxyOfRecordsets));
                }
            }
            else if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "update0") {
                let proxyOfRecordsets: (any)[];
                foundUser.createRealatedObjects(userCheckResult.recordset ? [...userCheckResult.recordset] : <any>[]);
                if (userCheckResult.recordset && userCheckResult.recordset.length && userCheckResult.recordset.length > 0) {
                    proxyOfRecordsets = [{ res: "update0" },
                    [{
                        up: {
                            upn: foundUser.firstName,
                            upln: foundUser.lastName,
                            upi: foundUser.imageUrl
                        },
                        uc: foundUser.isProfileCompleted,
                        mr: foundUser.readedmessageNumbers,
                        mu: foundUser.unreadedmessageNumbers,
                        rep: foundUser.reservedProductsNums,
                        bup: foundUser.buyedProductsNums,

                    }]];
                    res.send(JSON.stringify(proxyOfRecordsets));
                }
                else {
                    proxyOfRecordsets = [{ res: "update0" }, []];
                    res.send(JSON.stringify(proxyOfRecordsets));
                }
            }
            else if (userCheckResult && userCheckResult.output && userCheckResult.output.result && userCheckResult.output.result == "blocked") {
                var proxyOfRecordsets = [{ res: "blocked" }];
                res.send(JSON.stringify(proxyOfRecordsets));
            }
            else {
                var proxyOfRecordsets = [{ res: "R5" }];
                res.send(JSON.stringify(proxyOfRecordsets));
            }
        })
})
router.post("/profile", (req: Request, res: Response) => {
    res.send(req.user.exposeUserInfos());
})
router.post("/profile/update", (req: Request, res: Response) => {
    const foundUser: ModelsTypes.IUser = req.user;
    if (foundUser) {
        let newpath = path.join(__dirname, "../uploadedFiles", foundUser.mobileNumber);
        fs.mkdirSync(newpath, { recursive: true });
        const form = formidable({
            uploadDir: newpath,
            multiples: true,
            keepExtensions: true
        });
        form.parse(req, async (err, fields, files) => {
            if (err) {
                var userUpdateResult = [{ res: "R5" }];
                res.send(userUpdateResult);
            }
            else {
                console.log(files)
                let images: (any)[] = [];
                if (files.profileImage) {
                    images.push(files.profileImage[0]);
                }
                let reducedTasvirePersoneli: any = null;
                new Promise((resolve, reject) => {
                    if (images.length > 0) {
                        images.forEach((file, index) => {
                            sharp(fs.readFileSync(file.filepath))
                                .resize(300, 300)
                                .toBuffer()
                                .then((data) => {
                                    fs.writeFileSync(path.join(newpath, "reduced-300" + file.originalFilename.toString()), data);
                                    fs.renameSync(file.filepath, path.join(newpath, file.originalFilename.toString()));
                                    if ((/personeli/gi).test(file.originalFilename)) {
                                        reducedTasvirePersoneli = Buffer.from(data);
                                        console.log("kkk")
                                        console.log(reducedTasvirePersoneli)
                                    }
                                    if (index == images.length - 1) {
                                        resolve("ok");
                                    }
                                });
                        })
                    }
                    else {
                        resolve("ok");
                    }

                })
                    .then((val) => {
                        //update userInfo in Database
                        executesql("updatePersonalInfo",
                            [{ name: 'mobileNumber', type: 'nvarchar(100)', value: foundUser.mobileNumber ? foundUser.mobileNumber : "" },
                            { name: 'lastVisitInPersian', type: 'nvarchar(max)', value: new Date(Date.now()).toLocaleDateString("fa-IR") + "-" + new Date(Date.now()).toLocaleTimeString("fa-IR") },
                            { name: 'firstName', type: 'nvarchar(100)', value: fields.name && fields.name[0] ? fields.name[0] : '' },
                            { name: 'lastName', type: 'nvarchar(100)', value: fields.lastName && fields.lastName[0] ? fields.lastName[0] : '' },
                            { name: 'shomarehmelli', type: 'nvarchar(max)', value: fields.shomarehMelli && fields.shomarehMelli[0] ? fields.shomarehMelli[0] : null },
                            { name: 'address', type: 'nvarchar(max)', value: fields.address && fields.address[0] ? fields.address[0] : '' },
                            { name: 'email', type: 'nvarchar(max)', value: fields.email && fields.email[0] ? fields.email[0] : '' },
                            { name: 'sabetNumber', type: 'nvarchar(max)', value: fields.shomarehSabet && fields.shomarehSabet[0] ? fields.shomarehSabet[0] : null },
                            { name: 'profileImage', type: 'varbinary(max)', value: reducedTasvirePersoneli },
                            { name: 'lastIpAddress', type: 'nvarchar(max)', value: foundUser.ipaddress ? foundUser.ipaddress : '' },
                            { name: 'tarikheTavallod', type: 'nvarchar(max)', value: fields.tarikheTavallod && fields.tarikheTavallod[0] ? fields.tarikheTavallod[0] : '' },
                            { name: 'ostaneTavallod', type: 'nvarchar(max)', value: fields.ostaneTavallod && fields.ostaneTavallod[0] ? fields.ostaneTavallod[0] : '' },
                            ],
                            [], (err: any, userUpdateResult: any) => {
                                if (err) {
                                    console.log(err)
                                    var finalResult = [{ res: "R6" }];
                                    res.send(finalResult);
                                }
                                else {
                                    foundUser.createRealatedObjects(userUpdateResult.recordset ? [...userUpdateResult.recordset] : []);
                                    if (userUpdateResult.recordset &&
                                        userUpdateResult.recordset.length && userUpdateResult.recordset.length > 0) {
                                        res.send(foundUser.exposeUserInfos());
                                    }
                                    else {
                                        var finalResult = [{ res: "R6" }];
                                        res.send(finalResult);
                                    }
                                }
                            })
                    })

            }
        });
    }
    else {
        var finalResult = [{ res: "R4" }];
        res.send(finalResult);
    }
})
router.post("/gcim", (req: Request, res: Response) => {
    executesql("getCarouselImagesUrls", [], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1",
                images: ress.recordset && ress.recordset.length > 0 ? ress.recordset : []
            })
        }
    })
})
router.post("/icons", (req: Request, res: Response) => {
    executesql("geticon", [], [], (err: any, ress: any) => {
        if (err) {
            res.send([{ res: "R5" }])
        }
        else {
            if (ress.recordset && ress.recordset.length > 0) {
                let newRes: any = [];
                newRes = ress.recordset.map((icon: any, index: any) => {
                    return { in: icon.id, iv: icon.iconUrl }
                })
                // console.log(newRes)
                res.send([{ res: "ok" }, newRes]);
            }
            else {
                res.send([{ res: "ok" }, []])
            }
        }
    })
})
router.post("/filters", (req: Request, res: Response) => {
    executesql("getFilterCategories", [], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            if (ress.recordset && ress.recordset.length > 0) {
                res.send({
                    res: "R1",
                    filters: ress.recordset
                })
            }
            else {
                res.send({
                    res: "R6"
                })
            }
        }
    })
})
router.post("/gfm", (req: Request, res: Response) => {
    let filterCategoryId = req.body.fi;
    executesql("getFilterMembers", [
        { name: "filterId", type: "int", value: filterCategoryId }
    ], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R6",
                result: ""
            })
        }
        else {
            if (ress.recordset && ress.recordset.length > 0) {
                res.send({
                    res: "R1",
                    fm: ress.recordset
                })
            }
            else {
                res.send({
                    res: "R1",
                    fm: []
                })
            }
        }
    })
})
router.post("/gsfm", (req: Request, res: Response) => {
    executesql("getFilterShortMembers", [], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R6",
                result: "",
                fm: ress.recordset
            })
        }
        else {
            if (ress.recordset && ress.recordset.length > 0) {
                res.send({
                    res: "R1",
                    fm: ress.recordset
                })
            }
            else {
                res.send({
                    res: "R1",
                    fm: []
                })
            }
        }
    })
})
router.post("/gpi", (req: Request, res: Response) => {
    res.send({
        res: "R1",
        info: req.user.exposeUserInfos()
    });
})
router.post("/gpc", (req: Request, res: Response) => {
    executesql("getProductComments", [{ name: "productId", type: "int", value: req.body.pid }], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            if (ress.recordset && ress.recordset.length > 0) {
                res.send({
                    res: "R1",
                    cms: ress.recordset
                })
            }
            else {
                res.send({
                    res: "R1",
                    cms: []
                })
            }
        }
    })
})
router.post("/rt", (req: Request, res: Response) => {
    executesql("removeTransaction", [{ name: "transactionId", type: "int", value: req.body.tid },
    { name: "reserveCanceleDateInPersian", type: "nvarchar(max)", value: new Date().toLocaleDateString("fa-IR") + "-" + new Date().toLocaleTimeString("fa-IR") },
    { name: "userId", type: "int", value: req.body.peri }], [{ name: "numOfReservs", type: "int" }], (err: any, ress: any) => {
        if (err) {
            console.log(err)
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1",
                info: ress.recordset,
                numOfReservs: ress.output.numOfReservs
            })
        }
    })
})
router.post("/uusi", (req: Request, res: Response) => {
    let newPath = path.join(__dirname, "../../public/pi")
    if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath, { recursive: true });
    }
    console.log(newPath)
    let form = formidable({
        uploadDir: newPath,
        keepExtensions: true,
        multiples: true
    })
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        let newOriginalName;
        if (files["Personeli"] && files["Personeli"].length > 0) {
            console.log(files["Personeli"])
            if (fs.existsSync(path.join(newPath, ((files["Personeli"])?.[0].newFilename) ? (files["Personeli"])?.[0].newFilename : `tt-${Date.now()}`))) {
                let origFileName = (files["Personeli"]?.[0].originalFilename) ? (files["Personeli"])?.[0].originalFilename : '';
                console.log(origFileName)
                if (origFileName) {
                    newOriginalName = `im-${req.user.id}-${Date.now()}-${(origFileName ? origFileName : '')}`;
                    console.log(newOriginalName)
                    fs.renameSync(path.join(newPath, ((files["Personeli"])?.[0].newFilename) ? (files["Personeli"])?.[0].newFilename : ''),
                        path.join(newPath, newOriginalName));
                }
            }
        }
        console.log(newOriginalName)
        let name = fields["name"]?.[0];
        let lastname = fields["lastName"]?.[0];
        let mobile = fields["mobile"]?.[0]
        let ostan = fields["ostaneTavallod"]?.[0]
        let address = fields["address"]?.[0]
        let email = fields["email"]?.[0]
        console.log(req.user.id)
        executesql("uup", [
            { name: "id", type: "int", value: req.user.id },
            { name: "name", type: "nvarchar(max)", value: name },
            { name: "mobile", type: "nvarchar(max)", value: mobile },
            { name: "lastName", type: "nvarchar(max)", value: lastname },
            { name: "ostan", type: "nvarchar(max)", value: ostan },
            { name: "address", type: "nvarchar(max)", value: address },
            { name: "email", type: "nvarchar(max)", value: email },
            { name: "imageUrl", type: "nvarchar(max)", value: newOriginalName ? `/pi/${newOriginalName}` : 'non' }
        ], [], (err: any, ress: any) => {
            if (err) {
                console.log(err)
                res.send({
                    res: "R5"
                })
            }
            else {
                req.user.createRealatedObjects(ress.recordset)
                console.log(ress)
                res.send({
                    res: "R1",
                    info: req.user.exposeUserInfos()
                })
            }
        })
    })
})
router.post("/adtt", (req: Request, res: Response) => {
    if (req.user) {
        let productId = req.body.pid;
        if (productId) {
            executesql("addProductToReserve", [
                { name: "productid", type: "int", value: productId },
                { name: "userid", type: "int", value: req.user.id },
                { name: "reserving", type: "int", value: 1 },//it is reserved
                { name: "dateOfReserveInPersian", type: "nvarchar(max)", value: new Date().toLocaleDateString("fa-IR") + "-" + new Date().toLocaleTimeString("fa-IR") },
                { name: "reserveFinalStatus", type: "nvarchar(max)", value: "reserved" },
                { name: "reserveFinalCode", type: "int", value: "0" }//level 0 of reserving stages( 0->reserved,1->reserved to buy procedure,2->reserved cancel by user,3->reserve cancel by time elapsed)
            ], [{ name: "resultTrans", type: "int" }, { name: "resultProduct", type: "int" }, { name: "numOfReservs", type: "int" }], (err: any, ress: any) => {
                if (err) {
                    console.log(err)
                    res.send({
                        res: "R5"
                    })
                }
                else {
                    res.send({
                        res: "R1",
                        resultProduct: ress.output.resultProduct,
                        resultTrans: ress.output.resultTrans,
                        reservs: ress.output.numOfReservs
                    })
                }
            })
        }
        else {
            res.send({
                res: "R5"
            })
        }
    }
    else {
        res.send({
            res: "R11"
        })
    }
})
router.post("/getPortfilo", (req: Request, res: Response) => {
    let id = req.user.id;
    console.log(id)
    executesql("getportfilo", [{ name: "id", type: "int", value: id }], [{ name: "numOfReservs", type: "int" }], (err: any, ress: any) => {
        console.log(err)
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1",
                products: ress.recordset,
                numOfReservs: ress.output.numOfReservs
            })
        }
    })
})
router.post("/pp", (req: Request, res: Response) => {
    let userId = req.user.id;
    executesql("buyProduct", [
        { name: "userId", type: "int", value: userId },
        { name: "productId", type: "int", value: req.body.pi },
        { name: "productNums", type: "int", value: req.body.pnums },
        { name: "transactionId", type: "int", value: req.body.ti }, { name: "dateInPersian", type: "nvarchar(max)", value: new Date().toLocaleDateString("fa-IR") + "-" + new Date().toLocaleTimeString("fa-IR") }
    ], [{ name: "numOfReservs", type: "int" }], (err: any, ress: any) => {
        if (err) {
            console.log(err)
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1",
                info: ress.recordset,
                numOfReservs: ress.output.numOfReservs
            })
        }

    })
})
router.post("/sendMessage", (req: Request, res: Response) => {
    executesql("sendUserMessageToAdmin", [
        { name: "mesSub", type: "nvarchar(max)", value: req.body.mesSub },
        { name: "mesText", type: "nvarchar(max)", value: req.body.mesText },
        { name: "userId", type: "int", value: req.user.id },
        { name: "dateInPersian", type: "nvarchar(max)", value: new Date().toLocaleDateString("fa-IR") + "-" + new Date().toLocaleTimeString("fa-IR") }
    ], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1"
            })
        }
    })
})
router.post("/getMessages", (req: Request, res: Response) => {
    let userId = req.user.id;
    executesql("getMessages", [{ name: "userId", type: "int", value: userId }], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1",
                messages: ress.recordset ? ress.recordset : []
            })
        }
    })
})
router.post("/exit", (req: Request, res: Response) => {
    Caches.UsersArray.forEach((user, index) => {
        if (user.id == req.user.id) {
            clearInterval(Caches.UsersArray[index].ptr);
            Caches.UsersArray.splice(index, 1);
        }
    })
    res.cookie("token", "", { sameSite: 'none', secure: true, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
    res.send({
        res: "R1"
    })
})
router.post("/mkr", (req: Request, res: Response) => {
    console.log(req.body.mId)
    executesql("makeRead", [{ name: "messageId", type: "int", value: req.body.mId }, { name: "userId", type: "int", value: req.user.id }], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1",
                messages: ress.recordset ? ress.recordset : []
            })
        }
    })
})
router.post("/dpdis", (req: Request, res: Response) => {
    executesql("deleteProductDiscount", [{ name: "productId", type: "int", value: req.body.pd }], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1"
            })
        }
    })
})
export default router;