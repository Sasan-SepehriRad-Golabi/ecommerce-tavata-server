namespace ModelsTypes {
    export interface IUser {
        logincodeok: any;
        logincode: any;
        id: number;
        mobileNumber: string;
        ipaddress: string;
        isProfileCompleted: boolean;
        firstName: string;
        lastName: string;
        namePedar: string;
        email: string;
        address: string;
        lastVisitInPersian: string;
        profileImage: string;
        base64ProfileImage: string;
        imageUrl: string;
        tarikheTavallod: string;
        ostaneTavallod: string;
        sabetNumber: string;
        blocked: boolean;
        blockedDateInPersian: string;
        blockedReason: string;
        unreadedmessageNumbers: number;
        readedmessageNumbers: number;
        reservedProductsNums: number;
        buyedProductsNums: number;
        messages: (IMessageFromAdmin | undefined)[];
        transactions: (ITransaction | undefined)[];
        time: number = 0;
        ptr: any;
        userLoginCountDown(time: number): void;
        exposeUserInfos(): object;
        createRealatedObjects(objArray: IResultOFRefreshUserSqlProcedure[]): void
    }
    export interface ITransaction {
        public transactionId: number;
        public codeRahgiri: string;
        public transactionDateInPersian: string;
        public productId: number;
        public boughtAmount: string;
        public userId: number;
        public verifierAdminId: number;
        public status: string;
        public optionalMoreInfo: string;
        public userCommentAboutProduct: string;
        public userScoreToProduct: number;
    }
    export interface IProductCategory {
        public productCategoryId: number;
        public categoryName: string;
        public optionalOtherInfos: string;
        public numberOfProductsInCategory: number;
        public numberOfSoldProductsOfThisCategory: number;
        public amountOfMoneySoldFromThisProduct: number;
    }
    export interface IProduct {
        public productId: number;
        public productName: string;
        public productDesription: string;
        public productIngeridients: string;
    }
    export interface IMessageFromAdmin {
        public userMessageFromAdminId: number;
        public messageDateInPersian: string;
        public isRead: boolean;
        public dateOfreadInPersian: string;
        public userId: number;
    }
    export interface IAdminUser {
        adminId: number;
        level: number;
        userName: string;
        password: string;
    }
    export interface IResultOFRefreshUserSqlProcedure {
        id: number;
        firstName: string;
        lastName: string;
        shomarehMelli: string;
        tarikheTavallod: string;
        ostaneTavallod: string;
        mobileNumber: string;
        address: string;
        verified: boolean;
        profileImage: Buffer;
        sabetNumber: string;
        email: string;
        lastVisitInPersian: string;
        lastVisit: string;
        blocked: boolean;
        blockedDateInPersian: string;
        blockedReason: string;
        isProfileCompleted: boolean;
        dateOfCreationInPersian: string;
        lastIpAddress: string;
        transactionId: number;
        codeRahgiri: string;
        transactionDateInPersian: string;
        productId: number;
        boughtAmount: string;
        userId: number;
        verifierAdminId: number;
        status: string;
        optionalMoreInfo: string;
        userCommentAboutProduct: string;
        userScoreToProduct: number;
        userMessagesFromAdminId: number;
        messageDateInPersian: string;
        isRead: boolean;
        dateOfreadInPersian: string;
        numOfReservs: number;
        unReadMessages: number;
        readMessages: number;
    }

}