/* eslint-disable prettier/prettier */
/* eslint-disable */
import mongoose, { PaginateModel, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
import bcrypt from 'bcrypt';
const Schema = mongoose.Schema;


enum Gender{
    Male,Female,Other
}

export interface IUsers extends Document{
    name:{
        first:string,
        last:string
    },
    email:string,
    phoneNumber:string,
    gender:Gender,
    role:string,
    isActive:boolean,
    resetPasswordToken: string | undefined,
    resetPasswordExpires: string | undefined,
    password:string,

}

const userSchema = new Schema(
	{
        name:{
            first:{
                type:String,
                trim:true,
                minlength: [2, 'First Name cannot be less than 2 characters'],
            },
            last:{
                type:String,
                trim:true,
                minlength: [2, 'Last Name cannot be less than 2 characters'],
            }
        },
        email:{
            type:String,
            required:true,
            unique:true,
            lowercase:true,
            trim:true
        },
        password: {
            type: String,
            required: true,
            trim: true,
          },
        phoneNumber: {
            type:String,
            required:true,
        },
        role: {
			type: String,
            default:"User"
		},
        gender: {
			type: String,
			enum: ['Male', 'Female','Others'],
		},
        isActive: {
			type: Boolean,
			default: true,
		},
		resetPasswordToken: String,
		resetPasswordExpires: String,
    },
	{ timestamps: true }
);

userSchema.plugin(mongoosePaginate)
userSchema.pre('save', async function (next) {
    if (this.password && this.isModified('password')) {
      // call your hashPassword method here which will return the hashed password.
      const salt = await bcrypt.genSalt(12);
  
      // student.password = await bcrypt.hash(req.body.password, salt);
      this.password = await bcrypt.hash(this.password, salt);
    }
    // everything is done, so let's call the next callback.
    next();
  });
  interface User<T extends Document> extends PaginateModel<IUsers> {}

const User = mongoose.model<IUsers>('Users',userSchema,'Users');
export default User;