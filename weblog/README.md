# DNW Midterm

This is a blogging web application. It is password protected, and all passwords are stored using Argon2 salting and hashing for user security and privacy. It can be used as a personal blog with one author, or a hub of multiple blogs with many authors (you decide). The front-end styling was inspired by the 16-bit era, hence the use of simple colors and fonts.

## Instructions

Here you will find instructions on how to use this application. I recommend that you follow the instrucntions in `Testing` to get a quick overview of the application. Sign in as the Admin so you can see all the features at once, then try out Author and User status so you can see how different users would experience it.

### Testing

Befrore running `npm run build-db` check the file `db_schema.sql`, there you will find a long list of commented out test data that you can build the database with. I have included six dummy accounts:

* user: admin   | pass: admin   | role: admin
* user: author1 | pass: author1 | role: author
* user: author2 | pass: author2 | role: author
* user: user1   | pass: user1   | role: user
* user: user2   | pass: user2   | role: user
* user: user3   | pass: user3   | role: user

These account have other test data connected to them like blogs, articles, drafts and interactions. They are all set up so you can easily look through the application and get an idea of what it would look like if you were to use it. Sign in as one of each (admin, author and user) and click around so you can see what each role has access to.

### Set Up

To set up:

1. Delete or comment out the test data
2. Run `npm run clean-db` to delete any existing database with test data
3. Run `npm run build-db` to create new empty database
4. Go to your browser and go to this [URL](http://localhost:3000/)
5. Below the log in in button, click on `Create an account`
6. Fill out the form and click `Create account`
7. You will be redirected to the home page and you will be signed in. Your username should appear in the top right corner

If the database is empty, you will be assigned 'admin' and 'author' status simultaneously (incase you would like to use the application for a personal blog). After this, if any other user creates an account, they will be assigned 'user' status. 

#### Settings

You can toggle the settings from the navigation bar under the header. Users can only delete their accounts from there. Admins and Authors will see a Blog Form they can fill out to update their blog information.

#### Accounts

All user accounts will appear on the 'Accounts' page (accessible by admins only). There you can promote users to 'author' status if you wish to allow them to create blogs on your application. You can also delete users from there.

#### Dashboard

The author's 'Dashboard' page (accessible by admins and authors only) will have a list of all drafts and published articles for the signed in user. There you can edit, delete and publish existing articles and drafts. Click the 'Draft +' button to create a new draft.

## Libraries
- Argon2 (for salting and hashing passwords)
- Bootstrap (for styling)
- Data-FNS (for data/time formating)
- Express-session (for user sessions when users log in)
- Express-validator (to sanitize input from the user)