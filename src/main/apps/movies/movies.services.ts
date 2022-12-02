import Movies, {IMovies} from "./movies.model";
import { Types } from 'mongoose';

class MovieServices{
    create = async (movieData:IMovies) => {
        let movie = new Movies(movieData)
        return await movie.save()
    }
    getAllMovies = async (limit: number , page: number) => {
        const numlimit = limit || 10
        const numPage = page || 1
        const options = {
          page: numPage,
          limit: numlimit,
          sort: 'createdAt'
        };
        const query = {isActive:true}
        const movieData = await Movies.paginate(query, options, (err, result) => {
          if (err) {
            throw new Error(err);
          }
          return result;
        });
        return movieData;
    }

    getOneMovie = async (movieId:string) => {
        return await Movies.findOne({_id:movieId})
    }
    update =async (id:string,movieData:IMovies) => {
        return await Movies.findByIdAndUpdate(id, { $set: movieData })
    }

    removeMovie =async (id: Types.ObjectId) => {
        return await Movies.updateOne(id, { $set: { isActive: false } });
    }
    getMoviesWithHighestRating = async (limit: number , page: number) => {
      const numlimit = limit || 10
      const numPage = page || 1
      const options = {
        page: numPage,
        limit: numlimit,
        sort: 'createdAt'
      };
      const query = {averageRating: { $gte: 4.5 },isActive:true}
      const movieData = await Movies.paginate(query, options, (err, result) => {
        if (err) {
          throw new Error(err);
        }
        return result;
      });
      return movieData;
  }
}
export default new MovieServices();