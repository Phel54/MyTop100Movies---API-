import express from 'express';
import Authentication from '../../middleware/users-auth.middleware';
import Authorization from '../../middleware/authorize-middleware';
import userControllers from './user.controllers';

const userRouter = express.Router();

userRouter.route('/signup').post(userControllers.createUser);
userRouter.route('/activate/token/:token').post(userControllers.activate);
userRouter.route('/login').post(userControllers.login);
userRouter.route('/forgotpassword').post(userControllers.forgotPassword);
userRouter.route('/resetPassword').post(userControllers.resetPassword);
userRouter.route('/resendcode').post(userControllers.resendCode);
userRouter.route('/all').get(Authentication.validateToken,userControllers.getAllUsers, Authorization.authorizeRoles('Admin'));
userRouter.route('/email/:email').get(Authentication.validateToken,userControllers.getUsersByEmail,Authorization.authorizeRoles('Admin','User'));
userRouter.route('/userId/:userId').get(Authentication.validateToken,userControllers.getUsersById,Authorization.authorizeRoles('Admin','User'));
userRouter.route('/userId/:userId').patch(Authentication.validateToken,userControllers.updateUserDetails,Authorization.authorizeRoles('Admin','User'));
userRouter.route('/userId/:userId').delete(Authentication.validateToken,userControllers.deleteUser,Authorization.authorizeRoles('Admin','User'));
userRouter.route('/refreshToken/:refreshToken').post(Authentication.validateToken,userControllers.refreshUserToken);

export default userRouter;
