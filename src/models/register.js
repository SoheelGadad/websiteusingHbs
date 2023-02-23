const mongoose = require("mongoose");
const bcrypt= require("bcryptjs");
const jwt = require("jsonwebtoken");

const Schema = mongoose.Schema

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  confirmpassword: {
    type: String,
    required: true,
  },
  tokens:[{
    token:{
      type:String,
      required:true
    }
  }]
});

//generatng tokens
  userSchema.methods.generateAuthToken = async function(){
    try {
      console.log(this._id);
      const token = jwt.sign({_id:this._id.toString()}, process.env.SECRET_KEY);
      this.tokens = this.tokens.concat({token:token});
      await this.save();
      return token;
    } catch (error) {
      res.send("the error part" + error);
      console.log("the error part"+ error);
    }
  }


//converting password into hashing by bcrypt
 userSchema.pre("save", async function(next){
  if(this.isModified("password")){
    this.password = await bcrypt.hash(this.password, 10);
    this.confirmpassword = await bcrypt.hash(this.password, 10);
  }
  next();
 });

//collectiion
const Register = new mongoose.model("Register",userSchema);
module.exports = Register;