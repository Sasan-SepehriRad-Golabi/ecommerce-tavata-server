export class AdminUser {
    constructor(userName: string, password: string) {
        this.userName = userName;
        this.password = password;
    }
    adminId: number = 0;
    level: number = 0;
    userName: string;
    password: string;
}
