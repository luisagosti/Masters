const { query } = require("../config/db");

exports.getDashboard = async (req, res, next) => {
    try {
        // Get basic statistics (available to all authenticated users)
        const statsResult = await query(`
        SELECT 
            (SELECT COUNT(*) FROM projects WHERE is_active = TRUE) as totalProjects,
            (SELECT COUNT(*) FROM projects WHERE is_active = TRUE AND year = YEAR(CURDATE())) as activeProjects,
            (SELECT COUNT(*) FROM technologies) as technologies
        `);

        const stats = statsResult[0];

        let responseData = {
            success: true,
            data: {
                stats: {
                    totalProjects: stats.totalProjects,
                    activeProjects: stats.activeProjects,
                    technologies: stats.technologies
                }
            }
        };

        // Add admin-specific statistics
        if (req.user.role === 'admin') {
            const adminStatsResult = await query(`
        SELECT 
            (SELECT COUNT(*) FROM users WHERE is_active = TRUE) as totalUsers,
            (SELECT COUNT(*) FROM contact_messages WHERE is_read = FALSE) as pendingReviews
        `);

            const adminStats = adminStatsResult[0];

            responseData.data.adminStats = {
                totalUsers: adminStats.totalUsers,
                systemHealth: "Excellent",
                pendingReviews: adminStats.pendingReviews
            };
        }

        res.json(responseData);
    } catch (err) {
        next(err);
    }
};

// Get detailed analytics (admin only)
exports.getAnalytics = async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                message: "Admin access required"
            });
        }

        // Get various analytics
        const [
            userStats,
            projectStats,
            technologyStats,
            recentActivity
        ] = await Promise.all([
            // User statistics
            query(`
        SELECT 
            role,
            COUNT(*) as count
        FROM users
        WHERE is_active = TRUE
        GROUP BY role
        `),

            // Projects by year
            query(`
        SELECT 
            year,
            COUNT(*) as count
        FROM projects
        WHERE is_active = TRUE
        GROUP BY year
        ORDER BY year DESC
        `),

            // Most used technologies
            query(`
        SELECT 
            t.name,
            COUNT(pt.project_id) as usage_count
        FROM technologies t
        LEFT JOIN project_technologies pt ON t.id = pt.technology_id
        GROUP BY t.id, t.name
        ORDER BY usage_count DESC
        LIMIT 10
        `),

            // Recent users
            query(`
        SELECT 
            name,
            email,
            last_login,
            created_at
        FROM users
        WHERE is_active = TRUE
        ORDER BY created_at DESC
        LIMIT 5
        `)
        ]);

        res.json({
            success: true,
            data: {
                userStats,
                projectStats,
                technologyStats,
                recentActivity
            }
        });
    } catch (err) {
        next(err);
    }
};