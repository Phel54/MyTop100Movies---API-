import { Request, Response } from 'express';
import apiResponse from '../../util/apiResponse';
import logger from '../../logs/index.log';
import mongoose from 'mongoose';
import moviesServices from './movies.services';

class MoviesController {
  create = async (req: Request, res: Response) => {
    try {
      let movieData = req.body;
      const response = await moviesServices.create(movieData);
      const message = {
        response,
      };
      return apiResponse.successResponseWithData(res, 'Movie Created successfully', message.response);
    } catch (error: any) {
      console.log(error);
      logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  };
  getAllMovies = async (req: Request, res: Response) => {
    try {
      let limit;
      if (req.query && req.query.limit) {
        limit = (req.query as any).limit;
      }
      let page;
      if (req.query && req.query.page) {
        page = (req.query as any).page;
      }
      const movies = await moviesServices.getAllMovies(limit, page);
      return apiResponse.successResponseWithData(res, 'All movies', movies);
    } catch (error: any) {
      console.log(error);
      logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  };

  getMovieById = async (req: Request, res: Response) => {
    try {
      const { movieId } = req.params;
      const movie = await moviesServices.getOneMovie(movieId);
      if (!movie) {
        const message = 'Movie does not exist';
        return apiResponse.notFoundResponse(res, message);
      }
      return apiResponse.successResponseWithData(res, 'Movie', movie as Object);
    } catch (error: any) {
      console.log(error);
      logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  };

  update = async (req: Request, res: Response) => {
    try {
      const { movieId } = req.params;
      const movie = await moviesServices.getOneMovie(movieId);
      if (!movie) {
        const message = 'movie not found';
        return apiResponse.notFoundResponse(res, message);
      }
      const movieData = req.body;
      await moviesServices.update(movieId, movieData);
      return apiResponse.successResponse(res, 'Update Successfull');
    } catch (error: any) {
      console.log(error);
      logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  };

  deleteMovie = async (req: Request, res: Response) => {
    try {
      const { movieId } = req.params;
      const movie = await moviesServices.getOneMovie(movieId);
      if (!movie) {
        const message = 'movie not found';
        return apiResponse.notFoundResponse(res, message);
      }
      await moviesServices.removeMovie(movie._id);
      return apiResponse.successResponse(res, 'Deletion Successfull');
    } catch (error: any) {
      console.log(error);
      logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  };

  getMoviesWithTheHighestRating = async (req: Request, res: Response) => {
    try {
      let limit;
      if (req.query && req.query.limit) {
        limit = (req.query as any).limit;
      }
      let page;
      if (req.query && req.query.page) {
        page = (req.query as any).page;
      }
      const movies = await moviesServices.getMoviesWithHighestRating(limit, page);
      return apiResponse.successResponseWithData(res, 'All movies', movies);
    } catch (error: any) {
      console.log(error);
      logger.error(error);
      return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
    }
  };
}

export default new MoviesController();
