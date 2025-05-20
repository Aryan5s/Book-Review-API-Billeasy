const express = require( 'express');
const dotenv = require( 'dotenv');
dotenv.config();
const cookieParser = require( 'cookie-parser');
const cors = require( 'cors');
const bookRoutes = require('./routes/bookRoutes');
const userRoutes = require('./routes/userRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const isAuthenticated = require('./middleware/auth')

const { sequelize } = require('./config/dbConnect');

const app = express();

app.use(cors());
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/user' , userRoutes);
app.use('/api/v1/books' , isAuthenticated,  bookRoutes);
app.use('/api/v1/reviews', isAuthenticated, reviewRoutes);

const port = process.env.PORT || 4000;

const startServer = async () => {
    try {
        await sequelize.sync();
        await sequelize.authenticate();
        console.log('Database connected successfully');
        app.listen(port, () => console.log(`Server is running on port ${port}`));
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};

startServer();