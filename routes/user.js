const express = require('express');
const userRouter=express.Router();
const myAuth=require('../components/myauth');
const Users=require('../models/authScheme');
const {Products}=require('../models/productScheme');
const Order=require('../models/order');



   
userRouter.post('/add-to-cart', myAuth, async (req, res) => {
  try {
      const { id, qty } = req.body;
      const product = await Products.findById(id);

      if (!product) {
          return resjson({  message: "Product not found" });
      }

      if (product.quantity < qty) {
          return resjson({  message: "Insufficient product quantity available" });
      }

      let user = await Users.findById(req.user);

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
                  if (user.cart[i].qty + Number(qty) > product.quantity) {
                      return res.json({ message: "Insufficient product quantity available" });
                  }
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
      res.status(200).json({ status: 0, message: "Added to cart successfully", user });
  } catch (e) {
      res.json({ error: e.message });
  }
});




  userRouter.post('/add-to-favorite', myAuth, async (req, res) => {
    try {
        const { id } = req.body;
        const product = await Products.findById(id);
        if (!product) {
            return res.json({ message: "Product not found" });
        }

        const user = await Users.findById(req.user);
        if (!user) {
            return res.json({ message: "User not found" });
        }

        const isFound = user.favorite.some(fav => fav.product._id.equals(id));
        if (isFound) {
            return res.json({ message: "Product is already in favorites" });
        }

        user.favorite.push({ product });
        await user.save();

        res.status(200).json({ status: 0,message: "Product added to favorites successfully",user });
    } catch (error) {
        console.error(error);
        res.json({ message: "Internal server error" });
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

  
  userRouter.delete('/remove-favorite-item/:id', myAuth, async (reg, res) => {
    try {
      const  id = reg.params.id;
      
      let user = await Users.findById(reg.user);
    
        for (let i = 0; i < user.favorite.length; i++) {

          if (user.favorite[i].product._id.equals(id)) {

              user.favorite.splice(i,1);
              
            break;
          }
        }

      user = await user.save();
      res.status(200).json({ status: 0, message: "removed successfully", user });
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
      const orders = await Order.find({userId: req.user}).sort({ orderTime: -1 });;
      res.json({ status: 0, message: "Order get successfully", orders });
  } catch (e) {
      res.status(500).json({error: e.message});
  }
});


userRouter.get('/mixed-products', async (req, res) => {
  try {
      
      const allProducts = await Products.find();

      if (!allProducts || allProducts.length === 0) {
          return res.status(404).json({ message: "No products found" });
      }

      
      const mixedProducts = allProducts.sort(() => Math.random() - 0.5);

      res.status(200).json({ status: 0, message: "Mixed products retrieved successfully", products: mixedProducts });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
});





  
  module.exports = userRouter;