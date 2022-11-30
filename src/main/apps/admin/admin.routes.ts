/* eslint-disable */
import express from 'express';
import Authentication from '../../middleware/users-auth.middleware';
import Authorization from '../../middleware/authorize-middleware';
import adminControllers from './admin.controllers';

const adminRouter = express.Router();

adminRouter.route('/signup').post(Authentication.validateToken,adminControllers.createUser, Authorization.authorizeRoles('Super-Admin'));
adminRouter.route('/activate/token/:token').post(adminControllers.activate);
adminRouter.route('/login').post(adminControllers.login);
adminRouter.route('/resendcode').post(adminControllers.resendCode);
adminRouter.route('/all').get(Authentication.validateToken,adminControllers.getAllUsers, Authorization.authorizeRoles('Admin','Super-Admin'));
adminRouter.route('/email/:email').get(Authentication.validateToken,adminControllers.getUsersByEmail,Authorization.authorizeRoles('Admin','Super-Admin'));
adminRouter.route('/adminId/:adminId').get(Authentication.validateToken,adminControllers.getUsersById,Authorization.authorizeRoles('Admin','Super-Admin'));
adminRouter.route('/adminId/:adminId').patch(Authentication.validateToken,adminControllers.updateUserDetails,Authorization.authorizeRoles('Admin','Super-Admin'));
adminRouter.route('/adminId/:adminId').delete(Authentication.validateToken,adminControllers.deleteUser,Authorization.authorizeRoles('Admin','Super-Admin'));
adminRouter.route('/refreshToken/:refreshToken').post(Authentication.validateToken,adminControllers.refreshUserToken);

export default adminRouter;
