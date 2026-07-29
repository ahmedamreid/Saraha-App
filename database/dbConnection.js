import { connect } from 'mongoose';

const mongoUri = process.env.MONGODB_URI

export const dbConnection = connect(mongoUri)
  .then(() => {
    console.log("Saraha Server Connected!");
  })
  .catch((err) => {
    console.log("Error!! Saraha Server Not Connected!", err.message);
  });
