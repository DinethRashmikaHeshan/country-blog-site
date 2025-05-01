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

module.exports = { register, login, follow, unfollow };