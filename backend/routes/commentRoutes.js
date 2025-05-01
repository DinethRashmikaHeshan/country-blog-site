const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /comments:
 *   post:
 *     summary: Create a comment
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               postId:
 *                 type: integer
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created successfully
 */
router.post('/comments', authenticateToken, commentController.createComment);

/**
 * @swagger
 * /posts/{id}/comments:
 *   get:
 *     summary: Get all comments for a specific post
 *     tags: [Comments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Post ID
 *     responses:
 *       200:
 *         description: List of comments
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   post_id:
 *                     type: integer
 *                   user_id:
 *                     type: integer
 *                   content:
 *                     type: string
 *                   created_at:
 *                     type: string
 *                   username:
 *                     type: string
 *       500:
 *         description: Failed to fetch comments
 */
router.get('/posts/:id/comments', commentController.getComments);

module.exports = router;