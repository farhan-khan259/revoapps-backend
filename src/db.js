import mongoose from 'mongoose';

const connectDatabase = async () => {
  const uri = process.env.MONGO_URI || process.env.MONGO_URI_DIRECT || process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('Database URI is not defined in environment. Set MONGO_URI, MONGO_URI_DIRECT, or MONGODB_URI.');
  }

  await mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });

  console.log('Connected to MongoDB');
};

export default connectDatabase;
