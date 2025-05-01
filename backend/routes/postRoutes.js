const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authenticateToken } = require('../middleware/auth');

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new blog post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               country:
 *                 type: string
 *               visit_date:
 *                 type: string
 *     responses:
 *       201:
 *         description: Post created successfully
 *       400:
 *         description: Invalid input
 */
router.post('/posts', authenticateToken, postController.createPost);

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all blog posts
 *     tags: [Posts]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: country
 *         schema:
 *           type: string
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of blog posts
 */
router.get('/posts', postController.getPosts);

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a blog post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               country:
 *                 type: string
 *               visit_date:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post updated successfully
 *       403:
 *         description: Unauthorized
 */
router.put('/posts/:id', authenticateToken, postController.updatePost);

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a blog post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *       403:
 *         description: Unauthorized
 */
router.delete('/posts/:id', authenticateToken, postController.deletePost);

/**
 * @swagger
 * /posts/{id}/like:
 *   post:
 *     summary: Like or dislike a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isLike:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Like/dislike recorded
 */
router.post('/posts/:id/like', authenticateToken, postController.likePost);

/**
 * @swagger
 * /posts/{id}/unlike:
 *   delete:
 *     summary: Remove like or dislike from a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Like/dislike removed
 */
router.delete('/posts/:id/unlike', authenticateToken, postController.unlikePost);

/**
 * @swagger
 * /feed:
 *   get:
 *     summary: Get posts from followed users
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of posts from followed users
 */
router.get('/feed', authenticateToken, postController.getFeed);

module.exports = router;