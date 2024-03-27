export default {

    countdown: function (value: number) {
        const intervalId = setInterval(() => {
            value--;
            console.log(value);
            if (value <= 0) {
                clearInterval(intervalId);
                return "f";
            }
        }, 1000)
    },
    loginCountDownTime: 50,
    createRepositories: (objArray: [{ mobileNumber: string, sabetNumber: string, firstName: string, lastName: string, address: string, profileImage: string }]) => {
        let userPersonalInfos = {}
        if (objArray && objArray.length > 0) {
            let userInfo = objArray;
            userPersonalInfos = {
                mobileNumber: userInfo[0].mobileNumber,
                sabetNumber: userInfo[0].sabetNumber,
                firstName: userInfo[0].firstName,
                lastName: userInfo[0].lastName,
                address: userInfo[0].address,
                profileImage: userInfo[0].profileImage

            }
        }
    }
}