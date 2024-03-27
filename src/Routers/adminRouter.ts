///<reference path="../../typings/ModelsTypes.d.ts" />
import { AdminUsers } from '../../Controllers/Caches';
import { requestConditions } from "../../configs"
import { Router, express, Request, Response, checkAdminRegistered, AdminUser, jwt, cors, executesql, Caches, formidable, path, sharp, fs, cookieParser } from '../dependencies'
const router = Router();
router.use([cors({
    credentials: true,
    origin: true
}), cookieParser(), express.json(), express.urlencoded({ extended: false })]);

router.post("/login", (req: Request, res: Response) => {
    let userName = req.body.adu;
    let password = req.body.adp;
    executesql("checkadmin", [
        { name: "userName", type: "nvarchar(max)", value: userName },
        { name: "password", type: "nvarchar(max)", value: password }
    ], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5",
            })
        }
        else {
            if (ress.recordset && ress.recordset.length > 0) {
                Caches.AdminUsers.forEach((user, index) => {
                    if (user.userName == userName && user.password == password) {
                        Caches.AdminUsers.splice(index, 1);
                    }
                })
                let admin = new AdminUser(userName, password);
                let jwttoken = jwt.sign({ userName: userName, password: password }, process.env.ACCESS_TOKEN_SECRET_ADMIN as string);
                Caches.AdminUsers.push(admin);
                console.log(AdminUsers);
                res.cookie("token1", jwttoken, { sameSite: 'none', secure: true, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
                res.send({
                    res: "R1",
                })
            }
            else {
                res.send({
                    res: "R4",
                })
            }
        }
    })
})
router.use(checkAdminRegistered)
router.post("/exit", (req: Request, res: Response) => {
    Caches.AdminUsers.forEach((user, index) => {
        if (user.userName == req.admin.userName && user.password == req.admin.password) {
            Caches.AdminUsers.splice(index, 1);
        }
    })
    res.cookie("token1", "", { sameSite: 'none', secure: true, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
    res.send({
        res: "R1"
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
            ], [{ name: "result", type: "int" }, { name: "numOfReservs", type: "int" }], (err: any, ress: any) => {
                if (err) {
                    res.send({
                        res: "R5"
                    })
                }
                else {
                    res.send({
                        res: "R1",
                        result: ress.output.result,
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
router.post("/addmembertofilter", (req: Request, res: Response) => {
    let newPath = path.join(__dirname, "../../public/upfi")
    if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath, { recursive: true })
    }
    let form = formidable({
        uploadDir: newPath,
        multiples: true,
        keepExtensions: true
    })
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            let filterCategoryId = (fields["fd"] && fields["fd"] != undefined) ? (fields["fd"])[0] : "";
            let filterMemberName = (fields["fmn"] && fields["fmn"] != undefined) ? (fields["fmn"])[0] : "";
            let filterMemberDescription = (fields["fmd"] && fields["fmd"] != undefined) ? (fields["fmd"])[0] : "";
            let filterMemberPrice = (fields["fmp"] && fields["fmp"] != undefined) ? (fields["fmp"])[0] : "";
            let filterMemberPriceUnit = (fields["fmpu"] && fields["fmpu"] != undefined) ? (fields["fmpu"])[0] : "";
            let filterMemberProductRatiing = (fields["fmr"] && fields["fmr"] != undefined) ? (fields["fmr"])[0] : "";
            let filterMemberImage = (files["fmi"] && files["fmi"] != undefined) ? (files["fmi"])[0] : undefined;
            let isFilterMemberIsDiscounted = (fields["fmid"] && fields["fmid"] != undefined) ? (fields["fmid"])[0] : "";
            let filterMemberPriceDiscounted = (fields["fmpd"] && fields["fmpd"] != undefined) ? (fields["fmpd"])[0] : "";
            let filterMemberPriceDateOfDiscountEnded = (fields["fmded"] && fields["fmded"] != undefined) ? (fields["fmded"])[0] : -1;
            filterMemberPriceDateOfDiscountEnded = filterMemberPriceDateOfDiscountEnded ? filterMemberPriceDateOfDiscountEnded : -1;
            console.log(filterMemberPriceDateOfDiscountEnded)
            let filterMemberImageUrlBase = `im-${Date.now().toString()}-${filterMemberImage != undefined && filterMemberImage!.originalFilename != null ? filterMemberImage!.originalFilename : ""}`;
            fs.renameSync(path.join(newPath, filterMemberImage != undefined ? filterMemberImage!.newFilename : ""), path.join(newPath, `${filterMemberImageUrlBase}`))
            let filterMemberImageUrl = `/upfi/${filterMemberImageUrlBase}`
            console.log(filterMemberImageUrl)
            executesql("addmembertofiltercategory", [
                { name: "filterMemberImageUrl", type: "nvarchar(max)", value: filterMemberImageUrl },
                { name: "filterMemberName", type: "nvarchar(max)", value: filterMemberName },
                { name: "filterMemberDescription", type: "nvarchar(max)", value: filterMemberDescription },
                { name: "filterMemberRating", type: "nvarchar(max)", value: filterMemberProductRatiing },
                { name: "filterMemberPriceUnit", type: "nvarchar(max)", value: filterMemberPriceUnit },
                { name: "filterMemberPrice", type: "nvarchar(max)", value: filterMemberPrice },
                { name: "isFilterMemberIsDiscounted", type: "bit", value: isFilterMemberIsDiscounted },
                { name: "filterMemberPriceDiscounted", type: "nvarchar(max)", value: filterMemberPriceDiscounted },
                { name: "filterMemberPriceDateOfDiscountEnded", type: "bigint", value: filterMemberPriceDateOfDiscountEnded },
                { name: "creator", type: "int", value: req.admin.adminId },
                { name: "dateOfCreationInPersian", type: "nvarchar(max)", value: new Date().toLocaleDateString("fa-IR") + "-" + new Date().toLocaleTimeString("fa-IR") },
                { name: "filterCategoryId", type: "int", value: filterCategoryId },
            ], [], (err: any, ress: any) => {
                if (err) {
                    console.log(err)
                    res.send({
                        res: "R6"
                    })
                }
                else {
                    res.send({
                        res: "R1"
                    })
                }
            })
        }
    })
})
router.post("/ram", (req: Request, res: Response) => {
    executesql("removeAllFilterMembers", [{ name: "filterCategoryId", type: "int", value: req.body.fd }], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R6"
            })
        }
        else {
            res.send({
                res: "R1"
            })
        }
    })
})
router.post("/gsfm", (req: Request, res: Response) => {
    let filterCategoryId = req.body.fi;
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
router.post("/gfm", (req: Request, res: Response) => {
    let filterCategoryId = req.body.fi;
    executesql("getFilterMembers", [
        { name: "filterId", type: "int", value: filterCategoryId }
    ], [], (err: any, ress: any) => {
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
router.post("/sDf", (req: Request, res: Response) => {
    let filterCategoryId = req.body.fid;
    executesql("setDefaultFilter", [{ name: "filterCategoryId", type: "int", value: filterCategoryId }], [], (err: any, ress: any) => {
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
router.post("/rf", (req: Request, res: Response) => {
    let id = req.body.id;
    executesql("removefilter", [{ name: "filterId", type: "int", value: id }], [], (err: any, ress: any) => {
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
router.post("/applyfilter", (req: Request, res: Response) => {
    let selectedIconName = req.body.sfn;
    let selectedIconId = req.body.sfi;
    executesql("addtofiltercategory", [
        { name: "filterName", type: "nvarchar(max)", value: selectedIconName },
        { name: "filterIconId", type: "int", value: selectedIconId },
        { name: "creatorId", type: "int", value: req.admin.adminId },
        {
            name: "", type: "nvarchar(max)", value: new Date().toLocaleDateString("fa-IR") + "-" +
                new Date().toLocaleTimeString("fa-IR")
        }], [], (err: any, ress: any) => {
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
router.post("/iconsUpload", (req: Request, res: Response) => {
    console.log("yyyyyyyyyyyyyyyyy")
    let newpath = path.join(__dirname, "../../public/upi");
    if (!fs.existsSync(newpath)) {
        fs.mkdirSync(newpath, { recursive: true });
    }
    const form = formidable({
        uploadDir: newpath,
        multiples: true,
        keepExtensions: true
    });
    console.log("ggggggggggggggggggg")
    form.parse(req, async (err, fields, files) => {
        console.log("nnnnnnnnnnnnnnn")
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            let icons = files.newIcon;
            let reducedSizedIcons: any = [];
            let reducedSizedIconsNames: any = []
            let reducedSizedIconsPaths: any = []
            let isError: boolean = false;
            new Promise((resolve, reject) => {
                if (icons != undefined && icons.length > 0) {
                    icons?.forEach((icon, index) => {
                        sharp(fs.readFileSync(icon.filepath))
                            .resize(70, 70)
                            .toBuffer()
                            .then((data) => {
                                let pp = "reduced-" + Date.now() + icon.originalFilename?.toString();
                                let iconPath = path.join(newpath, pp);
                                if (icon && icon.originalFilename) {
                                    fs.unlinkSync(path.join(newpath, icon.newFilename?.toString()))
                                }
                                reducedSizedIconsPaths.push(iconPath)
                                fs.writeFileSync(iconPath, data)
                                reducedSizedIcons.push(data);
                                reducedSizedIconsNames.push(pp);
                                if (icons?.length as any - 1 == index) {
                                    resolve("ok");
                                }
                            });
                    })
                }
                else {
                    resolve("noIcon")
                }
            })
                .then(async (data) => {
                    if (data == "noIcon") {
                        res.send({
                            res: "R6"
                        })
                    }
                    else {
                        for (let i = 0; i < reducedSizedIcons.length; i++) {
                            console.log(reducedSizedIcons[i].originalFilename);
                            console.log(reducedSizedIconsPaths[i]);
                            let res: any;
                            res = await new Promise((resolve, reject) => {
                                executesql("uploadIcon", [
                                    { name: "iconName", type: "nvarchar(max)", value: reducedSizedIconsNames[i] },
                                    { name: "iconUrl", type: "nvarchar(max)", value: "/upi/" + reducedSizedIconsNames[i] },
                                    { name: "creatorId", type: "int", value: req.admin.adminId },
                                    { name: "createdDateInPersian", type: "nvarchar(max)", value: new Date().toLocaleDateString("fa-IR") + "-" + new Date().toLocaleTimeString("fa-IR") }
                                ], [], (err: any, res: any) => {
                                    if (err) {
                                        console.log(err)
                                        isError = true;
                                        resolve("withError")
                                    }
                                    else {
                                        resolve("ok")
                                    }
                                })
                            });

                            console.log(res)
                        }
                        res.send({ res: isError ? "withError" : "ok" })
                    }
                })
        }
    })
})
router.post("/giin", (req: Request, res: Response) => {
    let admin = req.admin;
    executesql("checkadmin", [
        { name: "userName", type: "nvarchar(max)", value: admin.userName },
        { name: "password", type: "nvarchar(max)", value: admin.password }
    ], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            let resultArray: any = ress.recordset;
            if (resultArray && resultArray.length > 0) {
                res.send({ res: "R1" })
            }
            else {
                res.send({
                    res: "R4"
                })
            }
        };
    })
})

//Actions For Carousel Images
//upci ( user Personal Carousel Images ) is the name of folder in Public Folder for Carousel Images.

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
router.post("/rgscis", (req: Request, res: Response) => {
    let newPath = path.join(__dirname, "../../public/upci");
    if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath, { recursive: true })
    }
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
        else {
            let isError = false;
            let carouselImages: any[] = files && files.scis ? files.scis : [];
            if (carouselImages.length > 0) {
                carouselImages.forEach(async (image, index) => {
                    let newName = `im-${Date.now().toString()}-${image && image.originalFilename ? image.originalFilename : ''}`
                    fs.renameSync(path.join(newPath, image.newFilename), path.join(newPath, newName))
                    let x = await new Promise((resolve, reject) => {
                        executesql("addToCarouselImages", [
                            { name: "imageUrl", type: "nvarchar(max)", value: `/upci/${newName}` },
                            { name: "mainBlurAmount", type: "int", value: 0 },
                            { name: "middleMainBox", type: "nvarchar(max)", value: '' },
                            { name: "middleHint1", type: "nvarchar(max)", value: '' },
                            { name: "middleHint2", type: "nvarchar(max)", value: '' },
                            { name: "middleHint3", type: "nvarchar(max)", value: '' },
                            { name: "middleMainImage", type: "nvarchar(max)", value: '' },
                            { name: "dateOfCreationInPersian", type: "nvarchar(max)", value: new Date().toLocaleDateString("fa-IR") + "-" + new Date().toLocaleTimeString("fa-IR") },
                            { name: "creator", type: "int", value: req.admin.adminId },
                        ], [], (err: any, ress: any) => {
                            if (err) {
                                isError = true;
                                console.log(err)
                                resolve("notOk")
                            }
                            else {
                                resolve("ok")
                            }
                        })
                    })
                    console.log(x)
                })
                res.send({
                    res: "R1"
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
router.post("/remci", (req: Request, res: Response) => {
    if (req.body.id && req.body.id > 0) {
        executesql("removeCarouselImage", [{ name: "imageId", type: "int", value: req.body.id }], [], (err: any, ress: any) => {
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
    }
    else {
        res.send({
            res: "R6"
        })
    }
})
router.post("/mci", (req: Request, res: Response) => {
    let newPath = path.join(__dirname, "../../public/upci/upcisub");
    if (!fs.existsSync(newPath)) {
        fs.mkdirSync(newPath);
    }
    let form = formidable({
        uploadDir: newPath,
        multiples: true,
        keepExtensions: true
    })
    form.parse(req, (err, fields, files) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            let id = (fields["id"] && fields["id"] != undefined) ? (fields["id"])[0] : "";
            let mdh1 = (fields["mdh1"] && fields["mdh1"] != undefined) ? (fields["mdh1"])[0] : "";
            let mdh2 = (fields["mdh2"] && fields["mdh2"] != undefined) ? (fields["mdh2"])[0] : "";
            let mdh3 = (fields["mdh3"] && fields["mdh3"] != undefined) ? (fields["mdh3"])[0] : "";
            let mi = (fields["mi"] && fields["mi"] != undefined) ? (fields["mi"])[0] : "";
            let mdmb = (fields["mdmb"] && fields["mdmb"] != undefined) ? (fields["mdmb"])[0] : "";
            let bla = (fields["bla"] && fields["bla"] != undefined) ? (fields["bla"])[0] : "";
            let image: formidable.File | undefined = files["miImage"] && files["miImage"] != undefined ? (files["miImage"])[0] : undefined;
            let dateNow = Date.now();
            console.log(`im-${dateNow}-${image != undefined ? image?.originalFilename != undefined && image?.originalFilename != null ? image?.originalFilename : '' : ''}`);
            if (image) {
                if (fs.existsSync(path.join(newPath, image != undefined ? image.newFilename : ''))) {
                    fs.renameSync(path.join(newPath, image != undefined ? image.newFilename : ''), path.join(newPath,
                        `im-${dateNow}-${image != undefined ? image?.originalFilename != undefined && image?.originalFilename != null ? image?.originalFilename : '' : ''}`))
                }
                try {
                    let newMi = JSON.parse(mi);
                    newMi.url = `/upci/upcisub/im-${dateNow}-${image != undefined ? image?.originalFilename != undefined && image?.originalFilename != null ? image?.originalFilename : '' : ''}`;
                    mi = JSON.stringify(newMi);
                }
                catch (err) {

                }
            }
            executesql("modifyCarouselImage", [
                { name: "mdh1", type: "nvarchar(max)", value: mdh1 },
                { name: "mdh2", type: "nvarchar(max)", value: mdh2 },
                { name: "mdh3", type: "nvarchar(max)", value: mdh3 },
                { name: "mdmb", type: "nvarchar(max)", value: mdmb },
                { name: "mi", type: "nvarchar(max)", value: mi },
                { name: "bla", type: "int", value: bla },
                { name: "id", type: "int", value: id }], [], (err: any, ress: any) => {
                    if (err) {
                        console.log(err)
                        res.send({ res: "R5" })
                    }
                    else {
                        res.send({ res: "R1" })
                    }
                })
        }
    })
})
router.post("/exit", (req: Request, res: Response) => {
    Caches.AdminUsers.forEach((user, index) => {
        if (user.userName == req.admin.userName && user.password == req.admin.password) {
            Caches.AdminUsers.splice(index, 1);
        }
    })
    res.cookie("token1", "", { sameSite: 'none', secure: true, httpOnly: true, maxAge: 7 * 24 * 60 * 60 * 1000 })
    res.send({
        res: "R1"
    })
})
router.post("/users", (req: Request, res: Response) => {
    executesql("getUsers", [], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1",
                users: ress.recordset ? ress.recordset : []
            })
        }
    })
})
router.post("/gpi", (req: Request, res: Response) => {
    executesql("getUserInfo", [{ name: "userId", type: "int", value: req.body.userId }], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1",
                user: ress.recordset ? ress.recordset : []
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
        let userId = fields["id"]?.[0];
        let newOriginalName;
        if (files["Personeli"] && files["Personeli"].length > 0) {
            let Dirfiles = fs.readdirSync(path.join(newPath));
            let regEx = new RegExp(`im-${userId}-`);
            let userfile = Dirfiles.filter((item, index) => {
                return regEx.test(item);
            })
            if (userfile.length > 0) {
                userfile.forEach((item, index) => {
                    fs.rmSync(path.join(newPath, item))
                })
            }
            if (fs.existsSync(path.join(newPath, ((files["Personeli"])?.[0].newFilename) ? (files["Personeli"])?.[0].newFilename : `tt-${Date.now()}`))) {
                let origFileName = (files["Personeli"]?.[0].originalFilename) ? (files["Personeli"])?.[0].originalFilename : '';
                console.log(origFileName)
                if (origFileName) {
                    if (userId) {
                        newOriginalName = `im-${userId}-${Date.now()}-${(origFileName ? origFileName : '')}`;
                    }
                    else {
                        newOriginalName = `noUserSpecified-${Date.now()}`;
                    }
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
        executesql("uup", [
            { name: "id", type: "int", value: userId },
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
                executesql("getUserInfo", [{ name: "userId", type: "int", value: userId }], [], (err: any, ress: any) => {
                    if (err) {
                        res.send({
                            res: "R5"
                        })
                    }
                    else {
                        res.send({
                            res: "R1",
                            info: ress.recordset ? ress.recordset : []
                        })
                    }
                })
            }
        })
    })
})
router.post("/getMessages", (req: Request, res: Response) => {
    executesql("getAdminMessages", [], [], (err: any, ress: any) => {
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
router.post("/mkr", (req: Request, res: Response) => {
    console.log(req.body.mId)
    executesql("makeReadInAdmin", [{ name: "messageId", type: "int", value: req.body.mId }], [], (err: any, ress: any) => {
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
router.post("/requests", (req: Request, res: Response) => {
    executesql("getRequest", [], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1",
                requests: { requests: ress.recordset, requestConditions: requestConditions }
            })
        }
    })
})
router.post("/sf", (req: Request, res: Response) => {
    executesql("siteFooterUpdate", [
        { name: "contactPhones", type: "nvarchar(max)", value: req.body.contactPhones },
        { name: "address", type: "nvarchar(max)", value: req.body.address },
        { name: "instagramAddress", type: "nvarchar(max)", value: req.body.instagramAddress },
        { name: "twitterAddress", type: "nvarchar(max)", value: req.body.twitterAddress },
        { name: "linkedinAddress", type: "nvarchar(max)", value: req.body.linkedinAddress },
        { name: "creationDateInPersian", type: "nvarchar(max)", value: new Date().toLocaleDateString("fa-IR") + "-" + new Date().toLocaleTimeString("fa-IR") }
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
router.post("/transactiondetails", (req: Request, res: Response) => {
    executesql("transactiondetails", [{ name: "transactionId", type: "int", value: req.body.tId }], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1",
                transaction: ress.recordset && ress.recordset.length > 0 ? ress.recordset : []
            })
        }
    })
})
router.post("/verifyPayment", (req: Request, res: Response) => {
    executesql("verifyPayment", [{ name: "transactionId", type: "int", value: req.body.tId },

    { name: "dateInPersian", type: "nvarchar(max)", value: new Date().toLocaleDateString("fa-IR") + "-" + new Date().toLocaleTimeString("fa-IR") }], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1",
                transaction: ress.recordset
            })
        }
    })
})
router.post("/cancelPayment", (req: Request, res: Response) => {
    executesql("cancelPayment", [{ name: "transactionId", type: "int", value: req.body.tId },
    { name: "reasonOfFail", type: "nvarchar(max)", value: req.body.rof },
    { name: "dateInPersian", type: "nvarchar(max)", value: new Date().toLocaleDateString("fa-IR") + "-" + new Date().toLocaleTimeString("fa-IR") }], [], (err: any, ress: any) => {
        if (err) {
            res.send({
                res: "R5"
            })
        }
        else {
            res.send({
                res: "R1",
                transaction: ress.recordset
            })
        }
    })
})
router.post("/sendMessageToUser", (req: Request, res: Response) => {
    executesql("sendMessageToUser", [
        { name: "msgSubject", type: "nvarchar(max)", value: req.body.mesSub },
        { name: "msgText", type: "nvarchar(max)", value: req.body.mesText },
        { name: "userId", type: "int", value: req.body.uId },
        { name: "messageDateInPersian", type: "nvarchar(max)", value: new Date().toLocaleDateString("fa-IR") + "-" + new Date().toLocaleTimeString("fa-IR") }
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
export default router;