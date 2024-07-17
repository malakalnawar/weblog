const express = require("express");
const router = express.Router();
const mw = require('../middleware.js');
const dbq = require('../db-queries.js');

/**
 * @desc Displays the accounts page
 * @route GET /accounts
 * @access Private (requires authentication and admin role)
 */
router.get('/accounts', (req, res) => {
    const userId = req.session.user ? req.session.user.userId : null; // Retrieve user ID from session if logged in
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in

    // Authenticate admin
    mw.authenticateAdmin(userRole, res, () => {
        // Fetch all admins
        dbq.getAllAdmins((err, admins) => {
            if (err) {
                console.error('Error fetching admins:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            // Fetch all authors
            dbq.getAllAuthors((err, authors) => {
                if (err) {
                    console.error('Error fetching authors:', err);
                    return res.status(500).json({ error: 'Internal server error' });
                }

                // Fetch all users
                dbq.getAllUsers((err, users) => {
                    if (err) {
                        console.error('Error fetching users:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    // Fetch blog information specific to the logged-in user
                    dbq.getBlogInfoByUserId(userId, (err, userBlog) => {
                        if (err) {
                            console.error('Error fetching user-specific blog information:', err);
                            return res.status(500).send('500 Internal Server Error');
                        }

                        // Render the accounts page with fetched data
                        res.render('../views/admin/accounts.ejs', {
                            admins: admins,
                            authors: authors,
                            users: users,
                            userBlog: userBlog,
                            session: req.session
                        });
                    });
                });
            });
        });
    });
});

/**
 * @desc Promotes a user to the role of author
 * @route POST /account/user/:user_id/set-as-author
 * @access Private (requires authentication and admin role)
 */
router.post('/account/user/:user_id/set-as-author', (req, res) => {
    const moveId = req.params.user_id; // Extract user ID from request parameters
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in
    
    // Authenticate admin
    mw.authenticateAdmin(userRole, res, () => {
        // Set user role to 'author' and add them to author table in database
        dbq.setUserAsAuthor(moveId, (err) => {
            if (err) {
                console.error('Error promoting user to author:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }
            res.sendStatus(200); // Success response
        });
    });
});

/**
 * @desc Deletes a user from the database
 * @route DELETE /account/user/:user_id/delete
 * @access Private (requires authentication and admin role)
 */
router.delete('/account/user/:user_id/delete', (req, res) => {
    const deleteId = req.params.user_id; // Extract user ID from request parameters
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in
    
    // Authenticate admin
    mw.authenticateAdmin(userRole, res, () => {
        // Delete user from the database
        dbq.deleteUserById(deleteId, (err) => {
            if (err) {
                console.error('Error deleting user:', err);
                return res.status(500).send('500 Internal Server Error');
            }
            res.sendStatus(200); // Success response
        });
    });
});

/**
 * @desc Deletes a comment from the database
 * @route POST /article/comment-delete/:comment_id
 * @access Private (requires authentication and admin role)
 */
router.post('/article/comment-delete/:comment_id', (req, res) => {
    const deleteId = req.params.comment_id; // Extract comment ID from request parameters
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in
    
    // Authenticate admin
    mw.authenticateAdmin(userRole, res, () => {
        // Delete comment from the database
        dbq.deleteCommentById(deleteId, (err) => {
            if (err) {
                console.error('Error deleting comment:', err);
                return res.status(500).send('500 Internal Server Error');
            }
            res.sendStatus(200); // Success response
        });
    });
});

// Export the router object so index.js can access it
module.exports = router;