const express = require('express');
const userRouter=express.Router();
const myAuth=require('../components/myauth');
const Users=require('../models/authScheme');
const {Products}=require('../models/productScheme');
const Order=require('../models/order');



   
userRouter.post('/add-to-cart', myAuth, async (reg, res) => {
    try {
      const { id, qty } = reg.body;
      const product = await Products.findById(id);
      let user = await Users.findById(reg.user);
      
      if (user.cart.length === 0) {
        const cartScheme = {
          product,
          qty: qty
        };
        user.cart.push(cartScheme);
      } else {
        let isFound = false;
        for (let i = 0; i < user.cart.length; i++) {
          if (user.cart[i].product._id.equals(id)) {
            user.cart[i].qty += Number(qty);
            isFound = true;
            break;
          }
        }
        if (!isFound) {
          const cartScheme = {
            product,
            qty: qty
          };
          user.cart.push(cartScheme);
        }
      }
      
      user = await user.save();
      res.status(200).json({ status: 0, message: "Get successfully", user });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  userRouter.delete('/remove-from-cart/:id', myAuth, async (reg, res) => {
    try {
      const  id = reg.params.id;
      
      let user = await Users.findById(reg.user);
    
        for (let i = 0; i < user.cart.length; i++) {
          if (user.cart[i].product._id.equals(id)) {
            if(user.cart[i].qty>1){
              user.cart[i].qty -= 1;
            }else{
              user.cart.splice(i,1);
            }
            
            
            break;
          }
        }

      
      user = await user.save();
      res.status(200).json({ status: 0, message: "Get successfully", user });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  userRouter.delete('/remove-cart-item/:id', myAuth, async (reg, res) => {
    try {
      const  id = reg.params.id;
      
      let user = await Users.findById(reg.user);
    
        for (let i = 0; i < user.cart.length; i++) {
          if (user.cart[i].product._id.equals(id)) {
            
           
              user.cart.splice(i,1);

            
            break;
          }
        }

      user = await user.save();
      res.status(200).json({ status: 0, message: "Get successfully", user });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });



  userRouter.post('/save-user-address', myAuth, async (reg, res) => {
    try {
      const { address} = reg.body;
      let user = await Users.findById(reg.user);
      user.address=address;
      user = await user.save();
      res.status(200).json({ status: 0, message: "Added successfully", user });
    } catch (e) {
      res.status(500).json({ error: e.message });
    }
  });
  userRouter.post('/orders', myAuth, async (req, res) => {
    try {
        const { address, cart, totalPrice, paymentMethod } = req.body;
        let products = [];
        for (let i = 0; i < cart.length; i++) {
            let product = await Products.findById(cart[i].product._id);
            if (product.quantity >= cart[i].qty) {
                product.quantity -= cart[i].qty;
                products.push({ product, qty: cart[i].qty });
                product = await product.save();
            } else {
              res.json({error: e.message});
            }
        }

        let user = await Users.findById(req.user);
        user.cart = [];
        user = await user.save();

        let order = new Order({
          address,
            products,
            totalPrice,
            orderTime: new Date().getTime(),
            userId: req.user,
            status: 0,
            paymentMethod
        });
        order = await order.save();

        res.status(200).json({ status: 0, message: "Order added successfully", order });
    } catch (error) { 
        res.status(500).json({ error: error.message });
    }
});

userRouter.get('/my-orders', myAuth, async (req, res) => {
  try {
      const orders = await Order.find({userId: req.user});
      res.json({ status: 0, message: "Order get successfully", orders });
  } catch (e) {
      res.status(500).json({error: e.message});
  }
});



  
  module.exports = userRouter;