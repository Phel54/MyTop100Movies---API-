/* eslint-disable */
import { Request, Response } from 'express';
import userServices from './user.services';
import apiResponse from '../../util/apiResponse';
import { IUsers } from './user.model';
import logger from 'src/main/logs/index.log';
import mongoose from 'mongoose';

class UserController {
    async createUser(req: Request, res: Response) {
        const userData: IUsers = req.body;
        try {
          const user = await userServices.checkIfExist(req.body.email);
          if (user) {
            const message = 'user already exist';
            return apiResponse.notFoundResponse(res, message);
          }
          // Generate Token to sent to Partner's email
          const token = Math.floor(100000 + Math.random() * 900000);
          const response = await userServices.createUser(userData);
          await Promise.all([userServices.saveResetPasswordDetails(response, token)]);
    
          const message = {
            response,
          };
          return apiResponse.successResponseWithData(res, 'user Created successfully', message.response);
        } catch (error: any) {
          logger.error(error);
          return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
        }
      }
    
      async activate(req: Request, res: Response) {
        const token = req.params.token;
        const user = await userServices.checkForResetToken(token);
        if (!user) {
          const message = 'Token is invalid or has expird';
          return apiResponse.notFoundResponse(res, message);
        }
        const accessToken = await userServices.signAccessToken(user._id, user.email, user.role);
        userServices
          .signRefreshToken(user._id, user.email, user.role)
          .then(async refresh => {
            await userServices.saveRefreshToken(user, refresh);
            user.isActive = true;
            user.resetPasswordToken = undefined;
            user.resetPasswordExpires = undefined;
            await user.save();
            const msg = 'user Account Activated';
            const message = {
              id: `${user._id}`,
              firstName: `${user.name.first}`,
              accessToken: accessToken,
              refreshToken: refresh,
            };
            return apiResponse.successResponseWithData(res, msg, message);
          })
          .catch(err => {
            logger.error(err);
            return apiResponse.errorResponse(res, err.message, 'Technical Server Error');
          });
      }
    
      async login(req: Request, res: Response) {
        const { email, password } = req.body;
        try {
          const user = await userServices.checkIfExist(email);
          const isUserNotActive = await userServices.checkIfExistAndIsActive(email);
          if (!user) {
            const message = 'No record found';
            return apiResponse.notFoundResponse(res, message);
          } else if (!isUserNotActive) {
            const message = 'Account not Active';
            return apiResponse.notFoundResponse(res, message);
          } else {
            await userServices
              .decryptPassword(password, user.password)
              .then(async (result: any) => {
                if (result === false) {
                  const message = 'Wrong Password';
                  return apiResponse.notFoundResponse(res, message);
                }
                const accessToken = await userServices.signAccessToken(user._id, user.email, user.role);
                userServices
                  .signRefreshToken(user._id, user.email, user.role)
                  .then(async refresh => {
                    await userServices.saveRefreshToken(user, refresh);
                    const msg = 'user logged in successfully';
                    const message = {
                      id: `${user._id}`,
                      firstName: `${user.name.first}`,
                      accessToken: accessToken,
                      refreshToken: refresh,
                    };
                    return apiResponse.successResponseWithData(res, msg, message);
                  })
                  .catch(err => {
                    logger.error(err);
                    return apiResponse.errorResponse(res, err.message, 'Technical Server Error');
                  });
              })
              .catch(err => {
                logger.error(err);
                return apiResponse.errorResponse(res, err.message, 'Technical Server Error');
              });
          }
        } catch (error: any) {
          logger.error(error);
          return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
        }
      }
    
      async resendCode(req: Request, res: Response) {
        try {
          const email = req.params.email;
          const user = await userServices.viewOneUserByEmail(email);
          if (!user) {
            const message = 'user does not already exist';
            return apiResponse.notFoundResponse(res, message);
          }
          const token = Math.floor(100000 + Math.random() * 900000);
          await userServices.saveResetPasswordDetails(user, token);
          return apiResponse.successResponseWithData(res, 'Code Sent Successfully', `This is the code: ${token}`);
        } catch (error: any) {
          console.log(error);
          logger.error(error);
          return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
        }
      }
      async forgotPassword(req: Request, res: Response) {
        try {
          const { email } = req.body;
          const user = await userServices.checkIfExist(email);
          if (!user) {
            return apiResponse.notFoundResponse(res, 'This user does not exist');
          }
          const token = Math.floor(100000 + Math.random() * 900000);
          await userServices.saveResetPasswordDetails(user, token);
          return apiResponse.successResponse(res, `Reset code has been sent ${token}`);
        } catch (error: any) {
          console.log(error);
          logger.error(error);
          return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
        }
      }
      async resetPassword(req: Request, res: Response) {
        try {
          const { token, password } = req.body;
          const user = await userServices.checkForResetToken(token);
          if (!user) {
            return apiResponse.notFoundResponse(res, 'Token is expired or Invalid');
          }
          user.password = password;
          user.resetPasswordToken = undefined;
          user.resetPasswordExpires = undefined;
    
          await user.save();
    
          return apiResponse.successResponse(res, 'Password reset successfully');
        } catch (error: any) {
          console.log(error);
          return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
        }
      }
      async getAllUsers(req: Request, res: Response) {
        try {
          let limit;
          if (req.query && req.query.limit) {
            limit = (req.query as any).limit;
          }
          let page;
          if (req.query && req.query.page) {
            page = (req.query as any).page;
          }
          const users = await userServices.viewAllUsers(limit, page);
          return apiResponse.successResponseWithData(res, 'All users', users);
        } catch (error: any) {
          console.log(error);
          logger.error(error);
          return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
        }
      }
      async getUsersByEmail(req: Request, res: Response) {
        try {
          const { email } = req.params;
          const user = await userServices.viewOneUserByEmail(email);
          return apiResponse.successResponseWithData(res, 'user', user as Object);
        } catch (error: any) {
          console.log(error);
          logger.error(error);
          return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
        }
      }
      async getUsersById(req: Request, res: Response) {
        try {
          const { userId } = req.params;
          const user = await userServices.viewOneUserById(userId);
          return apiResponse.successResponseWithData(res, 'user Details', user as Object);
        } catch (error: any) {
          console.log(error);
          logger.error(error);
          return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
        }
      }
      async updateUserDetails(req: Request, res: Response) {
        try {
          const { userId } = req.params;
          const user = await userServices.viewOneUserById(userId);
          if (!user) {
            const message = 'user not found';
            return apiResponse.notFoundResponse(res, message);
          }
          const userData = req.body;
          await userServices.updateUser(userId, userData);
          return apiResponse.successResponse(res, 'Update Successfull');
        } catch (error: any) {
          console.log(error);
          logger.error(error);
          return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
        }
      }
      async deleteUser(req: Request, res: Response) {
        try {
          const { userId } = req.params;
          var objectId = new mongoose.Types.ObjectId(userId);
          const user = await userServices.removeUser(objectId);
          if (!user) {
            const message = 'user not found';
            return apiResponse.notFoundResponse(res, message);
          }
          const userData = req.body;
          await userServices.updateUser(userId, userData);
          return apiResponse.successResponse(res, 'Update Successfull');
        } catch (error: any) {
          console.log(error);
          logger.error(error);
          return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
        }
      }
      async refreshUserToken(req: Request, res: Response) {
        const refreshToken = req.params.refreshToken;
        if (!refreshToken) {
          const message = 'Invalid refresh token'
          return apiResponse.notFoundResponse(res, message)
      }
      const userId = await userServices.verifyRefreshToken(refreshToken)
    
      const [accessToken, refToken] = await Promise.all([
        userServices.signAccessToken(userId.id,userId.email, userId.role),
        userServices.signRefreshToken(userId.id,userId.email,userId.role)
    
      ]);
      await userServices.updateRefreshToken(userId.id, refToken)
      let message = {
        newAccessToken: accessToken,
        refreshToken: refToken,
    }
    return apiResponse.successResponseWithData(res, "Tokens", message)
      }
}

export default new UserController();