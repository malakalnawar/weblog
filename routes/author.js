const express = require("express");
const router = express.Router();
const mw = require('../middleware.js');
const dbq = require('../db-queries.js');
const dateFns = require('date-fns');

/**
 * @desc Handle updating blog information for the logged-in author
 * @route POST /update-blog-info
 * @access Private (requires authentication)
 */
router.post('/update-blog-info', mw.validateBlogInput, (req, res) => {
    const userId = req.session.user ? req.session.user.userId : null; // Retrieve user ID from session if logged in
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in

    // Authenticate author
    mw.authenticateAuthor(userRole, res, () => {
        const { blogTitle, blogSubtitle, displayName } = req.body; // Retrieve blog info from request body

        // Check if blog exists for the user
        dbq.getBlogInfoByUserId(userId, (err, blog) => {
            if (err) {
                console.error('Error retrieving blog info:', err);
                return res.status(500).json({ error: 'Internal server error' });
            }

            if (blog) {
                // Update existing blog information in database
                dbq.updateBlogInfo(userId, blogTitle, blogSubtitle, displayName, (err) => {
                    if (err) {
                        console.error('Error updating blog info:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }
                    return res.status(200).json({ success: true });
                });
            } else {
                // Retrieve author ID and insert new blog if it doesn't exist
                dbq.getAuthorByUserId(userId, (err, authorId) => {
                    if (err) {
                        console.error('Error retrieving author info:', err);
                        return res.status(500).json({ error: 'Internal server error' });
                    }

                    if (!authorId) {
                        return res.status(404).json({ error: 'Author not found' });
                    }

                    dbq.insertBlog(authorId, blogTitle, blogSubtitle, displayName, (err) => {
                        if (err) {
                            console.error('Error inserting blog info:', err);
                            return res.status(500).json({ error: 'Internal server error' });
                        }
                        return res.status(200).json({ success: true });
                    });
                });
            }
        });
    });
});

/**
 * @desc Handle deleting an article by ID
 * @route POST /article/:article_id/article-delete
 * @access Private (requires authentication)
 */
router.post('/article/:article_id/article-delete', (req, res) => {
    const articleId = req.params.article_id; // Retrieve article ID from request parameters
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in

    // Authenticate author
    mw.authenticateAuthor(userRole, res, () => {
        // Delete article from the database
        dbq.deleteArticleById(articleId, (err) => {
            if (err) {
                console.error('Error deleting article:', err);
                return res.status(500).send('500 Internal Server Error');
            }
            res.sendStatus(200); // Send success response
        });
    });
});

/********** dashboard page **********/

/**
 * @desc Displays the dashboard page with user-specific blog information, articles, and drafts
 * @route GET /dashboard
 * @access Private (requires authentication)
 */
router.get('/dashboard', (req, res) => {
    const userId = req.session.user ? req.session.user.userId : null; // Retrieve user ID from session if logged in
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in

    // Authenticate author
    mw.authenticateAuthor(userRole, res, () => {
        // Fetch blog information specific to the logged-in user
        dbq.getBlogInfoByUserId(userId, (err, userBlog) => {
            if (err) {
                console.error('Error fetching user-specific blog information:', err);
                return res.status(500).send('500 Internal Server Error');
            }

            // Fetch all articles by user ID
            dbq.getAllArticlesByUserId(userId, (err, articles) => {
                if (err) {
                    console.error('Error fetching articles with interactions:', err);
                    return res.status(500).send('Internal Server Error');
                }

                // Fetch all drafts by user ID
                dbq.getAllDraftsByUserId(userId, (err, drafts) => {
                    if (err) {
                        console.error('Error fetching drafts:', err);
                        return res.status(500).send('Internal Server Error');
                    }

                    // Render dashboard page with retrieved data
                    res.render('../views/author/dashboard.ejs', { 
                        userBlog: userBlog,
                        session: req.session,
                        articles: articles,
                        drafts: drafts
                    });
                });
            });
        });
    });
});

/**
 * @desc Publishes a draft to the articles table in the database
 * @route POST /dashboard/draft/:draft_id/publish
 * @param {string} draft_id - The ID of the draft to publish
 * @access Private (requires authentication)
 */
router.post('/dashboard/draft/:draft_id/publish', (req, res) => {
    const draftId = req.params.draft_id; // Extract draft ID from URL parameter
    const userId = req.session.user ? req.session.user.userId : null; // Retrieve user ID from session if logged in
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in

    // Authenticate author
    mw.authenticateAuthor(userRole, res, () => {
        // Move draft to articles table in database
        dbq.publishDraft(draftId, userId, (err) => {
            if (err) {
                console.error('Error publishing draft:', err);
                return res.status(500).json({ success: false });
            }
            res.json({ success: true });
        });
    });
});

/**
 * @desc Deletes a draft from the drafts table in the database
 * @route DELETE /dashboard/draft/:draft_id/delete
 * @param {string} draft_id - The ID of the draft to delete
 * @access Private (requires authentication)
 */
router.delete('/dashboard/draft/:draft_id/delete', (req, res) => {
    const draftId = req.params.draft_id; // Extract draft ID from URL parameter
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in

    // Authenticate author
    mw.authenticateAuthor(userRole, res, () => {
        // Delete draft from database
        dbq.deleteDraftById(draftId, (err) => {
            if (err) {
                console.error('Error deleting draft:', err);
                return res.status(500).send('500 Internal Server Error');
            }
            res.sendStatus(200); // Success response
        });
    });
});

//route to delete an article
router.delete('/dashboard/article/:article_id/delete', (req, res) => {
    const articleId = req.params.article_id;
    const userRole = req.session.user ? req.session.user.role : null;

    //authenticate author 
    mw.authenticateAuthor(userRole, res, () => {
        //delete comment from the database
        dbq.deleteArticleById(articleId, (err) => {
            if (err) {
                console.error(err);
                return res.status(500).send('500 Internal Server Error');
            }
            res.sendStatus(200); //success response
        });
    });
});

/********** edit article page **********/

/**
 * @desc Deletes an article from the articles table in the database
 * @route DELETE /dashboard/article/:article_id/delete
 * @param {string} article_id - The ID of the article to delete
 * @access Private (requires authentication)
 */
router.delete('/dashboard/article/:article_id/delete', (req, res) => {
    const articleId = req.params.article_id; // Extract article ID from URL parameter
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in

    // Authenticate author
    mw.authenticateAuthor(userRole, res, () => {
        // Delete article from database
        dbq.deleteArticleById(articleId, (err) => {
            if (err) {
                console.error('Error deleting article:', err);
                return res.status(500).send('500 Internal Server Error');
            }
            res.sendStatus(200); // Success response
        });
    });
});

/**
 * @desc Displays the form to edit an existing article
 * @route GET /dashboard/article/:article_id/edit
 * @param {string} article_id - The ID of the article to edit
 * @access Private (requires authentication)
 */
router.get('/dashboard/article/:article_id/edit', (req, res) => {
    const status = 'Published'; // Default status for editing published articles
    const articleId = req.params.article_id; // Extract article ID from URL parameter
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in

    // Authenticate author
    mw.authenticateAuthor(userRole, res, () => {
        // Load article from database to populate edit form
        dbq.getArticleById(articleId, (err, article) => {
            if (err) {
                console.error('Error loading article:', err);
                return res.status(500).send('500 Internal Server Error');
            }
            if (!article) {
                return res.status(404).send('Article not found');
            }
            // Render edit form with article data, date utilities, and status
            res.render('../views/author/edit.ejs', { article, draft: false, dateFns, status });
        });
    });
});

/**
 * @desc Displays the form to create a new draft article
 * @route GET /dashboard/draft/edit/new-draft
 * @access Private (requires authentication)
 */
router.get('/dashboard/draft/edit/new-draft', (req, res) => {
    const status = 'Draft'; // Status set to 'Draft' for new draft articles
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in
    
    // Authenticate author
    mw.authenticateAuthor(userRole, res, () => {
        // Render edit form for a new draft article, with no initial article data
        res.render('../views/author/edit.ejs', { article: false, draft: false, dateFns, status });
    });
});

/**
 * @desc Handles saving articles or drafts based on type
 * @route POST /dashboard/edit/save
 * @access Private (requires authentication)
 */
router.post('/dashboard/edit/save', mw.validateArticleAndDraftInput, (req, res) => {
    const userId = req.session.user ? req.session.user.userId : null; // Retrieve user ID from session if logged in
    const userRole = req.session.user ? req.session.user.role : null; // Retrieve user role from session if logged in

    const { title, subtitle, content, reference, type } = req.body; // Destructure article/draft data from request body

    // Get current date/time formatted as 'yyyy-MM-dd HH:mm:ss'
    const now = dateFns.format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    // Parse reference into an integer
    const id = parseInt(reference, 10);

    // Authenticate author
    mw.authenticateAuthor(userRole, res, () => {
        if (type === 'article' && id) {
            // Update existing article in the database
            dbq.updateArticleById(id, title, subtitle, content, now, (err) => {
                if (err) {
                    console.error('Error updating article:', err);
                    res.status(500).send('Failed to update article');
                } else {
                    res.sendStatus(200); // Success response
                }
            });
        } else if (type === 'draft' && id) {
            // Update existing draft in the database
            dbq.updateDraftById(id, title, subtitle, content, now, (err) => {
                if (err) {
                    console.error('Error updating draft:', err);
                    res.status(500).send('Failed to update draft');
                } else {
                    res.sendStatus(200); // Success response
                }
            });
        } else if (type === 'draft' && !id) {
            // Fetch blog ID for the logged-in user
            dbq.getBlogInfoByUserId(userId, (err, blog) => {
                if (err || !blog) {
                    console.error('Error retrieving blog info:', err);
                    res.status(500).send('Failed to retrieve blog info');
                } else {
                    // Insert new draft into the database
                    dbq.insertDraft(blog.blog_id, title, subtitle, content, now, (err) => {
                        if (err) {
                            console.error('Error inserting draft:', err);
                            res.status(500).send('Failed to insert draft');
                        } else {
                            res.sendStatus(200); // Success response
                        }
                    });
                }
            });
        } else {
            res.status(400).send('Invalid request');
        }
    });
});

// Export the router object so index.js can access it
module.exports = router;