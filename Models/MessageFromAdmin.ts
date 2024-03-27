export class MessageFromAdmin implements ModelsTypes.IMessageFromAdmin {
    constructor(public userMessageFromAdminId: number,
        public messageDateInPersian: string, public isRead: boolean,
        public dateOfreadInPersian: string, public userId: number) { }
}