require('colors');

function errorHandler(error, request, response, next) {
    const { status = 500, message = "Something went wrong!" } = error;
    
    const timestamp = new Date().toISOString();
    if (status >= 500) {
        console.error(`[${timestamp}] SERVER ERROR`.red.bold);
        console.error(`${request.method} ${request.originalUrl}`.yellow);
        console.error(`Status ${status}:`.red, message);
        if (error.stack) {
            console.error(error.stack);
        }
    } else if (process.env.NODE_ENV === 'development') {
        console.log(`[${timestamp}] ${status}:`.yellow, message);
    }
    
    const errorResponse = { error: message };
    
    if (process.env.NODE_ENV === 'development' && error.stack) {
        errorResponse.stack = error.stack;
    }
    
    response.status(status).json(errorResponse);
}

module.exports = errorHandler;
