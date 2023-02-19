const User = require('../models/User');
const session = require('../session');
const authController = {};
const nodemailer = require("nodemailer");
const crypto = require('crypto');

authController.register  = async (req, res) => {
  const { email, password } = req.body;
  // create a salt and hash password and create user with the hashed password
  const salt = crypto.randomBytes(16).toString('hex');
  const hashedPassword = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  const user = new User({ email, password: hashedPassword, salt });

  try {
    await user.save();
    console.log('User registered successfully');
    res.json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Registration error', error);
    res.status(500).json({ message: 'Server error' });
  }
};

authController.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
// retrieve the stored hashed password and salt from the database
    const hashedPassword = user.password; 
    const salt = user.salt; 
    const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    const passwordMatch = hash === hashedPassword;

    if (!passwordMatch) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid password' });
    }

    // Generate OTP and send to user's email
    const otp = Math.floor(100000 + Math.random() * 900000);
    try {
      async function main() {
        let testAccount = await nodemailer.createTestAccount();
        let transporter = nodemailer.createTransport({
          host: "smtp.ethereal.email",
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
            user: testAccount.user, // generated ethereal user
            pass: testAccount.pass, // generated ethereal password
          },
        });
      
        let info = await transporter.sendMail({
          from: '"testapis" <testapis@example.com>', // sender address
          to: email, // list of receivers
         subject :'Login OTP for your account',
         text : `Your login OTP is ${otp}. This OTP will expire in 10 minutes.`
        });
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      }
      
      main().catch(console.error);
      req.session.email = email;
      req.session.otp = otp;
    // Set session cookie
    session.createSession(req, user._id);
    res.json({ message: `Login successful ,OTP sent to ${email}` });
    } catch (err) {
    console.error(err);
    res.status(500).json({ message: `Error sending OTP to ${email}:` });}
   
  } 
  catch(err){
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
   
  }    
authController.logout = async (req, res, next) => {
  try {
    // Check if user is logged in,if yes then destroy cookie
    session.checkSession(req, res, () => {
      session.destroySession(req, req.session.userId);
      res.json({ message: 'Logout successful' });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = authController;
