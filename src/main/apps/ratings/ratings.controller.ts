import { JwtPayload } from 'jsonwebtoken';
import { Request, Response } from 'express';
import apiResponse from '../../util/apiResponse';
import logger from '../../logs/index.log';
import ratingsServices from './ratings.services';

class RatingsController {
    addRatings = async(req: Request, res: Response) => {
        try {
            let ratingsData = req.body
            let userPayload:any = req.decoded;
            const response = await ratingsServices.create(ratingsData,userPayload.id);
            const message = {
                response,
              };
              return apiResponse.successResponseWithData(res, 'Ratings Added successfully', message.response);
         } catch (error:any) {
        console.log(error)
        logger.error(error)
        return apiResponse.errorResponse(res, error.message, 'Technical Server Error')
         }
    }

    getAllRating = async(req: Request, res: Response) => {
        try {
            let limit;
            if (req.query && req.query.limit) {
              limit = (req.query as any).limit;
            }
            let page;
            if (req.query && req.query.page) {
              page = (req.query as any).page;
            }
            const movies = await ratingsServices.viewAllRating(limit, page);
            return apiResponse.successResponseWithData(res, 'All ratings', movies);
          } catch (error: any) {
            console.log(error);
            logger.error(error);
            return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
          }
    }

    getRatingByMovieId = async (req: Request, res: Response) => {
        try {
          const { movieId } = req.params;
          const rating = await ratingsServices.viewRatingByMovie(movieId);
          if (!rating) {
            const message = 'rating does not exist';
            return apiResponse.notFoundResponse(res, message);
          }
          return apiResponse.successResponseWithData(res, 'rating', rating as Object);
        } catch (error: any) {
          console.log(error);
          logger.error(error);
          return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
        }
      };

      update = async(req: Request, res: Response) => {
        try {
            const { movieId } = req.params;
            const rating = await ratingsServices.viewRatingByMovie(movieId);
            if (!rating) {
              const message = 'rating not found';
              return apiResponse.notFoundResponse(res, message);
            }
            const ratingData = req.body;
            await ratingsServices.updateRating(movieId, ratingData);
            return apiResponse.successResponse(res, 'Update Successfull');
          } catch (error: any) {
            console.log(error);
            logger.error(error);
            return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
          }
      }


      deleteRatings = async(req: Request, res: Response) => {
        try {
            const { movieId } = req.params;
            const rating:any = await ratingsServices.viewRatingByMovie(movieId);
            if (!rating) {
              const message = 'rating not found';
              return apiResponse.notFoundResponse(res, message);
            }
            await ratingsServices.removeRating(rating._id);
            return apiResponse.successResponse(res, 'Deletion Successfull');
          } catch (error: any) {
            console.log(error);
            logger.error(error);
            return apiResponse.errorResponse(res, error.message, 'Technical Server Error');
          }
      }
}
export default new RatingsController();