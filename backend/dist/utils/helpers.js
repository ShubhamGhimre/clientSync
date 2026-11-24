export const createPaginationResponse = (data, total, options) => {
    const totalPages = Math.ceil(total / options.limit);
    return {
        data,
        pagination: {
            page: options.page,
            limit: options.limit,
            total,
            totalPages,
            hasNext: options.page < totalPages,
            hasPrev: options.page > 1
        }
    };
};
export const sendSuccessResponse = (res, message, data, statusCode = 200) => {
    res.status(statusCode).json({
        success: true,
        message,
        ...(data && { data })
    });
};
export const sendErrorResponse = (res, message, statusCode = 500, errors) => {
    res.status(statusCode).json({
        success: false,
        message,
        ...(errors && { errors })
    });
};
export const generateSlug = (text) => {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9 -]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
};
export const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
export const sanitizeInput = (input) => {
    return input.trim().replace(/[<>]/g, '');
};
export const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(date);
};
//# sourceMappingURL=helpers.js.map