document.addEventListener('DOMContentLoaded', function() {

    // Show the settings modal (admin/author)
    if (document.getElementById('settingsBtn1')) {
        document.getElementById('settingsBtn1').addEventListener('click', function() {
            // Create a new instance of Bootstrap Modal for settingsModal1 and show it
            var settingsModal = new bootstrap.Modal(document.getElementById('settingsModal1'));
            settingsModal.show();
        });
    }

    // Show the settings modal (users)
    if (document.getElementById('settingsBtn2')) {
        document.getElementById('settingsBtn2').addEventListener('click', function() {
            // Create a new instance of Bootstrap Modal for settingsModal2 and show it
            var settingsModal = new bootstrap.Modal(document.getElementById('settingsModal2'));
            settingsModal.show();
        });
    }

    // Delete admin/author account
    if (document.getElementById('deleteBtn1')) {
        document.getElementById('deleteBtn1').addEventListener('click', function() {
            // Ask for confirmation before proceeding with deletion
            if (confirm('Are you sure you want to delete your account? This will permanently delete all your data.')) {
                // Send a POST request to '/user-delete' to delete the account
                fetch('/user-delete', { method: 'POST' })
                    .then(response => {
                        if (response.ok) {
                            // If deletion is successful, redirect to the login page
                            window.location.href = '/';
                        } else {
                            console.error(response.statusText);
                            alert('Account deletion failed. Please try again.');
                        }
                    })
                    .catch(error => {
                        console.error(error);
                        alert('Account deletion failed. Please try again.');
                    });
            }
        });
    }

    // Delete user account
    if (document.getElementById('deleteBtn2')) {
        document.getElementById('deleteBtn2').addEventListener('click', function() {
            // Ask for confirmation before proceeding with deletion
            if (confirm('Are you sure you want to delete your account? This will permanently delete all your data.')) {
                // Send a POST request to '/user-delete' to delete the account
                fetch('/user-delete', { method: 'POST' })
                    .then(response => {
                        if (response.ok) {
                            // If deletion is successful, redirect to the login page
                            window.location.href = '/';
                            alert('Your account was successfully deleted.');
                        } else {
                            console.error(response.statusText);
                            alert('Account deletion failed. Please try again.');
                        }
                    })
                    .catch(error => {
                        console.error(error);
                        alert('Account deletion failed. Please try again.');
                    });
            }
        });
    }

    // Logout user
    if (document.getElementById('logoutBtn')) {
        document.getElementById('logoutBtn').addEventListener('click', function() {
            // Ask for confirmation before proceeding with logout
            if (confirm('Are you sure you want to log out?')) {
                // Send a POST request to '/logout' to perform logout
                fetch('/logout', { method: 'POST' })
                    .then(response => {
                        if (response.ok) {
                            // If logout is successful, redirect to the login page
                            window.location.href = '/';
                        } else {
                            // If logout fails, log the error and alert the user
                            console.error('Logout failed:', response.statusText);
                            alert('Logout failed. Please try again.');
                        }
                    })
                    .catch(error => {
                        // If there's an error during the request, log the error and alert the user
                        console.error('Logout failed:', error);
                        alert('Logout failed. Please try again.');
                    });
            }
        });
    }

    // Show the login modal
    if (document.getElementById('loginBtn')) {
        document.getElementById('loginBtn').addEventListener('click', function() {
            var loginModal = new bootstrap.Modal(document.getElementById('loginModal'));
            loginModal.show();
        });
    }

    // Delete comment
    if (document.querySelectorAll('.deleteCommentBtn')) {
        document.querySelectorAll('.deleteCommentBtn').forEach(button => {
            button.addEventListener('click', function() {
                const commentId = this.getAttribute('commentId'); // Get the comment ID from the button's attribute
    
                // Ask for confirmation before proceeding with comment deletion
                if (confirm('Are you sure you want to delete this comment?')) {
                    // Send a POST request to delete the comment
                    fetch(`/admin/article/comment-delete/${commentId}`, { method: 'POST' })
                        .then(response => {
                            if (response.ok) {
                                // If deletion is successful, reload the page to reflect changes
                                location.reload();
                            } else {
                                // If deletion fails, alert the user
                                alert('Failed to delete comment. Please try again.');
                            }
                        })
                        .catch(error => {
                            // If there's an error during the request, log the error and alert the user
                            console.error('Error:', error);
                            alert('Failed to delete comment. Please try again.');
                        });
                }
            });
        });
    }

    // Delete article (article page)
    if (document.querySelectorAll('.deleteArticleBtn')) {
        document.querySelectorAll('.deleteArticleBtn').forEach(button => {
            button.addEventListener('click', function() {
                const articleId = this.getAttribute('articleId'); // Get the article ID from the button's attribute
    
                // Ask for confirmation before proceeding with article deletion
                if (confirm('Are you sure you want to delete this article?')) {
                    // Send a POST request to delete the article
                    fetch(`/author/article/${articleId}/article-delete`, { method: 'POST' })
                        .then(response => {
                            if (response.ok) {
                                // If deletion is successful, redirect to the home page
                                window.location.href = '/home';
                            } else {
                                // If deletion fails, alert the user
                                alert('Failed to delete article. Please try again.');
                            }
                        })
                        .catch(error => {
                            // If there's an error during the request, log the error and alert the user
                            console.error('Error:', error);
                            alert('Failed to delete article. Please try again.');
                        });
                }
            });
        });
    }

    // Like button (article page)
    if (document.getElementById('likeBtn')) {
        const likeBtn = document.getElementById('likeBtn'); // Get the like button element
        const likeCount = document.getElementById('likeCount'); // Get the element displaying the like count
        const articleId = likeBtn.getAttribute('articleId'); // Get the article ID from the button's attribute
    
        likeBtn.addEventListener('click', function() {
            fetch(`/article/${articleId}/like`, { method: 'POST' })
                .then(response => {
                    if (response.status === 401) {
                        // If user is not authenticated, redirect to login page
                        alert('You must be logged in to like this article.');
                        window.location.href = '/';
                        return;
                    }
                    return response.json(); // Parse response as JSON
                })
                .then(data => {
                    if (data) {
                        // Update UI based on the response data
                        if (data.liked) {
                            likeBtn.textContent = 'Unlike'; // Change button text to 'Unlike'
                            likeCount.textContent = parseInt(likeCount.textContent) + 1; // Increment like count
                        } else {
                            likeBtn.textContent = 'Like'; // Change button text to 'Like'
                            likeCount.textContent = parseInt(likeCount.textContent) - 1; // Decrement like count
                        }
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert('Failed to update like status. Please try again.'); // Alert user on error
                });
        });
    }

    // Submit comment
    if (document.getElementById('submitCommentBtn')) {
        const submitCommentBtn = document.getElementById('submitCommentBtn'); // Get the submit comment button element
        const articleId = submitCommentBtn.getAttribute('articleId'); // Get the article ID from the button's attribute
    
        submitCommentBtn.addEventListener('click', function() {
            const commentContent = document.getElementById('commentInput').value.trim(); // Get the comment content from input
    
            // Validate comment content
            if (commentContent === '') {
                alert('Please enter your comment.');
                return;
            }
            if (commentContent.length > 500) {
                alert('Comment is too long. Please limit your comment to 500 characters.');
                return;
            }
    
            // Perform fetch request to submit comment
            fetch(`/article/${articleId}/comment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: commentContent }) // Convert comment content to JSON format
            })
            .then(response => {
                if (response.status === 401) {
                    // Redirect to login page if user is not authenticated
                    alert('You must be logged in to comment on this article.');
                    window.location.href = '/';
                    return;
                }
                return response.json(); // Parse response as JSON
            })
            .then(data => {
                // Reload the page after submitting the comment
                if (data && data.success) {
                    window.location.reload();
                }
            })
            .catch(error => {
                console.error('Error submitting comment:', error);
                alert('Failed to submit your comment. Please try again.');
            });
        });
    }

    // Publish draft
    if (document.querySelectorAll('button[id^="publish-"]')) {
        // Select all buttons whose IDs start with "publish-"
        const publishButtons = document.querySelectorAll('button[id^="publish-"]');
        
        // Iterate over each publish button
        publishButtons.forEach(button => {
            // Add a click event listener to each button
            button.addEventListener('click', () => {
                // Extract the draftId from the button's ID
                const draftId = button.id.split('-')[1];
                
                // Perform a fetch request to publish the draft
                fetch(`/author/dashboard/draft/${draftId}/publish`, { method: 'POST' })
                    .then(response => response.json()) // Parse the response as JSON
                    .then(data => {
                        if (data.success) {
                            location.reload(); // Reload the page to reflect the updated drafts list
                        } else {
                            alert('Failed to publish the draft. Please try again.');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        alert('Failed to publish the draft. Please try again.');
                    });
            });
        });
    }

    // Delete draft (dashboard page)
    if (document.querySelectorAll('button[id^="delete-draft-"]')) {
        // Select all buttons whose IDs start with "delete-draft-"
        const deleteButtons = document.querySelectorAll('button[id^="delete-draft-"]');
        
        // Iterate over each delete button
        deleteButtons.forEach(button => {
            // Add a click event listener to each button
            button.addEventListener('click', () => {
                // Extract the draftId from the button's ID
                const draftId = button.id.split('-')[2];
                
                // Confirm deletion with user
                if (confirm('Are you sure you want to delete this draft?')) {
                    // Perform a fetch request to delete the draft
                    fetch(`/author/dashboard/draft/${draftId}/delete`, { method: 'DELETE' })
                        .then(response => {
                            if (response.ok) {
                                // Reload the page to reflect the updated drafts list
                                location.reload();
                            } else {
                                alert('Failed to delete draft. Please try again.');
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('Failed to delete draft. Please try again.');
                        });
                }
            });
        });
    }

    // Delete articles (dashboard page)
    if (document.querySelectorAll('button[id^="delete-article-"]')) {
        // Select all buttons whose IDs start with "delete-article-"
        const deleteButtons = document.querySelectorAll('button[id^="delete-article-"]');
        
        // Iterate over each delete button
        deleteButtons.forEach(button => {
            // Add a click event listener to each button
            button.addEventListener('click', () => {
                // Extract the articleId from the button's ID
                const articleId = button.id.split('-')[2];
                
                // Confirm deletion with user
                if (confirm('Are you sure you want to delete this article?')) {
                    // Perform a fetch request to delete the article
                    fetch(`/author/dashboard/article/${articleId}/delete`, { method: 'DELETE' })
                        .then(response => {
                            if (response.ok) {
                                // Reload the page to reflect the updated articles list
                                location.reload();
                            } else {
                                alert('Failed to delete article. Please try again.');
                            }
                        })
                        .catch(error => {
                            console.error('Error:', error);
                            alert('Failed to delete article. Please try again.');
                        });
                }
            });
        });
    }

    // Generate share links for articles (dashboard page)
    if (document.querySelectorAll('button[id^="share-"]')) {
        // Select all buttons whose IDs start with "share-"
        const shareButtons = document.querySelectorAll('button[id^="share-"]');
        
        // Iterate over each share button
        shareButtons.forEach(button => {
            // Add a click event listener to each button
            button.addEventListener('click', () => {
                // Extract the articleId from the button's ID
                const articleId = button.id.split('-')[1];
                
                // Construct the share URL
                const url = `${window.location.origin}/article/${articleId}`;
                
                // Alert the user with the share URL
                alert(`Share this link: ${url}`);
            });
        });
    }

    // Update blog information
    if (document.getElementById('updateBlogForm')) {
        // Add click event listener to the update blog button
        document.getElementById('updateBlogButton').addEventListener('click', function() {
            // Get the form element and create a FormData object
            const form = document.getElementById('updateBlogForm');
            const formData = new FormData(form);
            
            // Extract form data into a JavaScript object
            const data = {
                blogTitle: formData.get('blogTitle'),
                blogSubtitle: formData.get('blogSubtitle'),
                displayName: formData.get('displayName')
            };
    
            // Send a POST request to update blog information
            fetch('/author/update-blog-info', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert('Blog information updated!');
                    window.location.reload(); // Reload the page to reflect changes
                } else {
                    alert('Failed to update blog info. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to update blog info. Please try again.');
            });
        });
    }

    // Edit draft (dashboard page)
    if (document.querySelectorAll('button[id^="edit-draft-"]')) {
        // Add event listeners to all edit buttons
        const editButtons = document.querySelectorAll('button[id^="edit-draft-"]');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const draftId = button.id.split('-')[2];
                window.location.href = `/author/dashboard/draft/${draftId}/edit`;
            });
        });
    }

    // Edit articles (dashboard page)
    if (document.querySelectorAll('button[id^="edit-article-"]')) {
        // Add event listeners to all edit buttons
        const editButtons = document.querySelectorAll('button[id^="edit-article-"]');
        editButtons.forEach(button => {
            button.addEventListener('click', () => {
                const articleId = button.id.split('-')[2];
                window.location.href = `/author/dashboard/article/${articleId}/edit`;
            });
        });
    }

    // Save changes made to articles and drafts
    if (document.getElementById('saveBtn')) {
        document.getElementById('saveBtn').addEventListener('click', function() {
            const form = document.getElementById('editor');
            const formData = new FormData(form);

            const data = {
                title: formData.get('title'),
                subtitle: formData.get('subtitle'),
                content: formData.get('content'),
                reference: document.getElementById('reference').textContent.trim(),
                type: document.getElementById('type').textContent.trim()
            };

            fetch('/author/dashboard/edit/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (response.ok) {
                    alert('Your changes have been saved!');
                    window.location.href = '/author/dashboard'; // Redirect to dashboard after successful save
                } else {
                    alert('Failed to save. Please check that you have filled out all fields and updated your blog in settings then try again.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert('Failed to save. Please try again.');
            });
        });
    }

    // Delete user (accounts page)
    if (document.querySelectorAll('button[id^="delete-user-"]')) {
        // Add event listeners to all delete buttons
            const deleteButtons = document.querySelectorAll('button[id^="delete-user-"]');
            deleteButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const userId = button.id.split('-')[2];
                    if (confirm('Are you sure you want to delete this user? This parmanently will delete all their data.')) {
                        fetch(`/admin/account/user/${userId}/delete`, { method: 'DELETE' })
                            .then(response => {
                                if (response.ok) {
                                    // Reload page to reflect changes
                                    alert('User was deleted.')
                                    location.reload();
                                } else {
                                    alert('Failed to delete user. Please try again.');
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                alert('Failed to delete user. Please try again.');
                            });
                    }
                });
            });
        }

        // Set user to author (accounts page)
        if (document.querySelectorAll('button[id^="set-as-author-"]')) {
            // Add event listeners to all delete buttons
            const deleteButtons = document.querySelectorAll('button[id^="set-as-author-"]');
            deleteButtons.forEach(button => {
                button.addEventListener('click', () => {
                    const userId = button.id.split('-')[3];
                    if (confirm('Are you sure you want to promote this user to author?')) {
                        fetch(`/admin/account/user/${userId}/set-as-author`, { method: 'POST' })
                            .then(response => {
                                if (response.ok) {
                                    // Reload page to reflect changes
                                    alert('User is now an author.')
                                    location.reload();
                                } else {
                                    alert('Failed to set user. Please try again.');
                                }
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                alert('Failed to set user. Please try again.');
                            });
                    }
                });
            });
        }
});