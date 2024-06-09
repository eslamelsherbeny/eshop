const express = require('express');
const authRouter=express.Router();
const users=require('../models/authScheme');
const myAuth=require('../components/myauth');
const bcrypt=require('bcryptjs');
const jwt=require('jsonwebtoken');
const UserOtpVerification=require('../models/userOtpVerication');
const nodemailer = require('nodemailer');
require('dotenv').config();



let transporter=nodemailer.createTransport({
service:"gmail",
auth:{
   user:process.env.AUTH_EMAIL,
   pass:process.env.AUTH_PASS
}
});


authRouter.post('/signup', async (req, res) => {
   try {
       const { user_name, country_mobile_code, mobile_number, email, password, profile_picture, role } = req.body;

       const existingUser = await users.findOne({ email });

       if (existingUser) {
           return res.json({ status: -1, message: "Email already exists" });
       }

       const hPassword = await bcrypt.hash(password, 8);
       let user = new users({ user_name, country_mobile_code, mobile_number, email, password: hPassword, profile_picture, role });
       user.save(); 
       
        res.json({    
       status:0,
       id:user._id,
       message:"user registered succefuly",
      user_name:user_name
       ,country_mobile_code:country_mobile_code
       ,mobile_number:mobile_number
      ,email:email
       ,password:hPassword
         ,profile_picture:profile_picture,
      role:role

        });
    //    res.json({ status: 0, message: "User registered successfully" });

   } catch (e) {
       res.status(500).json({ error: e.message });
   }
});


authRouter.post('/signin', async (req, res) => {
    try {
        const { email, password } = req.body;

        const client = await users.findOne({ email });

        if (!client) {
            return res.json({ message: "User does not exist!" });
        }

        const isMatch = await bcrypt.compare(password, client.password);

        if (!isMatch) {
            return res.json({ message: "Password is incorrect!" });
        }

        if (!client.verified) {
           
            sendOtpEmail({ _id: client._id, email: client.email }, res);
            return;
        }

        const token = jwt.sign({ id: client._id }, "passwordKey");

        res.json({ status: 0, message: "User logged in successfully", token: token, ...client._doc });

    } catch (e) {
        res.json({ error: e.message });
    }
});




  authRouter.post('/isverified',async(reg,res)=>{

   try {
      const token=reg.header('Authorization');
  
  if(!token) return res.json(false);
  const verified = jwt.verify(token,"passwordKey");

   if(!verified ) {return res.json(false)} else {
     const user= await users.findById(verified.id);
     if(!user){return res.json(false)}else{
      return  res.json(true);
     }
   }

   } catch (e) {
      res.json({error: e.message});
   }
  });


  authRouter.get('/',myAuth,async(reg,res)=>{

const user= await users.findById(reg.user);
const token=reg.token;
res.json({status:0,message:"user Cart",...user._doc,token:token});
  
  });
 

authRouter.post('/update/phone',myAuth, async (req, res) => {
    try {
        const { userId, phone } = req.body;
        const user = await users.findById(userId);

        if (!user) {
            return res.json({ message: "User not found" });
        }

        user.mobile_number = phone;
        await user.save();
      
        return res.json({ status: 0, message: "phone updated successfully", user });
    } catch (error) {
       
        return res.status(500).json({ error: error.message });
    }
});


authRouter.post('/update/address',myAuth, async (req, res) => {
    try {
        const { userId, address } = req.body;
        const user = await users.findById(userId);

        if (!user) {
            return res.json({ message: "User not found" });
        }

        user.address = address;
        await user.save();
      
        return res.json({ status: 0, message: "address updated successfully", user });
    } catch (error) {
       
        return res.status(500).json({ error: error.message });
    }
});



authRouter.post('/update/userName',myAuth, async (req, res) => {
    try {
        const { userId, userName } = req.body;
        const user = await users.findById(userId);

        if (!user) {
            return res.json({ message: "User not found" });
        }

        user.user_name = userName;
        await user.save();
      
        return res.json({ status: 0, message: "userName updated successfully", user });
    } catch (error) {
       
        return res.status(500).json({ error: error.message });
    }
});

authRouter.post('/update/password', async (req, res) => {
    try {
        const { userId, oldPassword, newPassword } = req.body;
        const user = await users.findById(userId);

        if (!user) {
            return res.json({ message: "User not found" });
        }
        const isOldPasswordValid = await bcrypt.compare(oldPassword, user.password);

        if (!isOldPasswordValid) {
            return res.json({ message: "Old password is incorrect" });
        }
        const hashedNewPassword = await bcrypt.hash(newPassword, 8);  
        user.password = hashedNewPassword;
        await user.save();
        return res.json({ status: 0, message: "User password updated successfully" });
    } catch (error) {
       
        return res.status(500).json({ error: error.message });
    }
});

authRouter.post('/update/email', myAuth, async (req, res) => {
    try {
        const { userId, email } = req.body;
        const user = await users.findById(userId);

        if (!user) {
            return res.json({ message: "User not found" });
        }
        const existedEmail = await users.findOne({ email });
        if (existedEmail ) {
           
            return res.json({ message: "Email already exists" });
        }
       
        sendVerifiedOtp({ _id: userId, email: email }, res);

        

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
});


authRouter.post('/verifyotpforemail', async (req, res) => {
    try {
        const { otp, userId,email } = req.body;

        if (!otp || !userId) {
            return res.json({ message: "Empty OTP details are not allowed" });
        }

        const userOtpRecord = await UserOtpVerification.findOne({ userId });

        if (!userOtpRecord) {
            return res.json({ message: "OTP record not found!" });
        }

        const { expiresAt, otp: hashedOtp } = userOtpRecord;

        if (expiresAt < Date.now()) {
            await UserOtpVerification.deleteMany({ userId });
            return res.json({ message: "OTP has expired. Please request again" });
        }

        const isValidOtp = await bcrypt.compare(otp, hashedOtp);

        if (!isValidOtp) {
            return res.json({ message: "Invalid OTP. Check your inbox" });
        }

        await users.updateOne({ _id: userId }, { verified: true ,email:email});
        await UserOtpVerification.deleteMany({ userId });

        return res.json({ status: 0, message: "User email updated successfully" });
    } catch (error) {
        return res.json({ error: error.message });
    }
});

  

  authRouter.post('/verifyotp', async (req, res) => {
    try {
        const { otp, userId } = req.body;

        if (!otp || !userId) {
            return res.json({ message: "Empty OTP details are not allowed" });
        }

        const userOtpRecord = await  UserOtpVerification.findOne({ userId });

        if (!userOtpRecord) {
            return res.json({ message: "OTP record not found!" });
        }

        const { expiresAt, otp: hashedOtp } = userOtpRecord;
       
        const currentTimeMillis = Date.now();
        const expiresAtMillis = new Date(expiresAt).getTime();
    
        if (expiresAtMillis < currentTimeMillis) {
            return res.json({ message: "OTP has expired!" });
        }

        const isValidOtp = await bcrypt.compare(otp, hashedOtp);

        if (!isValidOtp) {
            return res.json({ message: "Invalid OTP!" });
        }
         
        await users.updateOne({ _id: userId }, { verified: true });

          await UserOtpVerification.deleteMany({ userId });
        return res.json({ status: 0, message: "User email verified successfully" });
    } catch (error) {
        return res.json({ error: error.message });
    }
});





  authRouter.post('/resendotp',async(reg,res)=>{
    try{

    let{userId,email}=reg.body;

    if( !email || !userId){
        return res.json({message:"Empty user detail are not allowed"});
        }else{
            await UserOtpVerification.deleteMany({userId});
            sendOtpVerificationEmail({_id:userId,email},res);

            }
    

    }catch(e){ res.json({error: e.message});}
  });

 
  authRouter.post('/forgetpassword', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await users.findOne({ email });

        if (!user) {
            return res.json({ message: "User not found" });
        } else {
            
            sendOtpVerificationEmail({ _id: user._id, email }, res);
        }
    } catch (e) {
        console.error("Error in forgetpassword endpoint:", e);
        res.json({ error: e.message });
    }
});

authRouter.post('/confirmotp', async (req, res) => {
    try {
        const { otp, userId } = req.body;

        if (!otp || !userId) {
            return res.json({ message: "Empty OTP details are not allowed" });
        }

        const userOtpRecord = await  UserOtpVerification.findOne({ userId });

        if (!userOtpRecord) {
            return res.json({ message: "OTP record not found!" });
        }

        const { expiresAt, otp: hashedOtp } = userOtpRecord;
       
        const currentTimeMillis = Date.now();
        const expiresAtMillis = new Date(expiresAt).getTime();
    
        if (expiresAtMillis < currentTimeMillis) {
            return res.json({ message: "OTP has expired!" });
        }

        const isValidOtp = await bcrypt.compare(otp, hashedOtp);

        if (!isValidOtp) {
            return res.json({ message: "Invalid OTP!" });
        }

        return res.json({ status: 0, message: "OTP verified successfully", userId });
    } catch (error) {
        return res.json({ error: error.message });
    }
});




authRouter.post('/resetpassword', async (req, res) => {
try{

    const { newPassword, userId } = req.body;
    const hashedPassword=await bcrypt.hash(newPassword,10);
    await users.findByIdAndUpdate(userId, { password: hashedPassword });
    await UserOtpVerification.deleteMany({userId});

    res.json({ status: 0, message: "Password reset successfully" });


}catch(e){
    res.status(500).json({ error: error.message });
}

});


const sendOtpVerificationEmail = async ({ _id, email }, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        console.log(otp);

        const mailOption = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify your email",
            html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the signup process</p>
                   <p>This code <b>expires in 5 minutes</b></p>`
        };

        const saltRounds = 10;
        const hashOtp = await bcrypt.hash(otp, saltRounds);
        const expiresAt = new Date(Date.now() + 300000); // 5 minutes from now
        await UserOtpVerification.deleteMany({ userId: _id });
        const newOtpVerification = new UserOtpVerification({
            userId: _id,
            otp: hashOtp,
            email: email,
            createdAt: new Date(),
            expiresAt: expiresAt
        });



        await newOtpVerification.save();
        await transporter.sendMail(mailOption);

        res.json({ status: 0, message: "A verification code has been sent to your email to reset your password", id: _id, email });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

const sendOtpEmail = async ({ _id, email }, res) => {
    try {
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        console.log(otp);

        const mailOption = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "Verify your email",
            html: `<p>Enter <b>${otp}</b> in the app to verify your email address and complete the signup process</p>
                   <p>This code <b>expires in 5 minutes</b></p>`
        };

        const saltRounds = 10;
        const hashOtp = await bcrypt.hash(otp, saltRounds);
        const expiresAt = new Date(Date.now() + 300000); // 5 minutes from now
        await UserOtpVerification.deleteMany({ userId: _id });
        const newOtpVerification = new UserOtpVerification({
            userId: _id,
            otp: hashOtp,
            email: email,
            createdAt: new Date(),
            expiresAt: expiresAt
        });



        await newOtpVerification.save();
        await transporter.sendMail(mailOption);

        res.json({  message: "your email is not verified!,an otp code sent to you, Please verify your email to log in", id: _id, email });
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

 
 const sendVerifiedOtp = async ({ _id, email }, res) => {
    try {

        
        const otp = `${Math.floor(1000 + Math.random() * 9000)}`;
        console.log(otp);

        const mailOption = {
            from: process.env.AUTH_EMAIL,
            to: email,
            subject: "update your email",
            html: `<p>Enter <b>${otp}</b> in the app to update your email address and complete the update process</p> 
                  <p>This code <b>expires in 5 minutes</b></p>`
        };

        const saltRounds = 10;
        const hashOtp = await bcrypt.hash(otp, saltRounds);
        const expiresAt = new Date(Date.now() + 300000); // 5 minutes from now
        await UserOtpVerification.deleteMany({ userId: _id });
        const newOtpVerification = new UserOtpVerification({
            userId: _id,
            otp: hashOtp,
            email: email,
            createdAt: new Date(),
            expiresAt: expiresAt
        });
        await newOtpVerification.save();
        await transporter.sendMail(mailOption);

        res.json({status: 0, message: "an otp code sent to you, Please verify your email to complete update process.",id: _id, email });

    } catch (e) {
        res.status(500).json({ error: e.message });
    }
};

module.exports=authRouter;

