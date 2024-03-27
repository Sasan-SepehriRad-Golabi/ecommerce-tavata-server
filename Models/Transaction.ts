export class Transaction implements ModelsTypes.ITransaction {
    constructor(public transactionId: number,
        public codeRahgiri: string,
        public transactionDateInPersian: string,
        public productId: number,
        public boughtAmount: string,
        public userId: number,
        public verifierAdminId: number,
        public status: string,
        public optionalMoreInfo: string,
        public userCommentAboutProduct: string,
        public userScoreToProduct: number) { }
}