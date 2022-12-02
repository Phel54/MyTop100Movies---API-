import express from 'express';
import Authentication from '../../middleware/users-auth.middleware';
import Authorization from '../../middleware/authorize-middleware';
import moviesControllers from './movies.controllers';

const movieRouter = express.Router();

movieRouter.route('/add').post(Authentication.validateToken,moviesControllers.create,Authorization.authorizeRoles('Admin'));
movieRouter.route('/all').get(moviesControllers.getAllMovies);
movieRouter.route('/highestrated').get(moviesControllers.getMoviesWithTheHighestRating);
movieRouter.route('/movie/:movieId').get(moviesControllers.getMovieById);
movieRouter.route('/update/movie/:movieId').patch(Authentication.validateToken,moviesControllers.update,Authorization.authorizeRoles('Admin'));
movieRouter.route('/delete/movie/:movieId').delete(Authentication.validateToken,moviesControllers.deleteMovie,Authorization.authorizeRoles('Admin'));

export default movieRouter;