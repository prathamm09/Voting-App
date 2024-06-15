const express = require('express');
const router = express.Router();
const user = require('./../models/user');
const {jwtAuthMiddleware , generateToken} = require('./../jwt');

//SignUp route to add user
router.post("/signup" , async(req , res)=>{
    try{
        const data = req.body;
        const newUser = new user(data);

        //save new person to the database
        const response = await newUser.save();
        console.log("Data Saved");

        const payload = {
            id: response.id
        }
        console.log(JSON.stringify(payload));
        const token = generateToken(payload);

        //send response as well as token
        res.status(200).json({response: response , token: token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : "Internal Server Error"});
    }
});

//login route
router.post("/login" , jwtAuthMiddleware , async(req , res)=>{
    try{
        const {aadharCardNumber , password} = req.body;
        const user = await person.fndOne({aadharCardNumber : aadharCardNumber });
        if(!user || !(await user.comparePassword(password))){
            return res.status(401).json({error : "Invalid aadharCardNumber or password"});
        }
        const payload = {
            id : user.id
        }
        const token = generateToken(payload);
        console.log("Token: ", token);
        res.json({token});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : "Internal Server Error"});
    }
})

//profile route
router.get('/profile' , jwtAuthMiddleware , async(req , res)=>{
    try{
        const userData = req.user;
        const userId = userData.id;
        const user = await person.findById(userId);

        res.status(200).json({user});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : "Internal Server Error"});
    }
})

router.put("/profile/password" , jwtAuthMiddleware , async(req , res)=>{
    try{
        const userId = req.user; //extract id from token
        const {currentPassword , newPassword} = req.body //extract current and new password

        //find the user by id
        const user = await user.findById(userId);

        //if password does not match return error
        if(!(await user.comparePassword(currentPassword))){
            return res.status(401).json({error : 'Invalid details'});
        }

        //update the users password
        user.password = newPassword;
        await user.save();

        console.log('Password Updated');
        res.status(200).json({message : "Password Updated"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error : "Internal Server Error"});
    }
})

module.exports = router;
