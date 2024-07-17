-- make sure foreign_key constraints are observed and that errors will be thrown for violations
PRAGMA foreign_keys=ON;

BEGIN TRANSACTION;

-- Create Users Table
CREATE TABLE IF NOT EXISTS Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    email TEXT NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL
);

-- Create Authors Table
CREATE TABLE IF NOT EXISTS Authors (
    author_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, --ref
    ----
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create Admins Table
CREATE TABLE IF NOT EXISTS Admins (
    admin_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, --ref
    ----
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create Blogs Table
CREATE TABLE IF NOT EXISTS Blogs (
    blog_id INTEGER PRIMARY KEY AUTOINCREMENT,
    author_id INTEGER, --ref
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    display_name TEXT NOT NULL,
    ----
    FOREIGN KEY (author_id) REFERENCES Authors(author_id) ON DELETE CASCADE
);

-- Create Drafts Table
CREATE TABLE IF NOT EXISTS Drafts (
    draft_id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_id INTEGER, --ref
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ----
    FOREIGN KEY (blog_id) REFERENCES Blogs(blog_id) ON DELETE CASCADE
);

-- Create Articles Table
CREATE TABLE IF NOT EXISTS Articles (
    article_id INTEGER PRIMARY KEY AUTOINCREMENT,
    blog_id INTEGER, --ref
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ----
    FOREIGN KEY (blog_id) REFERENCES Blogs(blog_id) ON DELETE CASCADE
);

-- Create Comments Table
CREATE TABLE IF NOT EXISTS Comments (
    comment_id INTEGER PRIMARY KEY AUTOINCREMENT,
    article_id INTEGER, --ref
    user_id INTEGER, --ref
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ----
    FOREIGN KEY (article_id) REFERENCES Articles(article_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);

-- Create Interactions Table
CREATE TABLE IF NOT EXISTS Interactions (
    interaction_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER, -- ref
    article_id INTEGER, -- ref
    liked INTEGER DEFAULT 0,
    viewed INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ----
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (article_id) REFERENCES Articles(article_id) ON DELETE CASCADE,
    UNIQUE(user_id, article_id) -- Each user can have only one interaction per article
);

---------------------
-- test user profiles
---------------------

----(admins)
------ username: admin
------ password: admin

----(authors)
------ username: author1
------ password: author1
----
------ username: author2
------ password: author2

----(users)
------ username: user1
------ password: user1
----
------ username: user2
------ password: user2
----
------ username: user3
------ password: user3

---------------------------------------------------------------------------
-- uncomment test data below and build database to test out the application
---------------------------------------------------------------------------

-- Create users
INSERT INTO Users (username, email, password, role) VALUES (
    'admin', 
    'admin@example.com', 
    '$argon2id$v=19$m=65536,t=3,p=4$OKibhbXegqIfbFSZaqBvxA$+TbNuYyrLXoS/S7bC+vwvv5GA6x4T5EkN1qU5Ni0YlU', 
    'admin'
);
INSERT INTO Users (username, email, password, role) VALUES (
    'author1', 
    'author1@example.com', 
    '$argon2id$v=19$m=65536,t=3,p=4$PaP4koyAfI69gcWh48G7Ow$2d2/uSR63ZGBXuBXltFH3vfSHlD/vDj9qBdsOkNWwNA', 
    'author'
);
INSERT INTO Users (username, email, password, role) VALUES (
    'author2', 
    'author2@example.com', 
    '$argon2id$v=19$m=65536,t=3,p=4$fEvGfehWOWwykkXf4J5BTw$wPsKJ34KwLVLrx57Nms1NX0XbM9wXi5irW6WqrUC/ZI', 
    'author'
);
INSERT INTO Users (username, email, password, role) VALUES (
    'user1', 
    'user1@example.com', 
    '$argon2id$v=19$m=65536,t=3,p=4$xMLurKdAk4ptcdMS3AlxFA$VbwBAGLmfyF1jc244ULZScs4afkIokD3XZYGMv1T0sA', 
    'user'
);
INSERT INTO Users (username, email, password, role) VALUES (
    'user2', 
    'user2@example.com', 
    '$argon2id$v=19$m=65536,t=3,p=4$IdJsZkZSG53X7flnFuqZ9Q$LJZnHnHkuSLNSGrr0K9h4sbN9XJmR5/o0suTkdDpE7A', 
    'user'
);
INSERT INTO Users (username, email, password, role) VALUES (
    'user3', 
    'user3@example.com', 
    '$argon2id$v=19$m=65536,t=3,p=4$10Nh0qCD8QqHcsVeRbiSmg$SPpHYxIwyd4NvXnZKOIv/cfYa5aERUyxnv57buro8cs', 
    'user'
);

-- Create author profiles
INSERT INTO Authors (user_id) VALUES (1); --admin is also an author (for personal blogs)
INSERT INTO Authors (user_id) VALUES (2);
INSERT INTO Authors (user_id) VALUES (3);

-- Create admin profiles
INSERT INTO Admins (user_id) VALUES (1); --set admin

-- Create some blogs by authors 
INSERT INTO Blogs (author_id, title, subtitle, display_name) VALUES (
    1,
    'Almustaqbal',
    'Thoughts about the future...',
    'Audrey'
);
INSERT INTO Blogs (author_id, title, subtitle, display_name) VALUES (
    2,
    'Almadi',
    'Thoughts about the past...',
    'David'
);
INSERT INTO Blogs (author_id, title, subtitle, display_name) VALUES (
    3,
    'Alhadir',
    'Thoughts about the present...',
    'Sara'
);

-- Create some articles by authors
INSERT INTO Articles (blog_id, title, subtitle, content, created_at, updated_at) VALUES (
    1, 
    'An Intellectual',
    'Someone whose mind watches itself',
    'An intellectual? Yes. And never deny it. An intellectual is someone whose mind watches itself. I like this, because I am happy to be both halves, the watcher and the watched. "Can they be brought together?" This is a practical question. We must get down to it. "I despise intelligence" really means: "I cannot bear my doubts." - Albert Camus',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
INSERT INTO Articles (blog_id, title, subtitle, content, created_at, updated_at) VALUES (
    1, 
    'An Invincible Summer',
    '...in the midst of winter',
    'O light! This is the cry of all the characters of ancient drama brought face to face with their fate. This last resort was ours, too, and I knew it now. In the middle of winter I at last discovered that there was in me an invincible summer. - Albert Camus',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
INSERT INTO Articles (blog_id, title, subtitle, content, created_at, updated_at) VALUES (
    1,
    'Sisyphus', 
    'At the foot of the mountain',
    "I leave Sisyphus at the foot of the mountain. One always finds one's burden again. But Sisyphus teaches the higher fidelity that negates the gods and raises rocks. He too concludes that all is well. This universe henceforth without a master seems to him neither sterile nor futile. Each atom of that stone, each mineral flake of that night-filled mountain, in itself, forms a world. The struggle itself toward the heights is enough to fill a man's heart. One must imagine Sisyphus happy. - Albert Camus",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
INSERT INTO Articles (blog_id, title, subtitle, content, created_at, updated_at) VALUES (
    2, 
    'The End',
    'The benign indifference of the universe',
    "It was as if that great rush of anger had washed me clean, emptied me of hope, and, gazing up at the dark sky spangled with its signs and stars, for the first time, the first, I laid my heart open to the benign indifference of the universe. To feel it so like myself, indeed, so brotherly, made me realize that I'd been happy, and that I was happy still. For all to be accomplished, for me to feel less lonely, all that remained to hope was that on the day of my execution there should be a huge crowd of spectators and that they should greet me with howls of execration. - Albert Camus",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
INSERT INTO Articles (blog_id, title, subtitle, content, created_at, updated_at) VALUES (
    3, 
    'You',
    'Go out for a walk',
    "Find meaning. Distinguish melancholy from sadness. Go out for a walk. It doesn’t have to be a romantic walk in the park, spring at its most spectacular moment, flowers and smells and outstanding poetical imagery smoothly transferring you into another world. It doesn’t have to be a walk during which you’ll have multiple life epiphanies and discover meanings no other brain ever managed to encounter. Do not be afraid of spending quality time by yourself. Find meaning or don’t find meaning but 'steal' some time and give it freely and exclusively to your own self. Opt for privacy and solitude. That doesn’t make you antisocial or cause you to reject the rest of the world. But you need to breathe. And you need to be. - Albert Camus",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Create some drafts by authors
INSERT INTO Drafts (blog_id, title, subtitle, content, created_at, updated_at) VALUES (
    1, 
    'The Web',
    "Information is defined only by what it's related to...",
    "In an extreme view, the world can be seen as only connections, nothing else. We think of a dictionary as the repository of meaning, but it defines words only in terms of other words. I liked the idea that a piece of information is really defined only by what it's related to, and how it's related. There really is little else to meaning. The structure is everything. There are billions of neurons in our brains, but what are neurons? Just cells. The brain has no knowledge until connections are made between neurons. All that we know, all that we are, comes from the way our neurons are connected. - Tim Berners-Lee",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);
INSERT INTO Drafts (blog_id, title, subtitle, content, created_at, updated_at) VALUES (
    2, 
    'A Decentralized Spirit',
    'Somehow lost',
    'The spirit there was very decentralized. The individual was incredibly empowered. It was all based on there being no central authority that you had to go to to ask permission,” he said. “That feeling of individual control, that empowerment, is something we’ve lost.” - Tim Berners-Lee',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Create some comments on the articles
INSERT INTO Comments (article_id, user_id, content, created_at) VALUES (1, 1, 'Great article!', CURRENT_TIMESTAMP);
INSERT INTO Comments (article_id, user_id, content, created_at) VALUES (1, 4, 'Interesting...', CURRENT_TIMESTAMP);
INSERT INTO Comments (article_id, user_id, content, created_at) VALUES (2, 3, 'Good thoughts. Thanks for sharing', CURRENT_TIMESTAMP);

COMMIT;

