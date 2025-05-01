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

const getComments = (req, res) => {
    const { id } = req.params;

    db.all(
        `SELECT c.id, c.post_id, c.user_id, c.content, c.created_at, u.username
         FROM comments c
         JOIN users u ON c.user_id = u.id
         WHERE c.post_id = ?
         ORDER BY c.created_at DESC`,
        [id],
        (err, comments) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch comments' });
            }
            res.json(comments || []);
        }
    );
};

module.exports = { createComment, getComments };