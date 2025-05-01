const db = require('../db');

const createPost = (req, res) => {
    const { title, content, country, visit_date } = req.body;

    if (!title || !content || !country || !visit_date) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    db.run(
        'INSERT INTO posts (user_id, title, content, country, visit_date) VALUES (?, ?, ?, ?, ?)',
        [req.user.id, title, content, country, visit_date],
        function(err) {
            if (err) {
                return res.status(500).json({ error: 'Failed to create post' });
            }
            res.status(201).json({ message: 'Post created successfully', postId: this.lastID });
        }
    );
};

const getPosts = (req, res) => {
    const { page = 1, limit = 10, country, username } = req.query;
    const offset = (page - 1) * limit;

    let query = `
        SELECT p.*, u.username,
               (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.is_like = 1) as likes,
               (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.is_like = 0) as dislikes
        FROM posts p
                 JOIN users u ON p.user_id = u.id
    `;
    const params = [];

    if (country) {
        query += ' WHERE p.country = ?';
        params.push(country);
    }
    if (username) {
        query += country ? ' AND' : ' WHERE';
        query += ' u.username = ?';
        params.push(username);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    db.all(query, params, (err, posts) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch posts' });
        }
        res.json(posts);
    });
};

const updatePost = (req, res) => {
    const { id } = req.params;
    const { title, content, country, visit_date } = req.body;

    db.get('SELECT user_id FROM posts WHERE id = ?', [id], (err, post) => {
        if (err || !post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (post.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        db.run(
            'UPDATE posts SET title = ?, content = ?, country = ?, visit_date = ? WHERE id = ?',
            [title, content, country, visit_date, id],
            (err) => {
                if (err) {
                    return res.status(500).json({ error: 'Failed to update post' });
                }
                res.json({ message: 'Post updated successfully' });
            }
        );
    });
};

const deletePost = (req, res) => {
    const { id } = req.params;

    db.get('SELECT user_id FROM posts WHERE id = ?', [id], (err, post) => {
        if (err || !post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        if (post.user_id !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        db.run('DELETE FROM posts WHERE id = ?', [id], (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete post' });
            }
            res.json({ message: 'Post deleted successfully' });
        });
    });
};

const likePost = (req, res) => {
    const { id } = req.params;
    const { isLike } = req.body;

    if (typeof isLike !== 'boolean') {
        return res.status(400).json({ error: 'isLike must be a boolean' });
    }

    db.run(
        'INSERT OR REPLACE INTO likes (user_id, post_id, is_like) VALUES (?, ?, ?)',
        [req.user.id, id, isLike],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to record like/dislike' });
            }
            // Get updated like/dislike counts
            db.get(
                `SELECT 
                    (SELECT COUNT(*) FROM likes l WHERE l.post_id = ? AND l.is_like = 1) as likes,
                    (SELECT COUNT(*) FROM likes l WHERE l.post_id = ? AND l.is_like = 0) as dislikes`,
                [id, id],
                (err, counts) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to fetch counts' });
                    }
                    res.json({
                        message: 'Like/dislike recorded',
                        likes: counts.likes,
                        dislikes: counts.dislikes
                    });
                }
            );
        }
    );
};

const unlikePost = (req, res) => {
    const { id } = req.params;

    db.run(
        'DELETE FROM likes WHERE user_id = ? AND post_id = ?',
        [req.user.id, id],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to remove like/dislike' });
            }
            // Get updated like/dislike counts
            db.get(
                `SELECT 
                    (SELECT COUNT(*) FROM likes l WHERE l.post_id = ? AND l.is_like = 1) as likes,
                    (SELECT COUNT(*) FROM likes l WHERE l.post_id = ? AND l.is_like = 0) as dislikes`,
                [id, id],
                (err, counts) => {
                    if (err) {
                        return res.status(500).json({ error: 'Failed to fetch counts' });
                    }
                    res.json({
                        message: 'Like/dislike removed',
                        likes: counts.likes,
                        dislikes: counts.dislikes
                    });
                }
            );
        }
    );
};

const getFeed = (req, res) => {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    const query = `
        SELECT p.*, u.username,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.is_like = 1) as likes,
        (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.is_like = 0) as dislikes
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.user_id IN (
            SELECT following_id FROM follows WHERE follower_id = ?
        )
        ORDER BY p.created_at DESC
        LIMIT ? OFFSET ?
    `;

    db.all(query, [req.user.id, parseInt(limit), parseInt(offset)], (err, posts) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch feed' });
        }
        res.json(posts);
    });
};

const getPost = (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT p.*, u.username,
               (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.is_like = 1) as likes,
               (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id AND l.is_like = 0) as dislikes
        FROM posts p
        JOIN users u ON p.user_id = u.id
        WHERE p.id = ?
    `;

    db.get(query, [id], (err, post) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to fetch post' });
        }
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }
        res.json(post);
    });
};

module.exports = { createPost, getPosts, updatePost, deletePost, likePost, unlikePost, getFeed, getPost};