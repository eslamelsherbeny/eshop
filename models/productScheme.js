const mongoose=require('mongoose');
const ratingScheme=require('./ratingScheme');

 productScheme=mongoose.Schema({

productName:{
    type:String,
    required:true,
    trim:true
 

},

description:{
    type:String,
    required:true,
    trim:true
},

price:{
    type:Number,
    required:true,
},

discount:{
    type:Number,
    required:true,
},
quantity:{
    type:Number,
    required:true,
    trim:true
},
category:{
    type:String,
    required:true,
    trim:true
},
images:[

{
    type:String,
    required:true
}
],

rating:[ratingScheme],



});
const Products=mongoose.model('product',productScheme);
module.exports={Products,productScheme};

