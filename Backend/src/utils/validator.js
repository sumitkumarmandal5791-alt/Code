const validator = require("validator")
const validate = (data) => {
    const mandatoryFields = ["firstName", "emailId", "password"];

    const IsAllowed = mandatoryFields.every((k) => Object.keys(data).includes(k));

    if (!IsAllowed)
        throw new Error("All fields are mandatory");

    if (!validator.isEmail(data.emailId))
        throw new Error("Invalid emailId")

    if (!validator.isStrongPassword(data.password))
        throw new Error("Invalid Password come")
}
module.exports = {
    validate
}
