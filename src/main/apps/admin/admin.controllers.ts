/* eslint-disable */
import { Request, Response } from 'express';
import adminServices from './admin.services';
import apiResponse from '../../util/apiResponse';
import Logger from '../../logs/index.log';
import mongoose from 'mongoose';
import { ParamsDictionary } from 'express-serve-static-core';
import { ParsedQs } from 'qs';

class AdminController {
  async createUser(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const adminData = req.body;
    try {
      const admin = await adminServices.checkIfExist(req.body.email);
      if (admin) {
        const message = 'user already exist';
        return apiResponse.notFoundResponse(res, message);
      }
      // Generate Token to sent to Partner's email
      const token = Math.floor(100000 + Math.random() * 900000);
      const response = await adminServices.createUser(adminData);
      await Promise.all([adminServices.saveResetPasswordDetails(response, token)]);

      const message = {
        response,
      };
      return apiResponse.successResponseWithData(res, 'Admin Created successfully', message.response);
    } catch (error: any) {
      Logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  }
  async login(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const { email, password } = req.body;
    try {
      const admin = await adminServices.checkIfExist(email);
      const isUserNotActive = await adminServices.checkIfIsNotActive(email);
      if (!admin) {
        const message = 'No record found';
        return apiResponse.notFoundResponse(res, message);
      } else if (isUserNotActive) {
        const message = 'Account not Active';
        return apiResponse.notFoundResponse(res, message);
      } else {
        await adminServices
          .decryptPassword(password, admin.password)
          .then(async (result: any) => {
            if (result === false) {
              const message = 'Wrong Password';
              return apiResponse.notFoundResponse(res, message);
            }
            const accessToken = await adminServices.signAccessToken(admin._id, admin.email, admin.role);
            adminServices
              .signRefreshToken(admin._id, admin.email, admin.role)
              .then(async refresh => {
                await adminServices.saveRefreshToken(admin, refresh);
                const msg = 'Admin logged in successfully';
                const message = {
                  id: `${admin._id}`,
                  firstName: `${admin.name.first}`,
                  accessToken: accessToken,
                  refreshToken: refresh,
                };
                return apiResponse.successResponseWithData(res, msg, message);
              })
              .catch(err => {
                Logger.error(err);
                return apiResponse.errorResponse(res, err.message, 'Technical Server Error');
              });
          })
          .catch(err => {
            Logger.error(err);
            return apiResponse.errorResponse(res, err.message, 'Technical Server Error');
          });
      }
    } catch (error: any) {
      Logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  }
  async activate(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const token = req.params.token;
    const admin = await adminServices.checkForResetToken(token);
    if (!admin) {
      const message = 'Token is invalid or has expird';
      return apiResponse.notFoundResponse(res, message);
    }
    const accessToken = await adminServices.signAccessToken(admin._id, admin.email, admin.role);
    adminServices
      .signRefreshToken(admin._id, admin.email, admin.role)
      .then(async refresh => {
        await adminServices.saveRefreshToken(admin, refresh);
        admin.isActive = true;
        admin.resetPasswordToken = undefined;
        admin.resetPasswordExpires = undefined;
		admin.password = req.body.password;
        await admin.save();
        const msg = 'Admin Account Activated';
        const message = {
          id: `${admin._id}`,
          firstName: `${admin.name.first}`,
          accessToken: accessToken,
          refreshToken: refresh,
        };
        return apiResponse.successResponseWithData(res, msg, message);
      })
      .catch(err => {
        Logger.error(err);
        return apiResponse.errorResponse(res, err.message, 'Technical Server Error');
      });
  }
  async resendCode(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    try {
      const email = req.params.email;
      const admin = await adminServices.viewOneUserByEmail(email);
      if (!admin) {
        const message = 'Merchant does not already exist';
        return apiResponse.notFoundResponse(res, message);
      }
      const token = Math.floor(100000 + Math.random() * 900000);
      await adminServices.saveResetPasswordDetails(admin, token);
      return apiResponse.successResponseWithData(res, 'Code Sent Successfully', `This is the code: ${token}`);
    } catch (error: any) {
      console.log(error);
      Logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  }
  async forgotPassword(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    try {
      const { email } = req.body;
      const admin = await adminServices.checkIfExist(email);
      if (!admin) {
        return apiResponse.notFoundResponse(res, 'This admin does not exist');
      }
      const token = Math.floor(100000 + Math.random() * 900000);
      await adminServices.saveResetPasswordDetails(admin, token);
      return apiResponse.successResponseWithData(res, `Reset code has been sent`,token);
    } catch (error: any) {
      console.log(error);
      Logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  }
  async resetPassword(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    try {
      const { token, password } = req.body;
      const admin = await adminServices.checkForResetToken(token);
      if (!admin) {
        return apiResponse.notFoundResponse(res, 'Token is expired or Invalid');
      }
      admin.password = password;
      admin.resetPasswordToken = undefined;
      admin.resetPasswordExpires = undefined;

      await admin.save();

      return apiResponse.successResponse(res, 'Password reset successfully');
    } catch (error: any) {
      console.log(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  }
  async getAllUsers(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    try {
      let limit;
      if (req.query && req.query.limit) {
        limit = (req.query as any).limit;
      }
      let page;
      if (req.query && req.query.page) {
        page = (req.query as any).page;
      }
      const admins = await adminServices.viewAllUsers(limit, page);
      return apiResponse.successResponseWithData(res, 'All Admins', admins);
    } catch (error: any) {
      console.log(error);
      Logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  }
  async getUsersByEmail(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    try {
      const { email } = req.params;
      const admin = await adminServices.viewOneUserByEmail(email);
      return apiResponse.successResponseWithData(res, 'Admin', admin as Object);
    } catch (error: any) {
      console.log(error);
      Logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  }
  async getUsersById(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    try {
      const { adminId } = req.params;
      const admin = await adminServices.viewOneUserById(adminId);
      return apiResponse.successResponseWithData(res, 'Admin Details', admin as Object);
    } catch (error: any) {
      console.log(error);
      Logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  }
  async updateUserDetails(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    try {
      const { adminId } = req.params;
      const admin = await adminServices.viewOneUserById(adminId);
      if (!admin) {
        const message = 'Admin not found';
        return apiResponse.notFoundResponse(res, message);
      }
      const adminData = req.body;
      await adminServices.updateUser(adminId, adminData);
      return apiResponse.successResponse(res, 'Update Successfull');
    } catch (error: any) {
      console.log(error);
      Logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  }
  async deleteUser(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    try {
      const { adminId } = req.params;
      var objectId = new mongoose.Types.ObjectId(adminId);
      const admin = await adminServices.removeUser(objectId);
      if (!admin) {
        const message = 'Admin not found';
        return apiResponse.notFoundResponse(res, message);
      }
      const adminData = req.body;
      await adminServices.updateUser(adminId, adminData);
      return apiResponse.successResponse(res, 'Update Successfull');
    } catch (error: any) {
      console.log(error);
      Logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  }
  async refreshUserToken(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const refreshToken = req.params.refreshToken;
    if (!refreshToken) {
      const message = 'Invalid refresh token';
      return apiResponse.notFoundResponse(res, message);
    }
    const userId = await adminServices.verifyRefreshToken(refreshToken);

    const [accessToken, refToken] = await Promise.all([
      adminServices.signAccessToken(userId.id, userId.email, userId.role),
      adminServices.signRefreshToken(userId.id, userId.email, userId.role),
    ]);
    await adminServices.updateRefreshToken(userId.id, refToken);
    let message = {
      newAccessToken: accessToken,
      refreshToken: refToken,
    };
    return apiResponse.successResponseWithData(res, 'Tokens', message);
  }
}

export default new AdminController();
