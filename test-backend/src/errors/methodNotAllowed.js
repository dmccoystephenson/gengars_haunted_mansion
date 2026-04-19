function methodNotAllowed(request, response, next, allowedMethods) {
    console.log(`Method Not Allowed: ${request.method} ${request.originalUrl}`);
    if (allowedMethods) {
        console.log(`Allowed Methods: ${allowedMethods}`);
    }
    next({
        status: 405,
        message: `${request.method} not allowed for ${request.originalUrl}`,
        ...(allowedMethods && { allowedMethods: allowedMethods.join(', ') })
    });
}

module.exports = methodNotAllowed;