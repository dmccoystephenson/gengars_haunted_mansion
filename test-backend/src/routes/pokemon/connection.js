const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
require('colors');

// Connection process
const connect = asyncHandler(async (request, response, next) => {
    mongoose.set('strictQuery', true);
    const mongoURI = getConnection();

    const db = await mongoose.connect(mongoURI);
    console.log(`Mongo Connected: ${db.connection.host}`.cyan.underline);
    next();
});

const disconnect = asyncHandler(async (request, response, next) => {
    await mongoose.connection.close();
    console.log(`Mongo Disconnected: ${mongoose.connection.host}`.blue.underline);
}); 

const getConnection = () => {
    console.log('Connecting to MongoDB...'.yellow.underline);

    const mongoURI = process.env.MONGO_URI;
    console.log(mongoURI);
    
    if (!mongoURI) {
        throw new Error('MongoDB connection string is not defined in environment variables.');
    }

    return mongoURI;
}

module.exports = {
    connect,
    disconnect
}