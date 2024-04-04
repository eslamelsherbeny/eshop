const mongoose=require('mongoose');

const ratingScheme=mongoose.Schema({
userId:{
    type:String,
    required:true,
},
rating:{
    type:Number,
    required:true,
}

});



module.exports=ratingScheme;