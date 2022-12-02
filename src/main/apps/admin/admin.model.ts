/* eslint-disable */
import mongoose, { PaginateModel, Document } from 'mongoose';
const Schema = mongoose.Schema;
import mongoosePaginate from 'mongoose-paginate';
import bcrypt from 'bcrypt';

export  interface IAdmin extends Document{
    name:{
        first:string,
        last:string
    },
    email:string,
    phoneNumber:string,
    tin:string,
    datOfbirth:Date,
    role:string,
    isActive:boolean,
    isSuperAdmin:boolean,
    resetPasswordToken: any,
    resetPasswordExpires: any,
    refreshToken:String,
    password:string,
}

let adminSchema = new Schema({
    name: {
        first: {
            type: String,
            trim: true,
        },
        last: {
            type: String,
            trim: true,
        },
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phoneNumber: {
        type: String,
        unique: true,
        required: true,
    },
    password: {
        type: String,
        trim: true,
        required: true,
        default: 'changeMe',
    },
    role: {
        type: String,
        default: 'Admin',
      },
    isSuperAdmin: {
        type: Boolean,
        default: false,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    resetPasswordToken: String,
    resetPasswordExpires: String,
},
{ timestamps: true })

adminSchema.plugin(mongoosePaginate);

adminSchema.pre('save', async function (next) {
  if (this.password && this.isModified('password')) {
    // call your hashPassword method here which will return the hashed password.
    const salt = await bcrypt.genSalt(12);

    // student.password = await bcrypt.hash(req.body.password, salt);
    this.password = await bcrypt.hash(this.password, salt);
  }
  // everything is done, so let's call the next callback.
  next();
});

interface Admin<T extends Document> extends PaginateModel<IAdmin> {}

const Admin = mongoose.model<IAdmin>('Admin', adminSchema, 'Admin');
export default Admin;