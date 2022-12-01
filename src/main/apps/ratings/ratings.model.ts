import mongoose, { PaginateModel, Document, Schema, Model, Types } from 'mongoose';
import mongoosePaginate from 'mongoose-paginate';


export interface IRatings extends Document{
    user:Schema.Types.ObjectId
    movie:Schema.Types.ObjectId
    stars:number
    review:string
    isActive:boolean
}


const ratingSchema = new mongoose.Schema(
    {
        user:{
            type: Schema.Types.ObjectId,
            ref:'Users',
            required: true
        },
        movie:{
            type: Schema.Types.ObjectId,
            ref:'Movies',
            required: true
        },
        stars:{
            type:Number,
            min: 1,
            max: 5,
            required: true
        },
        review:{
            type:String,
            trim:true
        },
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);
ratingSchema.plugin(mongoosePaginate);

interface RatingsModel extends Model<IRatings>,PaginateModel<IRatings> {
    getAverageRating(movieId:Types.ObjectId): any;
  }
  ratingSchema.static('getAverageRating', async function getAverageRating(movieId) {
    const obj = await this.aggregate([
        { $match: { movie: movieId } },
        { 
          $group: {
            _id: '$movie',
            averageRating: { $avg: '$stars' }
          }
        }
      ]); 
    
      try {
        await mongoose.model('Movies').findByIdAndUpdate(movieId, {
          averageRating: obj[+[]].averageRating.toFixed(2)
    
        })
      } catch (error) {
        console.log(error);
      }
  });


// Call getAverageRating after save
ratingSchema.post('save', function() {
   Ratings.getAverageRating(this.movie)
  });
  
  
const Ratings = mongoose.model<IRatings, RatingsModel>('Ratings',ratingSchema,'Ratings');
export default Ratings;