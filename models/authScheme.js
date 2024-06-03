const mongoose=require('mongoose');
const {productScheme}=require('./productScheme');

const user=mongoose.Schema({
user_name:{
    type:String,
    required:true,
},
country_mobile_code:{
    type:String,
    
},
mobile_number:{
    type:String,
    required:true,
},
email:{
    type:String,
    required:true,
    trim:true
},
password:{
    type:String,
    required:true,
},
profile_picture:{
    type:String,
},
role:{
    type:String,
    default:'user'
},
address: {
    defult: '',
    type: String,
    trim: true
}, 
cart:[
    {
        product:productScheme,
        qty:{
            type:Number,
            required:true
        }
    }
],
favorite:[
    {
        product:productScheme,
      
    }
],
verified:{

    defult: false,
    type: Boolean,
 
}



});
module.exports=mongoose.model('authintication',user);

