const bcrypt = require("bcryptjs");
const { query } = require("../config/db");

// Get all users (admin only)
exports.getAllUsers = async (req, res, next) => {
    try {
        const users = await query(
            `SELECT id, name, email, role, is_active, created_at, last_login 
             FROM users 
             ORDER BY created_at DESC`
        );

        res.json({
            success: true,
            data: users
        });
    } catch (err) {
        next(err);
    }
};

// Get single user by ID (admin only)
exports.getUserById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const users = await query(
            'SELECT id, name, email, role, is_active, created_at, last_login FROM users WHERE id = ?',
            [id]
        );

        if (users.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            data: users[0]
        });
    } catch (err) {
        next(err);
    }
};

// Create new user (admin only)
exports.createUser = async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Validate role
        if (role && !['admin', 'guest'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Must be 'admin' or 'guest'"
            });
        }

        // Check if user already exists
        const existingUsers = await query(
            'SELECT id FROM users WHERE email = ?',
            [email]
        );

        if (existingUsers.length > 0) {
            return res.status(400).json({
                success: false,
                message: "User with this email already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user
        const result = await query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name || email.split('@')[0], email, hashedPassword, role || 'guest']
        );

        res.status(201).json({
            success: true,
            message: "User created successfully",
            userId: result.insertId
        });
    } catch (err) {
        next(err);
    }
};

// Update user (admin only)
exports.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, email, password, role, is_active } = req.body;

        // Validate role if provided
        if (role && !['admin', 'guest'].includes(role)) {
            return res.status(400).json({
                success: false,
                message: "Invalid role. Must be 'admin' or 'guest'"
            });
        }

        // Check if user exists
        const existingUsers = await query('SELECT id FROM users WHERE id = ?', [id]);
        if (existingUsers.length === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Check if email is being changed and if it's already in use
        if (email) {
            const emailCheck = await query(
                'SELECT id FROM users WHERE email = ? AND id != ?',
                [email, id]
            );
            if (emailCheck.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: "Email already in use by another user"
                });
            }
        }

        // Prepare update query
        let updateFields = [];
        let updateValues = [];

        if (name !== undefined) {
            updateFields.push('name = ?');
            updateValues.push(name);
        }
        if (email !== undefined) {
            updateFields.push('email = ?');
            updateValues.push(email);
        }
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateFields.push('password = ?');
            updateValues.push(hashedPassword);
        }
        if (role !== undefined) {
            updateFields.push('role = ?');
            updateValues.push(role);
        }
        if (is_active !== undefined) {
            updateFields.push('is_active = ?');
            updateValues.push(is_active);
        }

        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: "No fields to update"
            });
        }

        updateValues.push(id);
        const updateQuery = `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`;

        await query(updateQuery, updateValues);

        res.json({
            success: true,
            message: "User updated successfully"
        });
    } catch (err) {
        console.error('Update user error:', err);
        next(err);
    }
};

// Delete user (admin only) - Soft delete
exports.deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Prevent admin from deleting themselves
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({
                success: false,
                message: "Cannot delete your own account"
            });
        }

        // Soft delete - just mark as inactive
        const result = await query(
            'UPDATE users SET is_active = FALSE WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        res.json({
            success: true,
            message: "User deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};