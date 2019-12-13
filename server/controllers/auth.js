const User = require('../models/user')
const jwt = require('jsonwebtoken')
const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

// exports.signup = (req,res) =>{
//    // console.log('REQ BODY ON SIGNUP', req.body)
//     const {name, email, password} = req.body 

//     User.findOne({email: email}).exec((err, user) =>{
//         if(user) {
//             return res.status(400).json({
//                 error : 'Email is taken'
//             })
//         }
//     })
//     let newUser = new User ({name,email,password})

//     newUser.save((err, success) =>{
//         if (err) {
//             console.log('Signup error', err )
//             return res.status(400).json({
//                 error : err
//             })
//         }
//         res.json({
//             message: 'Signup success ! Please Signin'
//         })
//     })
// }

exports.signup = (req, res) => {
    const { name, email, password } = req.body

    User.findOne({ email: email }).exec((err, user) => {
        if (user) {
            return res.status(400).json({
                error: 'Cet Email est déjà pris'
            })
        }

        const token = jwt.sign({ name, email, password }, process.env.JWT_ACCOUNT_ACTIVATION, { expiresIn: '10m' })

        const emailData = {
            from: process.env.EMAIL_FROM,
            to: email,
            subject: `Account activation link`,
            html: `
                     <h1>Please use the following link to activate your account</h1>
                     <p>${process.env.CLIENT_URL}/auth/activate/${token}</p>
                     <hr />
                     <p>This email may contain sensitive informations</p>
                     <p>${process.env.CLIENT_URL}</p>
                     `

        }
        sgMail.send(emailData).then(sent => {
            //console.log('SIGNUP EMAIL SENT', sent)
            return res.json({
                message: `Un Email à bien été envoyé à l'adresse :  ${email}. Suivez les instructions pour activer votre compte! `
            })
        })
            .catch(err => {
                //console.log('SIGNUP EMAIL SENT ERROR, err)
                return res.json({
                    message: err.message
                })
            })
    })
}
exports.accountActivation = (req, res) => {
    const { token } = req.body

    if (token) {
        jwt.verify(token, process.env.JWT_ACCOUNT_ACTIVATION, function (err, decoded) {
            if (err) {
                console.log('JWT VERIFY IN ACTIVATION ERROR', err)
                return res.status(401).json({
                    error: "Dommage, c'est trop tard! Il faut se réinscrire... Courage!"
                })
            }
            const { name, email, password } = jwt.decode(token)

            const user = new User({ name, email, password })

            user.save((err, user) => {
                if (err) {
                    console.log('SAVE USER IN ACCOUNT ACTIVATION ERROR', err)
                    return res.status(401).json({
                        error: 'Error saving user in database. Try signup again'
                    })
                }
                return res.json({
                    message: 'Signup success, please signin'
                });

            });
        });
    } else {
        return res.json({
            message: "OOOOpppps Quelque chose n'a pas fonctionné. Réessayez... n'abandonnez jamais!"
        })
    }
};

exports.signin = (req, res) => {
    const { email, password } = req.body
    //Verifie si le user existe
    User.findOne({ email }).exec((err, user) => {
        if (err || !user) {
            return res.status(400).json({
                error: 'Tu n\'existe pas ici!!. Inscris toi!'
            })
        }
        //authentification
        if (!user.authenticate(password)) {
            return res.status(400).json({
                error: 'Email...Utilisateur... Ca match pas vraiment'
            })
        }
        //generer un token et envoyer coté client
        const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' })
        const { _id, name, email, role } = user

        return res.json({
            token,
            user: { _id, name, email, role }
        })
    });
};