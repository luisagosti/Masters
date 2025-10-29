const { query } = require("../config/db");

// Get all active projects with their technologies
exports.getAllProjects = async (req, res, next) => {
    try {
        // Get projects
        const projects = await query(
            `SELECT p.* FROM projects p 
       WHERE p.is_active = TRUE 
       ORDER BY p.display_order ASC, p.year DESC`
        );

        // Get technologies for each project
        for (let project of projects) {
            const technologies = await query(
                `SELECT t.name 
         FROM technologies t
         INNER JOIN project_technologies pt ON t.id = pt.technology_id
         WHERE pt.project_id = ?`,
                [project.id]
            );

            project.technologies = technologies.map(t => t.name);
        }

        res.json({
            success: true,
            data: projects
        });
    } catch (err) {
        next(err);
    }
};

// Get single project by ID
exports.getProjectById = async (req, res, next) => {
    try {
        const { id } = req.params;

        const projects = await query(
            'SELECT * FROM projects WHERE id = ? AND is_active = TRUE',
            [id]
        );

        if (projects.length === 0) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Get technologies for this project
        const technologies = await query(
            `SELECT t.name 
       FROM technologies t
       INNER JOIN project_technologies pt ON t.id = pt.technology_id
       WHERE pt.project_id = ?`,
            [id]
        );

        const project = projects[0];
        project.technologies = technologies.map(t => t.name);

        res.json({
            success: true,
            data: project
        });
    } catch (err) {
        next(err);
    }
};

// Create new project (admin only)
exports.createProject = async (req, res, next) => {
    try {
        const { title, year, role, description, link, technologies } = req.body;

        // Validate input
        if (!title || !year || !role || !description) {
            return res.status(400).json({
                success: false,
                message: "Title, year, role, and description are required"
            });
        }

        // Insert project
        const result = await query(
            'INSERT INTO projects (title, year, role, description, link) VALUES (?, ?, ?, ?, ?)',
            [title, year, role, description, link || '#']
        );

        const projectId = result.insertId;

        // Add technologies if provided
        if (technologies && Array.isArray(technologies)) {
            for (let techName of technologies) {
                if (!techName || techName.trim() === '') continue;

                // Get or create technology
                let tech = await query('SELECT id FROM technologies WHERE name = ?', [techName]);

                let techId;
                if (tech.length === 0) {
                    const techResult = await query('INSERT INTO technologies (name) VALUES (?)', [techName]);
                    techId = techResult.insertId;
                } else {
                    techId = tech[0].id;
                }

                // Link technology to project
                await query(
                    'INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)',
                    [projectId, techId]
                );
            }
        }

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            projectId: projectId
        });
    } catch (err) {
        next(err);
    }
};

// Update project (admin only)
exports.updateProject = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { title, year, role, description, link, is_active, technologies } = req.body;

        // Update basic project info
        const result = await query(
            `UPDATE projects 
       SET title = COALESCE(?, title),
           year = COALESCE(?, year),
           role = COALESCE(?, role),
           description = COALESCE(?, description),
           link = COALESCE(?, link),
           is_active = COALESCE(?, is_active)
       WHERE id = ?`,
            [title, year, role, description, link, is_active, id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        // Update technologies if provided
        if (technologies && Array.isArray(technologies)) {
            // Remove existing technology associations
            await query('DELETE FROM project_technologies WHERE project_id = ?', [id]);

            // Add new technologies
            for (let techName of technologies) {
                if (!techName || techName.trim() === '') continue;

                // Get or create technology
                let tech = await query('SELECT id FROM technologies WHERE name = ?', [techName]);

                let techId;
                if (tech.length === 0) {
                    const techResult = await query('INSERT INTO technologies (name) VALUES (?)', [techName]);
                    techId = techResult.insertId;
                } else {
                    techId = tech[0].id;
                }

                // Link technology to project
                await query(
                    'INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)',
                    [id, techId]
                );
            }
        }

        res.json({
            success: true,
            message: "Project updated successfully"
        });
    } catch (err) {
        console.error('Update project error:', err);
        next(err);
    }
};

// Delete project (admin only)
exports.deleteProject = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Soft delete - just mark as inactive
        const result = await query(
            'UPDATE projects SET is_active = FALSE WHERE id = ?',
            [id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.json({
            success: true,
            message: "Project deleted successfully"
        });
    } catch (err) {
        next(err);
    }
};