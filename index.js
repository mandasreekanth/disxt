const express=require('express');
const mongoose= require('mongoose');
const bodyparser=require('body-parser');
const cookieParser=require('cookie-parser');
const User=require('./models/user');
const {auth} =require('./middlewares/auth');
const Product = require('./models/product');
const product = require('./models/product');
const db=require('./config/config').get(process.env.NODE_ENV);
const app=express();
// app use
app.use(bodyparser.urlencoded({extended : false}));
app.use(bodyparser.json());
app.use(cookieParser());

// database connection
mongoose.Promise=global.Promise;
mongoose.connect(db.DATABASE,{ useNewUrlParser: true,useUnifiedTopology:true },function(err){
    if(err) console.log(err);
    console.log("database is connected");
});


// adding new user (sign-up route)
app.post('/api/register',function(req,res){
   // taking a user
   const newuser=new User(req.body);
   console.log(newuser);
   User.findOne({email:newuser.email},function(err,user){
       if(user) return res.status(400).json({ auth : false, message :"email exits"});
       newuser.save((err,doc)=>{
           if(err) {console.log(err);
               return res.status(400).json({ success : false});}
           res.status(200).json({
               succes:true,
               user : doc
           });
       });
   });
});


// login user
app.post('/api/login', function(req,res){
    let token=req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) return  res(err);
        if(user) return res.status(400).json({
            error :true,
            message:"You are already logged in"
        });
    
        else{
            User.findOne({'email':req.body.email},function(err,user){
                if(!user) return res.json({isAuth : false, message : ' Auth failed ,email not found'});
        
                user.comparepassword(req.body.password,(err,isMatch)=>{
                    if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});
        
                user.generateToken((err,user)=>{
                    if(err) return res.status(400).send(err);
                    console.log(user.token);
                    res.cookie('auth',user.token).json({
                        isAuth : true,
                        id : user._id
                        ,email : user.email
                    });
                });    
            });
          });
        }
    });
});

//logout user
 app.get('/api/logout',auth,function(req,res){
        req.user.deleteToken(req.token,(err,user)=>{
            if(err) return res.status(400).send(err);
            res.sendStatus(200);
        });

    }); 

// get logged in user
app.get('/api/profile',auth,function(req,res){
        res.json({
            isAuth: true,
            id: req.user._id,
            email: req.user.email,
            name: req.user.firstname + req.user.lastname
            
        })
});


                   //PROFILE ROUTES
   //create a new product                
app.post('/api/product',auth,function(req,res){
    let data =req.body;
    let tokenUser =req.user._id;
    console.log("aaaa"+data+tokenUser);
    User.findOne({'_id':tokenUser},function(err,user){
         if(user.role == "admin"){
            const newproduct=new Product({
                                         "name":data.name,
                                       "description":data.description,
                                         "price":data.price,
                                      "created_by":tokenUser
                                     });  
            newproduct.save((err,doc)=>{
                if(err) {console.log(err);
                    return res.status(400).json({ success : false});}
                res.status(200).json({
                    succes:true,
                    user : doc
                });
            });
}else{
    res.status(500).json({
        status: "Failed",
        statusCode: 500,
        message: "access denied",
        data: {},
      });
}
});
})

//product update
app.put('/api/product/update/:productid',auth,function(req,res){
    let data =req.body;
    let tokenUser =req.user._id;
    let productId =req.params.productid;
    User.findOne({'_id':tokenUser},function(err,user){
        if (!user) {
            return res.status(404).json({
              status: "error",
              message: "User not found",
              statusCode: 404,
              data: {},
            });
          }
         if(user&&user.role == "admin"){ 
            Product.updateOne({"_id": productId },data,function (err, updatedProduct) {
                  if (err) {
                    console.log(err);
                  } else {
                    res.status(200).json({
                      status: "success",
                      statusCode: 200,
                      message: "successfully updated product",
                      data: {},
                    });
                  }
                }
              );
}else{
    res.status(500).json({
        status: "Failed",
        statusCode: 500,
        message: "access denied",
        data: {},
      });
}

});
})


//product delete
app.delete('/api/product/delete/:productid',auth,function(req,res){
    let tokenUser =req.user._id;
    let productId =req.params.productid;
    User.findOne({'_id':tokenUser},function(err,user){
        if (!user) {
            return res.status(404).json({
              status: "error",
              message: "User not found",
              statusCode: 404,
              data: {},
            });
          }
         if(user&&user.role == "admin"){ 
            Product.findByIdAndRemove({"_id": productId },function (err, updatedProduct) {
                  if (err) {
                    console.log(err);
                  } else {
                    res.status(200).json({
                      status: "success",
                      statusCode: 200,
                      message: "successfully deleted product",
                      data: {},
                    });
                  }
                }
              );
}else{
    res.status(500).json({
        status: "Failed",
        statusCode: 500,
        message: "access denied",
        data: {},
      });
}
});
})


//  list of product data 
app.get('/api/product',auth,function(req,res){
    let tokenUser =req.user._id;
    User.findOne({'_id':tokenUser},function(err,user){
        if (!user) {
            return res.status(404).json({
              status: "error",
              message: "User not found",
              statusCode: 404,
              data: {},
            });
          }
         if(user&&user.role == "admin"){ 
            Product.find({},function (err, productData) {
                  if (err) {
                    console.log(err);
                  } else {
                      console.log(productData);
                    res.status(200).json({
                      status: "success",
                      statusCode: 200,
                      message: "productData",
                      data: productData,
                    });
                  }
                }
              );
}else{
    res.status(500).json({
        status: "Failed",
        statusCode: 500,
        message: "access denied",
        data: {},
      });
}
});
})



 // product data based upon id 
app.get('/api/product/:productid',auth,function(req,res){
    let tokenUser =req.user._id;
    let productId =req.params.productid;
    User.findOne({'_id':tokenUser},function(err,user){
        if (!user) {
            return res.status(404).json({
              status: "error",
              message: "User not found",
              statusCode: 404,
              data: {},
            });
          }
         if(user&&user.role == "admin"){ 
            Product.find({"_id":productId},function (err, productData) {
                  if (err) {
                    console.log(err);
                  } else {
                    res.status(200).json({
                      status: "success",
                      statusCode: 200,
                      message: "productData",
                      data: productData,
                    });
                  }
                }
              );
}else{
    res.status(500).json({
        status: "Failed",
        statusCode: 500,
        message: "access denied",
        data: {},
      });
}
});
})


// listening port
const PORT=process.env.PORT||3000;
app.listen(PORT,()=>{
    console.log(`app is live at ${PORT}`);
});