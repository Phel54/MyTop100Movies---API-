import { ObjectId } from 'mongoose';
import Ratings, { IRatings } from './ratings.model';
class RatingServices {
  create = async (ratingsData: IRatings, id:ObjectId) => {
    const ratingDetails = ratingsData
    ratingDetails.user = id
    let rating = new Ratings(ratingDetails);
    return await rating.save();
  };

  checkIfRatingExist = async (id: string) => {
    const rateData = await Ratings.findOne({ restaurant: id, isActive: true });
    return rateData;
  };
  viewAllRating = async (limit: number, page: number) => {
    const numlimit = limit || 10;
    const numPage = page || 1;
    const options = {
      page: numPage,
      limit: numlimit,
      populate: "movie",
      sort: 'createdAt',
    };
    const query = { isActive: true };
    const ratingData = await Ratings.paginate(query, options, (err, result) => {
      if (err) {
        throw new Error(err);
      }
      return result;
    });
    return ratingData;
  };

  viewRatingByMovie = async (id: string) => {
    return await Ratings.find({ movie: id, isActive: true }).populate('movie').populate('user');
  };

  updateRating = async (id: string, ratingdata: IRatings) => {
    return await Ratings.updateOne({ _id: id }, { $set: ratingdata });
  };

  removeRating = async (id: string) => {
    return await Ratings.updateOne({ _id: id }, { $set: {isActive:false} });
  };
}
export default new RatingServices();