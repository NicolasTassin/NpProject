const {check} = require('express-validator')




exports.userSignupValidator = [
    check('name')
        .not()
        .isEmpty()
        .withMessage('Name is required'),
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Must be a valid Email adress!'),
    check('password')
        .isLength({min:6})
        .withMessage('Password must be at least 6 character long')
];

exports.userSigninValidator = [
    check('email')
        .not()
        .isEmpty()
        .isEmail()
        .withMessage('Must be a valid Email adress!'),
    check('password')
        .isLength({min:6})
        .withMessage('Password must be at least 6 character long')
]