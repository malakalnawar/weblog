const express = require("express");
const router = express.Router();
const path = require('path');
const argon2 = require('argon2');
const mw = require('../middleware.js');
const dbq = require('../db-queries.js');
const dateFns = require('date-fns');

/********** Routes **********/

/********** Delete Account **********/

/**
 * @desc Handles user deletion
 * @route POST /user-delete
 * @access Private
 */
router.post('/user-delete', (req, res) => {
    // Check if user is authenticated
    if (!req.session.user.userId) {
        // Return 401 Unauthorized if user is not authenticated
        return res.status(401).send('401 Unauthorized');
    }

    // Extract userId from the session
    const userId = req.session.user.userId;

    // Attempt to delete the user from the database
    dbq.deleteUserById(userId, (err) => {
        if (err) {
            // Handle database error
            console.error(err);
            return res.status(500).send('500 Internal Server Error');
        }

        // Destroy the session after successfully deleting the user
        req.session.destroy(err => {
            if (err) {
                // Handle session destruction error
                console.error(err);
                return res.status(500).send('500 Internal Server Error');
            }
            // Send a success response after successful deletion and session destruction
            res.sendStatus(200);
        });
    });
});

/********** Logout **********/

/**
 * @desc Handles user logout
 * @route POST /logout
 * @access Public
 */
router.post('/logout', (req, res) => {
    // Destroy the session
    req.session.destroy(err => {
        if (err) {
            // Handle session destruction error
            console.error(err);
            return res.status(500).send('500 Internal Server Error: Logout failed');
        }
        // Send a success response after successfully logging out
        res.sendStatus(200);
    });
});

/********** Login page **********/

/**
 * @desc Displays the login page as the default route
 * @route GET /
 * @access Public
 */
router.get('/', (req, res) => {
    // Serve the login.html file located in the views/public directory
    res.sendFile(path.join(__dirname, '../views/public/login.html'));
});

/**
 * @desc Handles login form submission
 * @route POST /user-login
 * @access Public
 */
router.post('/user-login', [
    mw.validateLoginInput, // Middleware to validate user input and handle errors
], async (req, res) => {
    const { username, password } = req.body;
    try {
        // Fetch user from database
        dbq.getUserByUsername(username, async (err, row) => {
            if (err || !row) {
                // Return unauthorized if user doesn't exist or there's an error
                return res.status(401).send('401 Unauthorized: Invalid username');
            }
            // Verify password
            mw.verifyPassword(row.password, password, res, async () => {
                // Create session after password verification
                mw.createSession(req, row.username, row.role, row.user_id, () => {
                    // Redirect user to the home page upon successful login
                    res.redirect('/home');
                });
            });
        });
    } catch (err) {
        // Handle any errors during the login process
        console.error('Error during login:', err);
        res.status(500).send('500 Internal Server Error');
    }
});

/**
 * @desc Handles 'continue as guest' request
 * @route GET /guest-login
 * @access Public
 */
router.get('/guest-login', (req, res) => {
    // Redirects guest user to the home page
    res.redirect('/home');
});

/********** Sign up page **********/

/**
 * @desc Displays the sign up page
 * @route GET /signup
 * @access Public
 */
router.get('/signup', (req, res) => {
    // Sends the sign-up HTML file located in the views/public directory
    res.sendFile(path.join(__dirname, '../views/public/signup.html'));
});

/**
 * @desc Handles sign up form submission
 * @route POST /user-signup
 * @access Public
 */
router.post('/user-signup', [
    mw.validateSignUpInput, // Middleware: Validates user input and handles errors
    mw.setUserRole // Middleware: Set user role to 'user' (first user role is set to 'admin' if database is new/empty)
], async (req, res) => {
    const { username, email, password, role } = req.body;
    try {
        // Check if username or email already exists in the database
        const existingUser = await new Promise((resolve, reject) => {
            dbq.getUserByUsernameOrEmail(username, email, (err, row) => {
                if (err) {
                    console.error(err);
                    return reject('500 Internal Server Error: Database error');
                }
                resolve(row);
            });
        });

        if (existingUser) {
            return res.status(400).send('400 Bad Request: Username or email already exists');
        }

        // Hash the password using argon2
        const hashedPassword = await argon2.hash(password);

        // Insert user into database with hashed password
        dbq.insertUser(username, email, hashedPassword, role, function(err) {
            if (err) {
                console.error(err);
                return res.status(500).send('500 Internal Server Error: Error creating user');
            }

            // Create session for the new user
            mw.createSession(req, username, role, this.lastID, () => {
                res.redirect('/home'); // Redirect to home page after successful sign-up
            });

            // If user is new 'admin'
            if (role === 'admin') {
                // Insert into admins table
                dbq.insertIntoAdmins(this.lastID, (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Failed to add user to Admins table');
                    }
                });

                // Insert into authors table
                dbq.insertIntoAuthors(this.lastID, (err) => {
                    if (err) {
                        console.error(err);
                        return res.status(500).send('Failed to add user to Authors table');
                    }
                });
            }
        });
    } catch (err) {
        console.error('Error during sign-up:', err);
        res.status(500).send('500 Internal Server Error');
    }
});

/********** Home page **********/

/**
 * @desc Displays the home page with authors and their articles
 * @route GET /home
 * @access Public
 */
router.get('/home', (req, res) => {
    const userId = req.session.user ? req.session.user.userId : null; // Retrieve user ID from session if logged in
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in

    // Fetch all blogs and their articles from the database
    dbq.getAllBlogsAndArticles((err, allBlogs) => {
        if (err) {
            console.error('Error fetching all blogs and articles:', err);
            return res.status(500).send('500 Internal Server Error');
        }

        // If user is admin or author, fetch blog information specific to the logged-in user
        if (userRole === 'admin' || userRole === 'author') {
            dbq.getBlogInfoByUserId(userId, (err, userBlog) => {
                if (err) {
                    console.error('Error fetching user-specific blog information:', err);
                    return res.status(500).send('500 Internal Server Error');
                }
                // Render the home page template with all blogs, user-specific blog, and session information
                res.render('../views/public/home.ejs', { allBlogs: allBlogs, userBlog: userBlog, session: req.session });
            });
        } else {
            // Render the home page template with all blogs, no user-specific blog, and session information
            res.render('../views/public/home.ejs', { allBlogs: allBlogs, userBlog: null, session: req.session });
        }
    });
});

/********** Article page **********/

/**
 * @desc Displays the article page
 * @route GET /article/:article_id
 * @param {string} article_id - The ID of the article to display
 * @access Public
 */
router.get('/article/:article_id', (req, res) => {
    const userId = req.session.user ? req.session.user.userId : null; // Retrieve user ID from session if logged in
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in
    const articleId = req.params.article_id; // Retrieve article ID from request parameters

    // Fetch article details from the database based on articleId
    dbq.getArticleById(articleId, (err, article) => {
        if (err) {
            console.error('Error fetching article:', err);
            return res.status(500).send('500 Internal Server Error');
        }
        if (!article) {
            return res.status(404).send('Article not found');
        }

        // Fetch comments for article from database
        dbq.getCommentsByArticleId(articleId, (err, comments) => {
            if (err) {
                console.error('Error retrieving comments:', err);
                return res.status(500).send('Error retrieving comments.');
            }

            // Fetch interactions (likes, shares, etc.) for article
            dbq.getInteractionsByArticleId(articleId, (err, interactions) => {
                if (err) {
                    console.error('Error retrieving interactions:', err);
                    return res.status(500).send('Error retrieving interactions.');
                }

                // Fetch user interaction (liked status) for the article
                dbq.getInteractionByUserId(userId, articleId, (err, userInteraction) => {
                    if (err) {
                        console.error('Error retrieving user interaction:', err);
                        return res.status(500).send('Error retrieving user interaction.');
                    }

                    // Function to render the article page with retrieved data
                    const renderArticle = (userBlog) => {
                        res.render('../views/public/article.ejs', { 
                            article,            // Pass fetched article details
                            dateFns,            // Pass date-fns for date formatting in the view
                            session: req.session,   // Pass session data for user authentication status
                            comments,           // Pass fetched comments for the article
                            userLiked: userInteraction ? userInteraction.liked : false,   // Pass user liked status for article
                            userBlog,           // Pass user blog information if available
                            interactions        // Pass fetched interactions (likes, shares, etc.) for the article
                        });
                    };

                    // Fetch blog information specific to the logged-in user if they are admin or author
                    if (userRole === 'admin' || userRole === 'author') {
                        dbq.getBlogInfoByUserId(userId, (err, userBlog) => {
                            if (err) {
                                console.error('Error fetching user-specific blog information:', err);
                                return res.status(500).send('500 Internal Server Error');
                            }
                            renderArticle(userBlog); // Render article page with user-specific blog information
                        });
                    } else {
                        renderArticle(null); // Render article page without user-specific blog information
                    }
                });
            });
        });
    });

    // Mark that user has viewed article if user exists 
    if (userId != null) {
        dbq.addView(articleId, userId, (err) => {
            if (err) {
                console.error('Error adding view to article:', err);
            }
        });
    }
});

/**
 * @desc Like or unlike an article
 * @route POST /article/:article_id/like
 * @param {string} article_id - The ID of the article to like/unlike
 * @access Private (requires authentication)
 */
router.post('/article/:article_id/like', (req, res) => {
    const articleId = req.params.article_id; // Retrieve article ID from request parameters
    const userId = req.session.user ? req.session.user.userId : null; // Retrieve user ID from session if logged in

    // Check if user is authenticated
    if (userId === null) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    // Toggle like for the article in the database
    dbq.toggleLike(articleId, userId, (err, result) => {
        if (err) {
            console.error('Error toggling like:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(result); // Return result of toggle operation (e.g., updated like status)
    });
});

/**
 * @desc Handle comment submission for an article
 * @route POST /article/:article_id/comment
 * @param {string} article_id - The ID of the article to comment on
 * @access Private (requires authentication)
 */
router.post('/article/:article_id/comment', mw.validateCommentInput, (req, res) => {
    const userId = req.session.user ? req.session.user.userId : null; // Retrieve user ID from session if logged in
    const articleId = req.params.article_id; // Retrieve article ID from request parameters
    const content = req.body.content; // Retrieve comment content from request body

    // Check if user is authenticated
    if (!userId) {
        return res.status(401).json({ error: 'User not authenticated' });
    }

    // Insert comment into database
    dbq.addComment(articleId, userId, content, (err) => {
        if (err) {
            console.error('Error adding comment:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        // Respond with success
        res.json({ success: true });
    });
});

// Export the router object so index.js can access it
module.exports = router;