import app from './app.js';
import connectDB from './config/database.js';

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server is running on https://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error while connecting to db: ', err);
  });
