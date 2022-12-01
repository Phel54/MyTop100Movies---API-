import express from 'express';
import Authentication from '../../middleware/users-auth.middleware';
import Authorization from '../../middleware/authorize-middleware';
import ratingsController from './ratings.controller';

const ratingsRouter = express.Router();

ratingsRouter.route('/add').post(Authentication.validateToken,ratingsController.addRatings)
ratingsRouter.route('/all').get(Authentication.validateToken,ratingsController.getAllRating)
ratingsRouter.route('/get/movie/:movieId').get(Authentication.validateToken,ratingsController.getRatingByMovieId)
ratingsRouter.route('/update/movie/:movieId').patch(Authentication.validateToken,ratingsController.update)
ratingsRouter.route('/delete/movie/:movieId').delete(Authentication.validateToken,ratingsController.deleteRatings)

export default ratingsRouter;
