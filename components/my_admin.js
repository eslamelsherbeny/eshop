const jwt=require('jsonwebtoken');
const users=require('../models/authScheme');

const admin = async(reg,res,next)=>{

    try {

    const token=reg.header('Authorization');
    
    if(!token) return res.json({status:401,message:"not authorized user" });

    const verified = jwt.verify(token,"passwordKey");
  
     if(!verified ) {

        return res.json(
            {status:401,message:"token is not working ,not allowed"});
     }
          
     const user= await users.findById(verified.id);
     if(user.role=='user' ||user.role=='seller'  ) {
        return res.json(
            {status:401,message:"this user is not admin"});
     }
     reg.user=verified.id;
     reg.token=token;
     next();  
  
     } catch (e) {
        res.json({error: e.message});
     }
     
   
    
}

module.exports=admin;