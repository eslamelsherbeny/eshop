const express = require('express');
const adminRouter=express.Router();
const {Products}=require('../models/productScheme');
const admin=require('../components/my_admin');
const Order=require('../models/order');
const users=require('../models/authScheme');


adminRouter.post('/admin/addProduct',admin,async(reg,res)=>{

try{

const{productName,description,price,discount,quantity,images,category}=reg.body;

let product=new Products({productName,description,price,discount,quantity,images,category});
product= await product.save();
res.json({status:0,message:"product added succefully",...product._doc,});
}catch(e){
 res.json({error: e.message});
}

});

adminRouter.get('/admin',admin,async(reg,res)=>{

    try{
    
    const products=await Products.find({});
    res.json({status:0,message:"get succefully",products});
    
    
    res.json();
    }catch(e){
     res.json({error: e.message});
    }
    
    });
    adminRouter.post('/admin/deleteProduct',admin,async(reg,res)=>{
        try{
            const {_id}= reg.body;
       let product=await Products.findByIdAndDelete(_id);
        res.json({status:0,message:"deleted",product});
        }catch(e){
         res.json({error: e.message});
        }
        });
        
        adminRouter.post('/admin/update-status',admin,async(reg,res)=>{
            try{
                const {id,status}= reg.body;
           let order=await Order.findById(id);
           order.status=status;
           order=await order.save();
          
            res.json({status:0,message:"status updated",order});
            }catch(e){
             res.json({error: e.message});
            }
            });
            
  adminRouter.get('/admin/orders',admin,async(reg,res)=>{

    try{
    
    const orders=await Order.find({});
    res.json({status:0,message:"get succefully",orders});

    }catch(e){
     res.json({error: e.message});
    }
    
    });

    adminRouter.get('/',admin,async(reg,res)=>{

        const user= await users.findById(reg.user);
        const token=reg.token;
        res.json({status:0,message:"user Cart",...user._doc,token:token});
          
          });
          
          adminRouter.post('/admin/updateProduct', admin, async (req, res) => {
            try {
                const { _id, productName, description, price, discount, quantity, images, category } = req.body;
        
                let product = await Products.findById(_id);
        
                if (!product) {
                    return res.status(404).json({ error: "Product not found" });
                }
        
                product.productName = productName;
                product.description = description;
                product.price = price;
                product.discount = discount;
                product.quantity = quantity;
                product.images = images;
                product.category = category;
        
            
                product = await product.save();
        
                res.json({ status: 0, message: "Product updated successfully", product });
            } catch (e) {
                res.json({ error: e.message });
            }
        });
        

  adminRouter.get('/admin/analytics', admin, async (req, res) => {
    try {
        const orders = await Order.find({});
        let totalSales = 0;

        for (let i = 0; i < orders.length; i++) {
            for (let j = 0; j < orders[i].products.length; j++) {
              totalSales += orders[i].products[j].product.price * orders[i].products[j].qty;
            }
        }
      
        const totalorder = orders.length;

        const totalproduct = await Products.find({}).countDocuments();

        let catMobiles = await getCategoryTotalSale('mobile');
        let catAppliance = await getCategoryTotalSale('Appliance');
        let catFashion = await getCategoryTotalSale('fashion');
        let catEssential = await getCategoryTotalSale('Essential');
        let catComputer = await getCategoryTotalSale('Computer');
        let catBook = await getCategoryTotalSale('Book');

        let total = {
          totalSales,
            totalorder,
            totalproduct,
            catMobiles,
            catAppliance,
            catFashion,
            catEssential,
            catComputer,
            catBook
        };

        res.json({ status: 0, message: "analytical data", total });
    } catch (e) {
        res.json({ error: e.message });
    }
});

async function getCategoryTotalSale(category) {
    const orders = await Order.find({ 'products.product.category': category });
    let totalSales = 0;
    for (let i = 0; i < orders.length; i++) {
        for (let j = 0; j < orders[i].products.length; j++) {
            totalSales += orders[i].products[j].product.price * orders[i].products[j].qty;
        }
    }
    return totalSales;
}

module.exports=adminRouter;