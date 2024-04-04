const express = require('express');
const productRouter=express.Router();
const {Products}=require('../models/productScheme');
const myAuth=require('../components/myauth');


productRouter.get('/product',myAuth,async(reg,res)=>{

    try{
    
    const products=await Products.find({category:reg.query.category});
    res.json({status:0,message:"get succefully",products});
    }catch(e){

     res.json({error: e.message});

    }
    
    });
    productRouter.get('/product/search/:txt',myAuth,async(reg,res)=>{

        try{
        
            const products = await Products.find({
                productName: { $regex: reg.params.txt, $options: 'i' },
              });
        res.json({status:0,message:"get succefully",products});
        }catch(e){
    
         res.json({error: e.message});
    
        }
        
        });
       
    productRouter.post('/product-rating',myAuth,async(reg,res)=>{

        try{

        const {id,rating}=reg.body
        let product= await Products.findById(id);
        for(let i=0; i<product.rating.length ;i++){
            if(product.rating[i].userId == reg.user){
                product.rating.splice(i,1);
           break;
            }};
            const ratingScheme={
                userId:reg.user,
                rating:rating}
            
            product.rating.push(ratingScheme);
            product=await product.save();
            res.json({status:0,message:"rate added succefuly",product});
        
       
        }catch(e){
    
         res.json({error: e.message});
    
        }
        
        });

      
            productRouter.get('/product/deal-of-the-day', myAuth, async (req, res) => {
                try {
                  let product = await Products.find({});
              
                  product = product.sort((a, b) => {
                    let sSum = 0; 
                    let bSum = 0;
              
                    for (let i = 0; i < a.rating.length; i++) {
                      sSum += a.rating[i].rating;
                    }
              
                    for (let i = 0; i < b.rating.length; i++) {
                      bSum += b.rating[i].rating;
                    }
              
                    return bSum - sSum;
                  });
                  const  products = product.slice(0, 3);
                  res.json({status:0,message:"get succefully",products});
                } catch (e) {
                  res.json({error: e.message});
                }
              });

    module.exports=productRouter;