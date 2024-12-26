import { connect } from 'mongoose';
import dotenv from 'dotenv';
// import Request from '../models/request.js';
// import User from '../models/user.js';

dotenv.config();

const connectDB = async () => {
  try {
    await connect(process.env.MONGO_URI);
    // Request.on('index', (error) => {
    //   if (error) {
    //     console.error('Error creating index:', error);
    //   } else {
    //     console.log('Indexes created');
    //   }
    // });

    // // Ensuring the indexes (you can also use ensureIndexes or other relevant methods)
    // User.ensureIndexes();
    // console.log('MongoDB connected');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

export default connectDB;
