/* eslint-disable */
import User, { IUsers } from "./user.model";
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';
class UserServices {
    async createUser(userData: IUsers) {
        let user = new User(userData);
        return await user.save();
      }
      async checkIfExist(email: IUsers) {
        const emailData = await User.findOne({ email: email });
        return emailData;
      }
      async checkIfExistAndIsActive(email: IUsers) {
        const emailData = await User.findOne({ email: email, isActive: true });
        return emailData;
      }

      async decryptPassword(password: string, dbpassword: string): Promise<boolean> {
        return await bcrypt.compare(password, dbpassword);
      }
      async signAccessToken(_id: Types.ObjectId, email: string, role: any): Promise<string> {
        const payload = {
          id: _id,
          email: email,
          role: role,
        };
        const options = {
          expiresIn: process.env.JWT_EXPIRES_IN,
          issuer: process.env.JWT_ISSUER,
          subject: process.env.JWT_SUBJECT,
          audience: process.env.JWT_AUDIENCE,
        };
    
        const secret: string = `${process.env.JWT_SECRET}`;
        const token = jwt.sign(payload, secret, options);
        return token;
      }
      async signRefreshToken(_id: Types.ObjectId, email: string, role: any): Promise<string> {
        const payload = {
          id: _id,
          email: email,
          role: role,
        };
        const options = {
          expiresIn: process.env.JWT_EXPIRES_IN,
          issuer: process.env.JWT_ISSUER,
          subject: process.env.JWT_SUBJECT,
          audience: process.env.JWT_AUDIENCE,
        };
    
        const secret: string = `${process.env.JWT_SECRET}`;
        const token = jwt.sign(payload, secret, options);
        return token;
      }
    
      async saveResetPasswordDetails(userData: any, token: number) {
        userData.resetPasswordToken = `${token}`;
        userData.resetPasswordExpires = `${Date.now() + 60000 * 20}`; //20 mins
        // console.log(emailData);
        return await userData.save();
      }
      async saveRefreshToken(userData: any, token: String) {
        userData.refreshToken = token;
        return await userData.save();
      }
      async checkForResetToken(token: string) {
        const itExist = await User.findOne({
          resetPasswordToken: token,
          resetPasswordExpires: {
            $gt: Date.now(),
          },
        }).select('-password');
        return itExist;
      }
      async viewAllUsers(limit: number , page: number) {
        const numlimit = limit || 10
        const numPage = page || 1
        const options = {
          page: numPage,
          limit: numlimit,
          sort: 'createdAt',
        };
        const userData = await User.paginate({}, options, (err, result) => {
          if (err) {
            throw new Error(err);
          }
          return result;
        });
        return userData;
      }
    
      async viewOneUserById(id: string) {
        const userData = await User.findById(id.toString()).select('-password');
        return userData;
      }
      async viewOneUserByEmail(email: string) {
        const userData = await User.findOne({ email: email }).select('-password');
        return userData;
      }
      async updateUser(id: Types.ObjectId, userData: IUsers) {
        return await User.updateOne({_id:id}, { $set: userData }).select('-password');
      }
      async removeUser(id: Types.ObjectId) {
        return await User.updateOne({_id:id}, { $set: { isActive: false } }).select('-password');
      } 
    
      async verifyRefreshToken(refreshToken: any) {
        const token = jwt.verify(refreshToken,process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
        return token;
      }
    
      async updateRefreshToken(userId:string, refreshToken:string){
        return await User.updateOne(
          {_id:userId},
          {$set:{refreshToken:refreshToken}}
        )
      }
}
export default new UserServices();