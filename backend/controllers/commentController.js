const db = require('../db');

const createComment = (req, res) => {
    const { postId, content } = req.body;

    if (!postId || !content) {
        return res.status(400).json({ error: 'Post ID and content are required' });
    }

    db.run(
        'INSERT INTO comments (user_id, post_id, content) VALUES (?, ?, ?)',
        [req.user.id, postId, content],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create comment' });
            }
            res.status(201).json({ message: 'Comment created successfully', commentId: this.lastID });
        }
    );
};

module.exports = { createComment };