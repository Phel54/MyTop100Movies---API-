/* eslint-disable */
import Admin,{IAdmin} from './admin.model';
import bcrypt from 'bcrypt';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { Types } from 'mongoose';

class AdminServices {
  async createUser(adminData: IAdmin) {
    let admin = new Admin(adminData);
    return await admin.save();
  }
  async checkIfExist(email: IAdmin) {
    const emailData = await Admin.findOne({ email: email });
    return emailData;
  }
  async checkIfExistAndIsActive(email: IAdmin) {
    const emailData = await Admin.findOne({ email: email, isActive: true });
    return emailData;
  }
  async checkIfIsNotActive(email: IAdmin) {
    const emailData = await Admin.findOne({ email: email, isActive: false });
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
  async saveResetPasswordDetails(adminData: any, token: number) {
    adminData.resetPasswordToken = `${token}`;
    adminData.resetPasswordExpires = `${Date.now() + 60000 * 20}`; //20 mins
    // console.log(emailData);
    return await adminData.save();
  }
  async saveRefreshToken(adminData: any, token: String) {
    adminData.refreshToken = token;
    return await adminData.save();
  }
  async checkForResetToken(token: string) {
    const itExist = await Admin.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: {
        $gt: Date.now(),
      },
    }).select('-password');
    return itExist;
  }
  async viewOneUserById(id: string) {
    const adminData = await Admin.findById(id.toString()).select('-password');
    return adminData;
  }
  async viewOneUserByEmail(email: string) {
    const adminData = await Admin.findOne({ email: email }).select('-password');
    return adminData;
  }
  async viewAllUsers(limit: number, page: number) {
    const numlimit = limit || 100;
    const numPage = page || 10;
    const options = {
      page: numPage,
      limit: numlimit,
      sort: 'createdAt',
    };
    const adminData = await Admin.paginate({}, options, (err, result) => {
      if (err) {
        throw new Error(err);
      }
      return result;
    });
    return adminData;
  }
  async updateUser(id: string, adminData: IAdmin) {
    return await Admin.findByIdAndUpdate(id, { $set: adminData }).select('-password');
  }
  async removeUser(id: Types.ObjectId) {
    return await Admin.updateOne(id, { $set: { isActive: false } }).select('-password');
  }
  verifyRefreshToken(refreshToken: any) {
    const token = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET as string) as JwtPayload;
    return token;
  }
  async updateRefreshToken(adminId: string, refreshToken: string) {
    return await Admin.updateOne({ _id: adminId }, { $set: { refreshToken: refreshToken } });
  }
}

export default new AdminServices();
