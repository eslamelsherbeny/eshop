const express= require('express');
const app=express();
const bodyParser=require('body-parser');
const mongoose = require('mongoose');
const authRouter= require('./routes/auth');
const adminRouter= require('./routes/admin');
const productRouter= require('./routes/product');
const userRouter= require('./routes/user');
require('dotenv').config()



app.use(bodyParser.json());
app.use('/api',authRouter);
app.use('/api',adminRouter);
app.use('/api',productRouter);
app.use('/api',userRouter);

mongoose.connect(process.env.DB_KEY).then(()=>{
    console.log('connected');  
     app.listen(process.env.PORT||9000,()=>{
    console.log('done');
    });
}).catch((error)=>{console.log(error)})
    



