import { MessageFromAdmin } from "./MessageFromAdmin";
import { Transaction } from "./Transaction";
//in js we can use this. in constructor but not in other oop languages like typescript, c#,java,... .
export class User implements ModelsTypes.IUser {
    constructor(mobileNumber: any, ipaddress: any, logincode: any, logincodeok: any) {
        this.mobileNumber = mobileNumber;
        this.ipaddress = ipaddress;
        this.logincode = logincode;
        this.logincodeok = logincodeok;
    }
    logincodeok: any;
    logincode: any;
    id: number = 0;
    mobileNumber: string;
    shomarehMelli: string = "";
    tarikheTavallod: string = "";
    ostaneTavallod: string = '';
    ipaddress: string;
    isProfileCompleted: boolean = false;
    firstName: string = "";
    lastName: string = "";
    namePedar: string = "";
    email: string = "";
    address: string = "";
    lastVisitInPersian: string = "";
    profileImage: string = "";
    base64ProfileImage: string = "";
    imageUrl: string = "";
    sabetNumber: string = "";
    blocked: boolean = false;
    blockedDateInPersian: string = "";
    blockedReason: string = "";
    unreadedmessageNumbers: number = 0;
    readedmessageNumbers: number = 0;
    messages: (ModelsTypes.IMessageFromAdmin | undefined)[] = [];
    transactions: (ModelsTypes.ITransaction | undefined)[] = [];
    time: number = 0;
    reservedProductsNums: number = 0;
    buyedProductsNums: number = 0;
    ptr: any;
    userLoginCountDown = (time: number) => {
        this.time = time;
        clearInterval(this.ptr);
        this.ptr = setInterval(() => {
            this.time--;
            console.log(this.time);
            if (this.time <= 0) {
                clearInterval(this.ptr);
                this.logincodeok = false;
            }
        }, 1000);
    }
    exposeUserInfos = () => {
        return {
            uph: this.mobileNumber,
            un: this.firstName,
            ulastn: this.lastName,
            uaddr: this.address,
            ushm: this.shomarehMelli,
            ue: this.email,
            ushs: this.sabetNumber,
            uofi: this.profileImage,
            b6uofi: this.base64ProfileImage,
            uimu: this.imageUrl,
            ubl: this.blocked,
            utt: this.tarikheTavallod,
            uot: this.ostaneTavallod,
            uurm: this.unreadedmessageNumbers,
            urm: this.readedmessageNumbers,
            urep: this.reservedProductsNums,
            uc: this.isProfileCompleted
        }
    }
    createRealatedObjects = (objArray: ModelsTypes.IResultOFRefreshUserSqlProcedure[]) => {
        if (objArray && objArray.length > 0) {
            let userInfo = objArray;
            this.id = userInfo[0].id;
            this.blocked = userInfo[0].blocked;
            this.blockedReason = userInfo[0].blockedReason;
            this.mobileNumber = userInfo[0].mobileNumber;
            this.firstName = userInfo[0].firstName;
            this.ostaneTavallod = userInfo[0].ostaneTavallod;
            this.shomarehMelli = userInfo[0].shomarehMelli;
            this.ipaddress = userInfo[0].lastIpAddress;
            this.email = userInfo[0].email;
            this.lastName = userInfo[0].lastName;
            this.address = userInfo[0].address;
            this.isProfileCompleted = userInfo[0].isProfileCompleted;
            this.reservedProductsNums = userInfo[0].numOfReservs;
            this.profileImage = userInfo[0].profileImage ? userInfo[0].profileImage.toString("base64") : "";
            this.imageUrl = userInfo[0].profileImage ? userInfo[0].profileImage.toString() : "";
            this.base64ProfileImage = "data:image/jpeg;base64," + this.profileImage;
            // let allResultedTransactions = objArray.map((resultedObjext, index) => {
            //     return new Transaction(resultedObjext.transactionId, resultedObjext.codeRahgiri, resultedObjext.transactionDateInPersian, resultedObjext.productId, resultedObjext.boughtAmount,
            //         resultedObjext.userId, resultedObjext.verifierAdminId, resultedObjext.status, resultedObjext.optionalMoreInfo,
            //         resultedObjext.userCommentAboutProduct, resultedObjext.userScoreToProduct)
            // }
            // )
            // let allResultedTransactionsIds: number[] = allResultedTransactions.map((transaction, index) => transaction.transactionId);
            // let allUniqueResultedTransactionsIds: number[] = [];
            // for (let i = 0; i < allResultedTransactionsIds.length; i++) {
            //     if (allUniqueResultedTransactionsIds.length == 0 || !allUniqueResultedTransactionsIds.includes(allResultedTransactionsIds[i])) {
            //         allUniqueResultedTransactionsIds.push(allResultedTransactionsIds[i]);
            //     }
            //     else {
            //         continue;
            //     }
            // }
            // let allUniqueTransactions = allUniqueResultedTransactionsIds.map((transactionId, index) =>
            //     allResultedTransactions.find((transaction) => transaction.transactionId == transactionId));
            // this.transactions = allUniqueTransactions;

            // let allResultedMessages = objArray.map((resultedObjext, index) => {
            //     return new MessageFromAdmin(resultedObjext.userMessagesFromAdminId, resultedObjext.messageDateInPersian,
            //         resultedObjext.isRead, resultedObjext.dateOfreadInPersian, resultedObjext.id)
            // }
            // )
            // let allResultedMessagesIds: number[] = allResultedMessages.map((message, index) => message.userMessageFromAdminId);
            // let allUniqueResultedMessagesIds: number[] = [];
            // for (let i = 0; i < allResultedMessagesIds.length; i++) {
            //     if (allUniqueResultedMessagesIds.length == 0 || !allUniqueResultedMessagesIds.includes(allResultedMessagesIds[i])) {
            //         allUniqueResultedMessagesIds.push(allResultedMessagesIds[i]);
            //     }
            //     else {
            //         continue;
            //     }
            // }
            // let allUniqueMessages = allUniqueResultedMessagesIds.map((messageId, index) =>
            //     allResultedMessages.find((message) => message.userMessageFromAdminId == messageId));
            // this.messages = allUniqueMessages;
            // this.unreadedmessageNumbers = this.messages.filter((message, index) => !message?.isRead).length;
            // this.readedmessageNumbers = this.messages.filter((message, index) => message?.isRead).length;
            this.unreadedmessageNumbers = userInfo[0].unReadMessages;
            this.readedmessageNumbers = userInfo[0].readMessages;
        }
    }

}