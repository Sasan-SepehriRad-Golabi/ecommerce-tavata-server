export class Product implements ModelsTypes.IProduct {
    constructor(public productId: number,
        public productName: string,
        public productDesription: string,
        public productIngeridients: string) { }
}