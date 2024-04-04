const mongoose=require('mongoose');
const express = require('express');
const Schema=mongoose.Schema;


const UserOtbVericationScheme=new Schema({
userId:String,
otp:String,
createdAt:Date,
expiresAt:Date

});
const UserOtbVerication=mongoose.model('UserOtbVericationScheme',UserOtbVericationScheme);
module.exports=UserOtbVerication;

