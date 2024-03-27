export class ProductCategory implements ModelsTypes.IProductCategory {
    constructor(public productCategoryId: number,
        public categoryName: string,
        public optionalOtherInfos: string,
        public numberOfProductsInCategory: number,
        public numberOfSoldProductsOfThisCategory: number,
        public amountOfMoneySoldFromThisProduct: number) { }
}