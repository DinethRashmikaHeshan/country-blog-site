const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

const register = async (req, res) => {
    try {
        const { email, username, password } = req.body;
        if (!email || !username || !password) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        db.run(
            'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
            [email, username, hashedPassword],
            function(err) {
                if (err) {
                    return res.status(400).json({ error: 'Email or username already exists' });
                }
                res.status(201).json({ message: 'User registered successfully', userId: this.lastID });
            }
        );
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
};

const login = (req, res) => {
    const { email, password } = req.body;

    db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
        if (err || !user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '24h' });
        res.json({ token, user: { id: user.id, email: user.email, username: user.username } });
    });
};

const follow = (req, res) => {
    const { userId } = req.params;

    if (parseInt(userId) === req.user.id) {
        return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    db.run(
        'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
        [req.user.id, userId],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to follow user' });
            }
            res.json({ message: 'Follow successful' });
        }
    );
};

const unfollow = (req, res) => {
    const { userId } = req.params;

    db.run(
        'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
        [req.user.id, userId],
        (err) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to unfollow user' });
            }
            res.json({ message: 'Unfollow successful' });
        }
    );
};

const getFollowers = (req, res) => {
    const { userId } = req.params;

    db.all(
        `SELECT u.id, u.username, u.email
         FROM users u
                  JOIN follows f ON u.id = f.follower_id
         WHERE f.following_id = ?`,
        [userId],
        (err, followers) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch followers' });
            }
            res.json(followers);
        }
    );
};

const getFollowing = (req, res) => {
    const { userId } = req.params;

    db.all(
        `SELECT u.id, u.username, u.email
         FROM users u
                  JOIN follows f ON u.id = f.following_id
         WHERE f.follower_id = ?`,
        [userId],
        (err, following) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch following' });
            }
            res.json(following);
        }
    );
};

const getUser = (req, res) => {
    const { id } = req.params;

    db.get(
        'SELECT id, username, email FROM users WHERE id = ?',
        [id],
        (err, user) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to fetch user' });
            }
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            res.json(user);
        }
    );
};

const getFollowStatus = (req, res) => {
    const { userId } = req.params;

    if (!req.user) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    db.get(
        'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?',
        [req.user.id, userId],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to check follow status' });
            }
            res.json({ isFollowing: !!row });
        }
    );
};

module.exports = { register, login, follow, unfollow, getFollowers, getFollowing, getUser, getFollowStatus };