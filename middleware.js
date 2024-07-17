const dbq = require('./db-queries.js');
const { body, validationResult } = require('express-validator');

const bcrypt = require('bcrypt');

/**
 * Middleware for verifying password using bcrypt.
 * @param {string} hashedPassword - The hashed password stored in the database.
 * @param {string} password - The password provided by the user for verification.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const verifyPassword = async (hashedPassword, password, res, next) => {
    try {
        // Compare the provided password with the hashed password from the database
        const passwordMatch = await bcrypt.compare(password, hashedPassword);
        
        if (!passwordMatch) {
            return res.status(401).send('401 Unauthorized: Invalid password');
        }
        
        // If password matches, proceed to the next middleware
        next();
    } catch (error) {
        console.error('Error during password verification:', error);
        return res.status(500).send('500 Internal Server Error: Could not verify password');
    }
};

/**
 * Creates a session for the user.
 * @param {Object} req - The request object.
 * @param {string} username - The username of the user.
 * @param {string} role - The role of the user.
 * @param {number} userId - The user ID.
 * @param {Function} next - The next middleware function.
 */
const createSession = (req, username, role, userId, next) => {
    req.session.user = {
        userId: userId,
        username: username,
        role: role
    };
    next();
};

/**
 * Middleware for handling validation errors.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg).join(', ');
        return res.status(400).send(`Input Error(s): ${errorMessages}`);
    }
    next();
};

/**
 * Middleware for validating user login input.
 */
const validateLoginInput = [
    body('username').trim().isLength({ min: 4 }).escape(),
    body('password').trim().isLength({ min: 4 }).escape(),
    handleValidationErrors // Handle validation errors
];

/**
 * Middleware for validating user signup input.
 */
const validateSignUpInput = [
    body('username').notEmpty().trim().escape().isLength({ min: 4 }),
    body('email').normalizeEmail().isEmail(),
    body('password').notEmpty().trim().isLength({ min: 4 }),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),
    handleValidationErrors // Handle validation errors
];

/**
 * Middleware for validating blog update input.
 */
const validateBlogInput = [
    body('blogTitle').trim().isLength({ min: 1 }).escape().withMessage('Blog title is required'),
    body('blogSubtitle').trim().isLength({ min: 1 }).escape().withMessage('Blog subtitle is required'),
    body('displayName').trim().isLength({ min: 1 }).escape().withMessage('Display name is required'),
    handleValidationErrors // Handle validation errors
];

/**
 * Middleware for validating article/draft update input.
 */
const validateArticleAndDraftInput = [
    body('title').trim().isLength({ min: 1 }).escape().withMessage('Title is required'),
    body('subtitle').trim().isLength({ min: 1 }).escape().withMessage('Subtitle is required'),
    body('content').trim().isLength({ min: 1 }).escape().withMessage('Body is required'),
    handleValidationErrors // Handle validation errors
];

/**
 * Middleware for validating comment input.
 */
const validateCommentInput = [
    body('content')
        .trim()
        .isLength({ max: 500 }).withMessage('Comment is too long. Please limit your comment to 500 characters.')
        .escape(),
    handleValidationErrors
];

/**
 * Middleware to set user role to 'user'.
 * If database is new/empty, first user role is set to 'admin'.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const setUserRole = (req, res, next) => {
    // Call the query function to retrieve count of users with role 'admin'
    dbq.getUserRoleCount((err, row) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }
        
        // Set role in request body based on count
        req.body.role = row.count === 0 ? 'admin' : 'user';

        next();
    });
};

/**
 * Middleware to authenticate as an author.
 * @param {string} userRole - The role of the user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const authenticateAuthor = (userRole, res, next) => {
    if (userRole === 'author' || userRole === 'admin') {
        next();
    } else {
        return res.status(401).send('401 Unauthorized: Access level');
    }
};

/**
 * Middleware to authenticate as an admin.
 * @param {string} userRole - The role of the user.
 * @param {Object} res - The response object.
 * @param {Function} next - The next middleware function.
 */
const authenticateAdmin = (userRole, res, next) => {
    if (userRole === 'admin') {
        next();
    } else {
        return res.status(401).send('401 Unauthorized: Access level');
    }
};

module.exports = {
    verifyPassword,
    createSession,
    handleValidationErrors,
    validateLoginInput,
    validateSignUpInput,
    validateBlogInput,
    validateArticleAndDraftInput,
    validateCommentInput,
    setUserRole,
    authenticateAuthor,
    authenticateAdmin
};