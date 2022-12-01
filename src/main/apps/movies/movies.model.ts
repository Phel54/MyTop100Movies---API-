/* eslint-disable */
import mongoose, { PaginateModel, Document } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';
const Schema = mongoose.Schema;

export interface IMovies extends Document{
  name: string;
  description: string;
  starring: string;
  genre: string;
  cover: string;
  averageRating: number;
  year:string
}

const movieSchema = new Schema(
  {
    name: { type: String, minlength: [2, 'Name cannot be less than 2 characters'] },
    description: { type: String, minlength: [2, 'Description cannot be less than 2 characters'] },
    starring: { type: String, minlength: [2, 'Starring  cannot be less than 2 characters'] },
    genre: { type: String, minlength: [2, 'Starring  cannot be less than 2 characters'] },
    cover: {
        type: String
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be greater than or equal to 1'],
        max: [5, 'Rating must be less than or equal to 5']
    },
    year: {
      type: String
  }
  },
  { timestamps: true }
);
movieSchema.plugin(mongoosePaginate);
interface Movies<T extends Document> extends PaginateModel<IMovies>{}
const Movies = mongoose.model<IMovies>('Movies',movieSchema,'Movies');
export default Movies;