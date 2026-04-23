const errorHandler = (err, req, res, next) =>{
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Server error';

    //mongoose bad Object Id
    if(err.name === "CastError"){
        message = "Resource not found";
        statusCode = 404;
    }

    //mongoose duplicate key
    if(err.code === 11000){
        const field = Object.keys(err.keyValue)[0];
        message = `${field} already exists`;
        statusCode = 404;
    }

    //mongoose validation error
    if(err.name === "ValidationError"){
        message = Object.values(err.errors).map(val => val.message).join(',');
        statusCode = 404;
    }


    //Multer file size error
    if(err.code === "LIMIT_FILE_SIZE"){
        message = 'File size exceeds the maximum limit of 10MB';
        statusCode = 404;
    }

    //JWT errors
    if(err.name === "JsonWebTokenError"){
        message = "Invalid Token";
        statusCode = 404
    }

    if(err.name === "TokenExpiredError"){
        message = "Token expired";
        statusCode = 404;
    }

    console.log('Error', {
        message: err.message,
        stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });

    res.status(statusCode).json({
        success: false,
        error: message,
        statusCode,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

export default errorHandler;