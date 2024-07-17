/**
 * Fetches a user by username.
 * @param {string} username - The username to search for.
 * @param {function} callback - The callback function that handles the result.
 */
const getUserByUsername = (username, callback) => {
    global.db.get('SELECT * FROM Users WHERE username = ?', [username], callback);
};

/**
 * Fetches a user by username or email.
 * @param {string} username - The username to search for.
 * @param {string} email - The email to search for.
 * @param {function} callback - The callback function that handles the result.
 */
const getUserByUsernameOrEmail = (username, email, callback) => {
    global.db.get('SELECT * FROM Users WHERE username = ? OR email = ?', [username, email], callback);
};

/**
 * Inserts a new user into the database.
 * @param {string} username - The username of the user.
 * @param {string} email - The email of the user.
 * @param {string} hashedPassword - The hashed password of the user.
 * @param {string} role - The role of the user.
 * @param {function} callback - The callback function that handles the result.
 */
const insertUser = (username, email, hashedPassword, role, callback) => {
    global.db.run('INSERT INTO Users (username, email, password, role) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, role], callback);
};

/**
 * Delete a user by user ID.
 * @param {number} userId - The ID of the user to delete.
 * @param {function} callback - The callback function that handles the result.
 */
const deleteUserById = (userId, callback) => {
    const deleteUserQuery = 'DELETE FROM Users WHERE user_id = ?';
    global.db.run(deleteUserQuery, [userId], function(err) {
        callback(err);
    });
};

/**
 * Get count of users with role 'admin'.
 * @param {function} callback - The callback function that handles the result.
 */
const getUserRoleCount = (callback) => {
    const query = `SELECT COUNT(*) AS count FROM Users WHERE role = 'admin'`;
    global.db.get(query, callback);
};

/**
 * Insert user into Admins table.
 * @param {number} userId - The user_id to insert into Admins.
 * @param {function} callback - The callback function that handles errors.
 */
const insertIntoAdmins = (userId, callback) => {
    const query = `INSERT INTO Admins (user_id) VALUES (?)`;
    global.db.run(query, [userId], callback);
};

/**
 * Insert user into Authors table.
 * @param {number} userId - The user_id to insert into Authors.
 * @param {function} callback - The callback function that handles errors.
 */
const insertIntoAuthors = (userId, callback) => {
    const query = `INSERT INTO Authors (user_id) VALUES (?)`;
    global.db.run(query, [userId], callback);
};

/**
 * Truncate content to a specified number of words.
 * @param {string} content - The content to be truncated.
 * @param {number} wordsCount - The number of words to truncate to.
 * @returns {string} - The truncated content.
 */
const truncateContent = (content, wordsCount) => {
    const words = content.split(' ');
    if (words.length > wordsCount) {
        return words.slice(0, wordsCount).join(' ') + '...';
    }
    return content;
};

/**
 * Fetch all blogs with their associated articles.
 * @param {function} callback - The callback function to handle the result.
 */
const getAllBlogsAndArticles = (callback) => {
    const query = `
        SELECT 
            Blogs.blog_id,
            Blogs.title AS blog_title,
            Blogs.subtitle,
            Blogs.display_name,
            Articles.article_id,
            Articles.title AS article_title,
            Articles.content,
            Articles.created_at
        FROM Blogs
        LEFT JOIN Articles ON Blogs.blog_id = Articles.blog_id
        ORDER BY Blogs.blog_id, Articles.created_at DESC
    `;
    global.db.all(query, (err, rows) => {
        if (err) {
            return callback(err);
        }

        const blogs = {};
        rows.forEach(row => {
            if (!blogs[row.blog_id]) {
                blogs[row.blog_id] = {
                    blog_title: row.blog_title,
                    subtitle: row.subtitle,
                    display_name: row.display_name,
                    articles: []
                };
            }
            if (row.article_id) {
                const truncatedContent = truncateContent(row.content, 15); // Truncate content to first 15 words
                blogs[row.blog_id].articles.push({
                    article_id: row.article_id,
                    title: row.article_title,
                    content: truncatedContent,
                    created_at: row.created_at // Include created_at
                });
            }
        });

        // Filter out blogs with no articles
        const filteredBlogs = Object.values(blogs).filter(blog => blog.articles.length > 0);

        callback(null, filteredBlogs);
    });
};

/**
 * Fetch blog information by user ID.
 * @param {number} userId - The user's ID to look up blogs.
 * @param {function} callback - The callback function to handle the result.
 */
const getBlogInfoByUserId = (userId, callback) => {
    const query = `
        SELECT 
            Blogs.blog_id,
            Blogs.title,
            Blogs.subtitle,
            Blogs.display_name
        FROM Blogs
        LEFT JOIN Authors ON Blogs.author_id = Authors.author_id
        WHERE Authors.user_id = ?
    `;
    global.db.get(query, [userId], (err, row) => {
        if (err) {
            return callback(err);
        }
        callback(null, row);
    });
};

/**
 * Fetch article by its ID.
 * @param {number} articleId - The ID of the article to fetch.
 * @param {function} callback - The callback function to handle the result.
 */
const getArticleById = (articleId, callback) => {
    const query = `
        SELECT 
            Articles.*, 
            (SELECT COUNT(*) FROM Interactions WHERE article_id = Articles.article_id AND liked = 1) AS likes,
            (SELECT COUNT(*) FROM Interactions WHERE article_id = Articles.article_id AND viewed = 1) AS views
        FROM Articles
        WHERE Articles.article_id = ?
    `;
    db.get(query, [articleId], (err, row) => {
        if (err) {
            callback(err);
        } else {
            callback(null, row);
        }
    });
};

/**
 * Fetch comments by article ID.
 * @param {number} articleId - The ID of the article to fetch its comments.
 * @param {function} callback - The callback function to handle the result.
 */
const getCommentsByArticleId = (articleId, callback) => {
    const query = `
        SELECT 
            Comments.comment_id, Comments.content, Comments.created_at, 
            Users.username 
        FROM Comments
        JOIN Users ON Comments.user_id = Users.user_id
        WHERE Comments.article_id = ?
        ORDER BY Comments.created_at ASC
    `;
    global.db.all(query, [articleId], (err, rows) => {
        if (err) {
            callback(err);
        } else {
            callback(null, rows);
        }
    });
};

/**
 * Delete a comment by comment ID.
 * @param {number} commentId - The ID of the comment to delete.
 * @param {function} callback - The callback function to handle the result.
 */
const deleteCommentById = (commentId, callback) => {
    const query = 'DELETE FROM Comments WHERE comment_id = ?';
    global.db.run(query, [commentId], function(err) {
        callback(err);
    });
};

/**
 * Delete an article by article ID.
 * @param {number} articleId - The ID of the article to delete.
 * @param {function} callback - The callback function to handle the result.
 */
const deleteArticleById = (articleId, callback) => {
    const query = 'DELETE FROM Articles WHERE article_id = ?';
    global.db.run(query, [articleId], function(err) {
        callback(err);
    });
};

/**
 * Fetch interaction status (liked/viewed) by user and article ID.
 * @param {number} userId - The ID of the user.
 * @param {number} articleId - The ID of the article.
 * @param {function} callback - The callback function to handle the result.
 */
const getInteractionByUserId = (userId, articleId, callback) => {
    const query = `SELECT * FROM Interactions WHERE user_id = ? AND article_id = ?`;
    global.db.get(query, [userId, articleId], (err, row) => {
        if (err) {
            return callback(err);
        } 
        if (!row) {
            row = { liked: 0, viewed: 0 }; // Default values if no interaction is found
        }
        callback(null, row);
    });
};

/**
 * Fetch interaction counts (likes/views) for an article.
 * @param {number} articleId - The ID of the article.
 * @param {function} callback - The callback function to handle the result.
 */
const getInteractionsByArticleId = (articleId, callback) => {
    const query = `
        SELECT 
            COUNT(CASE WHEN liked = 1 THEN 1 END) AS likes, 
            COUNT(CASE WHEN viewed = 1 THEN 1 END) AS views 
        FROM Interactions 
        WHERE article_id = ?
    `;
    global.db.get(query, [articleId], (err, row) => {
        if (err) {
            return callback(err);
        }
        callback(null, row);
    });
};

/**
 * Add a view to an article.
 * @param {number} articleId - The ID of the article.
 * @param {number} userId - The ID of the user viewing the article.
 * @param {function} callback - The callback function to handle the result.
 */
const addView = (articleId, userId, callback) => {
    const query = `
        INSERT INTO Interactions (article_id, user_id, viewed) 
        VALUES (?, ?, 1)
        ON CONFLICT(user_id, article_id)
        DO UPDATE SET viewed = 1, updated_at = CURRENT_TIMESTAMP
    `;
    global.db.run(query, [articleId, userId], function(err) {
        callback(err);
    });
};

/**
 * Toggle like status for an article by a user.
 * @param {number} articleId - The ID of the article.
 * @param {number} userId - The ID of the user liking/unliking the article.
 * @param {function} callback - The callback function to handle the result.
 */
const toggleLike = (articleId, userId, callback) => {
    if (!userId || !articleId) {
        return callback(new Error('Invalid userId or articleId'));
    }
    // Fetch user interaction (liked) status
    getInteractionByUserId(userId, articleId, (err, interaction) => {
        if (err) {
            return callback(err);
        }

        let query;
        let liked;
        if (interaction && interaction.liked) {
            // Unlike the article
            query = `
                UPDATE Interactions
                SET liked = 0, updated_at = CURRENT_TIMESTAMP
                WHERE article_id = ? AND user_id = ?
            `;
            liked = false;
        } else {
            // Like the article
            query = `
                INSERT INTO Interactions (article_id, user_id, liked, viewed) 
                VALUES (?, ?, 1, 1)
                ON CONFLICT(user_id, article_id)
                DO UPDATE SET liked = 1, viewed = 1, updated_at = CURRENT_TIMESTAMP
            `;
            liked = true;
        }
        global.db.run(query, [articleId, userId], function(err) {
            if (err) {
                return callback(err);
            }
            callback(null, { liked });
        });
    });
};

/**
 * Add comment to the database
 * @param {number} articleId - The ID of the article to add the comment to
 * @param {number} userId - The ID of the user posting the comment
 * @param {string} content - The content of the comment
 * @param {function} callback - The callback function to handle the result or error
 */
const addComment = (articleId, userId, content, callback) => {
    const query = `
        INSERT INTO Comments (article_id, user_id, content)
        VALUES (?, ?, ?)
    `;
    global.db.run(query, [articleId, userId, content], function(err) {
        if (err) {
            callback(err);
        } else {
            callback(null);
        }
    });
};

/**
 * Fetch all articles with interaction counts (likes and views).
 * @param {function} callback - The callback function to handle the result or error
 */
const getAllArticles = (callback) => {
    const query = `
        SELECT 
            a.article_id,
            a.title,
            a.created_at,
            a.updated_at,
            COUNT(CASE WHEN i.liked = 1 THEN 1 END) AS likes, 
            COUNT(CASE WHEN i.viewed = 1 THEN 1 END) AS views
        FROM 
            Articles a
        LEFT JOIN 
            Interactions i ON a.article_id = i.article_id
        GROUP BY 
            a.article_id;
    `;
    global.db.all(query, [], (err, rows) => {
        if (err) {
            callback(err);
        } else {
            callback(null, rows);
        }
    });
};

/**
 * Fetch all articles authored by a specific user with interaction counts.
 * @param {number} userId - The ID of the user to fetch articles for
 * @param {function} callback - The callback function to handle the result or error
 */
const getAllArticlesByUserId = (userId, callback) => {
    const query = `
        SELECT 
            a.article_id,
            a.title,
            a.created_at,
            a.updated_at,
            COUNT(CASE WHEN i.liked = 1 THEN 1 END) AS likes, 
            COUNT(CASE WHEN i.viewed = 1 THEN 1 END) AS views
        FROM 
            Articles a
        LEFT JOIN 
            Interactions i ON a.article_id = i.article_id
        JOIN 
            Blogs b ON a.blog_id = b.blog_id
        JOIN 
            Authors au ON b.author_id = au.author_id
        WHERE 
            au.user_id = ?
        GROUP BY 
            a.article_id;
    `;
    global.db.all(query, [userId], (err, rows) => {
        if (err) {
            callback(err);
        } else {
            callback(null, rows);
        }
    });
};

/**
 * Fetch all drafts by user id.
 * @param {number} userId - The ID of the user to fetch drafts for
 * @param {function} callback - The callback function to handle the result or error
 */
const getAllDraftsByUserId = (userId, callback) => {
    const query = `
        SELECT 
            d.draft_id,
            d.title,
            d.created_at,
            d.updated_at
        FROM 
            Drafts d
        JOIN 
            Blogs b ON d.blog_id = b.blog_id
        JOIN 
            Authors au ON b.author_id = au.author_id
        WHERE 
            au.user_id = ?
        GROUP BY 
            d.draft_id;
    `;
    global.db.all(query, [userId], (err, rows) => {
        if (err) {
            callback(err);
        } else {
            callback(null, rows);
        }
    });
};

/**
 * Publish a draft by moving it to the Articles table and deleting it from the Drafts table.
 * @param {number} draftId - The ID of the draft to publish
 * @param {number} userId - The ID of the user attempting to publish the draft
 * @param {function} callback - The callback function to handle the result or error
 */
const publishDraft = (draftId, userId, callback) => {
    const queryGetDraft = `
        SELECT 
            d.blog_id, 
            d.title, 
            d.subtitle, 
            d.content 
        FROM 
            Drafts d
        JOIN 
            Blogs b ON d.blog_id = b.blog_id
        JOIN 
            Authors au ON b.author_id = au.author_id
        WHERE 
            d.draft_id = ? AND au.user_id = ?
    `;

    global.db.get(queryGetDraft, [draftId, userId], (err, draft) => {
        if (err) {
            return callback(err);
        }
        if (!draft) {
            return callback(new Error('Draft not found or user does not have permission'));
        }

        const queryInsertArticle = `
            INSERT INTO Articles (blog_id, title, subtitle, content, created_at, updated_at)
            VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;

        global.db.run(queryInsertArticle, [draft.blog_id, draft.title, draft.subtitle, draft.content], function(err) {
            if (err) {
                return callback(err);
            }

            const queryDeleteDraft = `
                DELETE FROM Drafts WHERE draft_id = ?
            `;

            global.db.run(queryDeleteDraft, [draftId], (err) => {
                if (err) {
                    return callback(err);
                }
                callback(null);
            });
        });
    });
};

/**
 * Delete a draft by draftId.
 * @param {number} draftId - The ID of the draft to delete
 * @param {function} callback - The callback function to handle the result or error
 */
const deleteDraftById = (draftId, callback) => {
    const queryDeleteDraft = `DELETE FROM Drafts WHERE draft_id = ?`;

    global.db.run(queryDeleteDraft, [draftId], (err) => {
        if (err) {
            return callback(err);
        }
        callback(null);
    });
};

/**
 * Update blog information.
 * @param {number} userId - The ID of the user whose blog is being updated
 * @param {string} blogTitle - The updated title for the blog
 * @param {string} blogSubtitle - The updated subtitle for the blog
 * @param {string} displayName - The updated display name for the blog
 * @param {function} callback - The callback function to handle the result or error
 */
const updateBlogInfo = (userId, blogTitle, blogSubtitle, displayName, callback) => {
    const queryUpdateBlog = `
        UPDATE Blogs
        SET title = ?, subtitle = ?, display_name = ?
        WHERE blog_id = (
            SELECT blog_id
            FROM Blogs
            WHERE author_id = (
                SELECT author_id
                FROM Authors
                WHERE user_id = ?
            )
        )
    `;

    global.db.run(queryUpdateBlog, [blogTitle, blogSubtitle, displayName, userId], (err) => {
        if (err) {
            return callback(err);
        }
        callback(null);
    });
};

/**
 * Insert a new blog.
 * @param {number} authorId - The ID of the author creating the blog
 * @param {string} blogTitle - The title of the new blog
 * @param {string} blogSubtitle - The subtitle of the new blog
 * @param {string} displayName - The display name for the new blog
 * @param {function} callback - The callback function to handle the result or error
 */
function insertBlog(authorId, blogTitle, blogSubtitle, displayName, callback) {
    const query = `
        INSERT INTO Blogs
        (author_id, title, subtitle, display_name)
        VALUES (?, ?, ?, ?)
    `;

    global.db.run(query, [authorId, blogTitle, blogSubtitle, displayName], callback);
};

/**
 * Load a draft by draftId.
 * @param {number} draftId - The ID of the draft to load
 * @param {function} callback - The callback function to handle the result or error
 */
function loadDraftById(draftId, callback) {
    const query = `
        SELECT * FROM Drafts
        WHERE draft_id = ?
    `;
    global.db.get(query, [draftId], callback);
}

/**
 * Update a draft by draftId.
 * @param {number} draftId - The ID of the draft to update
 * @param {string} title - The updated title for the draft
 * @param {string} subtitle - The updated subtitle for the draft
 * @param {string} content - The updated content for the draft
 * @param {string} updated_at - The updated timestamp for the draft
 * @param {function} callback - The callback function to handle the result or error
 */
function updateDraftById(draftId, title, subtitle, content, updated_at, callback) {
    const query = `
        UPDATE Drafts
        SET title = ?, subtitle = ?, content = ?, updated_at = ?
        WHERE draft_id = ?
    `;
    global.db.run(query, [title, subtitle, content, updated_at, draftId], callback);
}

/**
 * Insert a new draft.
 * @param {number} blogId - The ID of the blog to which the draft belongs
 * @param {string} title - The title of the new draft
 * @param {string} subtitle - The subtitle of the new draft
 * @param {string} content - The content of the new draft
 * @param {string} created_at - The creation timestamp for the new draft
 * @param {function} callback - The callback function to handle the result or error
 */
function insertDraft(blogId, title, subtitle, content, created_at, callback) {
    const query = `
        INSERT INTO Drafts (blog_id, title, subtitle, content, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?)
    `;
    global.db.run(query, [blogId, title, subtitle, content, created_at, created_at], callback);
}

/**
 * Update an article by articleId.
 * @param {number} articleId - The ID of the article to update
 * @param {string} title - The updated title for the article
 * @param {string} subtitle - The updated subtitle for the article
 * @param {string} content - The updated content for the article
 * @param {string} updated_at - The updated timestamp for the article
 * @param {function} callback - The callback function to handle the result or error
 */
function updateArticleById(articleId, title, subtitle, content, updated_at, callback) {
    const query = `
        UPDATE Articles
        SET title = ?, subtitle = ?, content = ?, updated_at = ?
        WHERE article_id = ?
    `;
    global.db.run(query, [title, subtitle, content, updated_at, articleId], callback);
}

/**
 * Get author ID by user ID.
 * @param {number} userId - The ID of the user to retrieve the author ID for
 * @param {function} callback - The callback function to handle the result or error
 */
function getAuthorByUserId(userId, callback) {
    const query = `SELECT author_id FROM Authors WHERE user_id = ?`;
    global.db.get(query, [userId], (err, row) => {
        if (err) {
            return callback(err);
        }
        callback(null, row ? row.author_id : null);
    });
}

/**
 * Get all users excluding 'admin' and 'author' roles.
 * @param {function} callback - The callback function to handle the result or error
 */
function getAllUsers(callback) {
    const query = `
        SELECT * FROM Users 
        WHERE role NOT IN ('admin', 'author')
    `;
    global.db.all(query, [], (err, rows) => {
        if (err) {
            return callback(err);
        }
        callback(null, rows);
    });
}

/**
 * Get all authors with user information.
 * @param {function} callback - The callback function to handle the result or error
 */
function getAllAuthors(callback) {
    const query = `
        SELECT Users.user_id, Users.username, Users.email, Users.role, Authors.author_id
        FROM Users
        INNER JOIN Authors ON Users.user_id = Authors.user_id
    `;
    global.db.all(query, [], (err, rows) => {
        if (err) {
            return callback(err);
        }
        callback(null, rows);
    });
}

/**
 * Get all admins with user information.
 * @param {function} callback - The callback function to handle the result or error
 */
function getAllAdmins(callback) {
    const query = `
        SELECT Users.user_id, Users.username, Users.email, Users.role, Admins.admin_id
        FROM Users
        INNER JOIN Admins ON Users.user_id = Admins.user_id
    `;
    global.db.all(query, [], (err, rows) => {
        if (err) {
            return callback(err);
        }
        callback(null, rows);
    });
}

/**
 * Set a user as an author by updating their role and inserting into Authors table.
 * @param {number} userId - The ID of the user to set as author
 * @param {function} callback - The callback function to handle the result or error
 */
function setUserAsAuthor(userId, callback) {
    const updateUserRoleQuery = `UPDATE Users SET role = 'author' WHERE user_id = ?`;
    const insertAuthorQuery = `INSERT INTO Authors (user_id) VALUES (?)`;

    global.db.run(updateUserRoleQuery, [userId], function (err) {
        if (err) {
            return callback(err);
        }

        global.db.run(insertAuthorQuery, [userId], function (err) {
            if (err) {
                return callback(err);
            }

            callback(null); // Successful completion
        });
    });
}

module.exports = {
    getUserByUsername,
    getUserByUsernameOrEmail,
    insertUser,
    deleteUserById,
    getUserRoleCount,
    insertIntoAdmins,
    insertIntoAuthors,
    getAllBlogsAndArticles,
    getBlogInfoByUserId,
    getArticleById,
    getCommentsByArticleId,
    deleteCommentById,
    deleteArticleById,
    getInteractionByUserId,
    getInteractionsByArticleId,
    addView,
    toggleLike,
    addComment,
    getAllArticles,
    getAllArticlesByUserId,
    getAllDraftsByUserId,
    publishDraft,
    deleteDraftById,
    updateBlogInfo,
    loadDraftById,
    updateDraftById,
    insertDraft,
    updateArticleById,
    insertBlog,
    getAuthorByUserId,
    getAllUsers, //not authors or admins
    getAllAuthors,
    getAllAdmins,
    setUserAsAuthor
};