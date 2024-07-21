import jwt from 'jsonwebtoken'
import adminModel from '../models/adminModel.js'
import validator from 'email-validator';
import bcrypt from 'bcrypt'

// generate Token
const generateToken=(id)=>{
return jwt.sign({id},process.env.JWT_SECRETE_KEY);
}


// admin signup
const adminSignup=async(req,res)=>{
const{name,email,password}=req.body;
 try {
    const adminExist=await adminModel.findOne({email});
  
    if(adminExist){
        return res.json({success:false,message:"User already exist"});
    }
    if(!validator.validate(email)){
        return res.json({success:false,message:"Enter Correct email"});
    }
    if(password.length<6){
        return res.json({success:false,message:"Enter a strong Password"});
    }
    const salt =await bcrypt.genSalt(10);
    const hashedPassword=await bcrypt.hash(password,salt);
    const newAdmin=new adminModel({
        name:name,
        email:email,
        password:hashedPassword
    })
   
    const admin= await newAdmin.save();
    const token=generateToken(admin._id)
    res.json({success:true,token:token})
 } catch (error) {
    console.log(error)
    res.json({success:false,message:"Error while creating account"})
 }
}
//  admin signin

const adminSignin=async(req,res)=>{
 const{email,password}=req.body;
 try {
    const admin=await adminModel.findOne({email});
    if(!admin){
        return res.json({success:false,message:"User Doesn't exist"})
    }
    const isMatch=await bcrypt.compare(password,admin.password);
    if(!isMatch){
        return res.json({success:false,message:"Enter the correct password"})
    }
    const token=generateToken(admin._id);
    res.json({success:true,token:token})
 } catch (error) {
    res.json({success:false,message:"Error while loginin"})
 }
}

// admin Products

const getAdminProducts=async(req,res)=>{
 const {adminId}=req.body;
 try {
    if(!adminId){
        return res.json({success:false,message:"Admin not authorized"})
    }
    const adminExist=await adminModel.findById(adminId).select('name products').populate('products');
    if(!adminExist){
        return res.json({success:false,message:"User doesn't exist"})
    }

    res.json({success:true,data:adminExist})
 } catch (error) {
     res.json({success:false,message:"User doesn't exist"})
 } 
}

export {adminSignin,adminSignup,getAdminProducts};