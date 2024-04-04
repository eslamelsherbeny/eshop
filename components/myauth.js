const jwt=require('jsonwebtoken');


const myAuth = async(reg,res,next)=>{

    try {
        const token=reg.header('Authorization');
    
    if(!token) return res.json({status:401,message:"not authorized user" });

    const verified = jwt.verify(token,"passwordKey");
  
     if(!verified ) {
        return res.json(
            {status:401,message:"token is not working ,not allowed"});
     }

     reg.user=verified.id;
     reg.token=token;
     next();  
  
     } catch (e) {
        res.json({error: e.message});
     }

    
}

module.exports=myAuth;