const express = require('express');

const router = express.Router();
const mongoose = require('mongoose');
const User = mongoose.model("User");
const jwt = require('jsonwebtoken');
// 
require('dotenv').config();
// 
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");


// nodemailer
async function mailer(recieveremail, code) {


    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,

        secure: false, // true for 465, false for other ports
        requireTLS: true,
        auth: {
            user: "mohinidave678@gmail.com", // generated ethereal user
            pass: "qtyxwpdazjahpijw", // generated ethereal password

        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'Tripplanner App ', // sender address
        to: `${recieveremail}`, // list of receivers
        subject: "Signup Verification", // Subject line
        text: `Your Verification Code is ${code}`, // plain text body
        html: `<b>Your Verification Code is ${code}</b>`, // html body
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

}
async function mailer1(recieveremail, code) {


    let transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,

        secure: false, // true for 465, false for other ports
        requireTLS: true,
        auth: {
            user: "mohinidave678@gmail.com", // generated ethereal user
            pass: "qtyxwpdazjahpijw", // generated ethereal password

        },
    });

    // send mail with defined transport object
    let info = await transporter.sendMail({
        from: 'Tripplanner App ', // sender address
        to: `${recieveremail}`, // list of receivers
        subject: "Reset password code ", // Subject line
        text: `Your Code is ${code}`, // plain text body
        html: `<b>Your  Code is ${code}</b>`, // html body
    });

    console.log("Message sent: %s", info.messageId);

    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));

}

//

router.post('/signup', async (req, res) => {
    console.log('sent by client - ', req.body);
    const { name, email, password, city, address } = req.body;



    const user = new User({
        name,
        email,
        password,
        city,
        address
    })
    
            try {
                await user.save();
                const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET);
                res.send({ message: "User Registered Successfully", token });
            }
            catch (err) {
                console.log(err);
            }

        });



router.post('/verify', (req, res) => {
    console.log('sent by client - ', req.body);
    const { name, email, password, city } = req.body;
    console.log(req.body)
    if (!name || !email || !password || !city) {
        return res.status(422).json({ error: "Please add all the fields" });
    }


    User.findOne({ email: email })
        .then(async (savedUser) => {
            if (savedUser) {
                return res.status(422).json({ error: "Invalid Credentials" });
            }
            try {

                let VerificationCode = Math.floor(100000 + Math.random() * 900000);
                let user = [
                    {
                        name,
                        email,
                        password,
                        city,
                        VerificationCode
                    }
                ]
                await mailer(email, VerificationCode);
                res.send({ message: "Verification Code Sent to your Email", udata: user });
            }
            catch (err) {
                console.log(err);
            }
        })


})
 router.post("/changeUserPassword" ,async (req, res) => {
    const { email, newpassword } = req.body
    console.log(req.body)
    if (newpassword && confirmnewpassword) {
      if (newpassword !== confirmnewpassword) {
        res.send({ "status": "failed", "message": "New Password and Confirm New Password doesn't match" })
      } else {
        const salt = await bcrypt.genSalt(10)
        const newHashPassword = await bcrypt.hash(password, salt)
        await User.findByIdAndUpdate({email:email}, { $set: { password: newHashPassword } })
        res.send({ "status": "success", "message": "Password changed succesfully" })
      }
    } else {
      res.send({ "status": "failed", "message": "All Fields are Required" })
    }
  });
router.post('/passwordemailverify', (req, res) => {
    
    const { email } = req.body;
    if (!email) {
        return res.status(422).json({ error: "Please add all the fields" });
    }


    User.findOne({ email: email })
        .then(async (savedUser) => {
            if (!savedUser) {
                return res.status(422).json({ error: "Invalid Credentials" });
            }
            try {

                let VerificationCode = Math.floor(100000 + Math.random() * 900000);
                let user = [
                    {
                        email,
                        VerificationCode

                    }
                ]
                await mailer1(email, VerificationCode);
                res.send({ message: "Verification Code Sent to your Email", udata: user });
            }
            catch (err) {
                console.log(err);
            }
        })


})

router.post('/resetpassword', async (req, res) => {
    const { fdata: { email, password } } = req.body;
    console.log(req.body);
    
    if (!email || !password) {
      return res.status(422).json({ error: "Please provide email and password" });
    }
    
    try {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      
      await User.findOneAndUpdate({ email: email }, { password: hashedPassword });
      
      res.send({ message: "Password reset successful" });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Failed to reset password" });
    }
  });
  
  




router.post('/signin', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ error: "Please add email or password" });
    }
    const savedUser = await User.findOne({ email: email })

    if (!savedUser) {
        return res.status(422).json({ error: "Invalid Credentials" });
    }

    try {
        bcrypt.compare(password, savedUser.password, (err, result) => {
            if (result) {
                console.log("Password matched");
                const token = jwt.sign({ _id: savedUser._id }, process.env.JWT_SECRET);
                res.send({ token });
            }
            else {
                console.log('Password does not match');
                return res.status(422).json({ error: "Invalid Credentials" });
            }
        })
    }
    catch (err) {
        console.log(err);
    }
});



module.exports = router;