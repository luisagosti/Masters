require("dotenv").config();
const bcrypt = require("bcryptjs");
const { query, testConnection } = require("./config/db");

async function seedDatabase() {
    console.log("Starting database seeding...\n");

    try {
        // Test connection
        const connected = await testConnection();
        if (!connected) {
            console.error("Failed to connect to database");
            process.exit(1);
        }

        // Clear existing data
        console.log("Clearing existing data...");
        await query("DELETE FROM project_technologies");
        await query("DELETE FROM projects");
        await query("DELETE FROM technologies");
        await query("DELETE FROM users");
        await query("DELETE FROM experiences");
        await query("DELETE FROM skills");
        console.log("Existing data cleared\n");

        // Seed Users
        console.log("Seeding users...");
        const adminPassword = await bcrypt.hash("admin123", 10);
        const guestPassword = await bcrypt.hash("guest123", 10);

        await query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ["Admin User", "admin@portfolio.com", adminPassword, "admin"]
        );
        await query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ["Guest User", "guest@portfolio.com", guestPassword, "guest"]
        );
        await query(
            "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
            ["Luis Alexandre", "llagostinho01@gmail.com", adminPassword, "admin"]
        );
        console.log("Users seeded (3)\n");

        // Seed Technologies
        console.log("Seeding technologies...");
        const technologies = [
            ["Python", "language"],
            ["JavaScript", "language"],
            ["C", "language"],
            ["C#", "language"],
            ["HTML/CSS", "language"],
            ["React", "framework"],
            ["Node.js", "framework"],
            ["Express", "framework"],
            ["TensorFlow", "framework"],
            ["ASP.NET", "framework"],
            ["MySQL", "database"],
            ["SQL Server", "database"],
            ["MongoDB", "database"],
            ["Firebase", "database"],
            ["Docker", "tool"],
            ["Azure", "tool"],
            ["Scikit-learn", "framework"],
            ["Linux", "tool"],
            ["Windows Server", "tool"],
        ];

        for (const [name, category] of technologies) {
            await query(
                "INSERT INTO technologies (name, category) VALUES (?, ?)",
                [name, category]
            );
        }
        console.log(`Technologies seeded (${technologies.length})\n`);

        // Seed Projects
        console.log("Seeding projects...");

        const project1 = await query(
            `INSERT INTO projects (title, year, role, description, link, display_order) 
        VALUES (?, ?, ?, ?, ?, ?)`,
            [
                "AI-Powered Malware Detection System",
                "2024",
                "ML Engineer & Security Researcher",
                "Developed a machine learning system using TensorFlow to detect and classify malware with 95% accuracy. Implemented feature extraction from binary files and trained models on a dataset of 100,000+ samples.",
                "#",
                1,
            ]
        );

        const project2 = await query(
            `INSERT INTO projects (title, year, role, description, link, display_order) 
        VALUES (?, ?, ?, ?, ?, ?)`,
            [
                "Secure Interbank Communication Platform",
                "2023",
                "Cybersecurity Engineer",
                "Built a secure messaging system for Bank of Portugal enabling encrypted communication between financial institutions. Implemented end-to-end encryption and multi-factor authentication.",
                "#",
                2,
            ]
        );

        const project3 = await query(
            `INSERT INTO projects (title, year, role, description, link, display_order) 
        VALUES (?, ?, ?, ?, ?, ?)`,
            [
                "Network Security Monitoring Dashboard",
                "2022",
                "Full-Stack Developer",
                "Created a real-time network monitoring solution with threat detection capabilities. Features include packet analysis, anomaly detection, and automated alert systems.",
                "#",
                3,
            ]
        );

        console.log("Projects seeded (3)\n");

        // Link Technologies to Projects
        console.log("Linking technologies to projects...");

        // Project 1: Python, TensorFlow, Scikit-learn, Docker
        await query(
            "INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)",
            [project1.insertId, 1]
        );
        await query(
            "INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)",
            [project1.insertId, 9]
        );
        await query(
            "INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)",
            [project1.insertId, 17]
        );
        await query(
            "INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)",
            [project1.insertId, 15]
        );

        // Project 2: C#, ASP.NET, SQL Server, Azure
        await query(
            "INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)",
            [project2.insertId, 4]
        );
        await query(
            "INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)",
            [project2.insertId, 10]
        );
        await query(
            "INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)",
            [project2.insertId, 12]
        );
        await query(
            "INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)",
            [project2.insertId, 16]
        );

        // Project 3: React, Node.js, Python, MongoDB
        await query(
            "INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)",
            [project3.insertId, 6]
        );
        await query(
            "INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)",
            [project3.insertId, 7]
        );
        await query(
            "INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)",
            [project3.insertId, 1]
        );
        await query(
            "INSERT INTO project_technologies (project_id, technology_id) VALUES (?, ?)",
            [project3.insertId, 13]
        );

        console.log("Technologies linked to projects\n");

        // Seed Experiences
        console.log("Seeding work experiences...");
        const experiences = [
            ["Web Developer", "Freelance", "2022", "2025", true, 1],
            ["Cybersecurity Specialist", "Bank of Portugal", "2022", "2022", false, 2],
            ["Software Developer", "Real Life Technologies", "2021", "2021", false, 3],
            ["IT Engineer Associate", "Microcapital", "2019", "2025", true, 4],
        ];

        for (const [title, company, start, end, isCurrent, order] of experiences) {
            await query(
                `INSERT INTO experiences (title, company, start_date, end_date, is_current, display_order) 
            VALUES (?, ?, ?, ?, ?, ?)`,
                [title, company, start, end, isCurrent, order]
            );
        }
        console.log(`Work experiences seeded (${experiences.length})\n`);

        // Seed Skills
        console.log("Seeding skills...");
        const skills = [
            ["Python", "Programming Languages", "expert", 1],
            ["C", "Programming Languages", "advanced", 2],
            ["JavaScript", "Programming Languages", "advanced", 3],
            ["Machine Learning", "AI & ML", "expert", 4],
            ["TensorFlow", "AI & ML", "advanced", 5],
            ["Cybersecurity", "Security", "expert", 6],
            ["Penetration Testing", "Security", "advanced", 7],
            ["Network Security", "Security", "advanced", 8],
            ["SQL", "Databases", "advanced", 9],
            ["MySQL", "Databases", "advanced", 10],
            ["Linux Administration", "Systems", "advanced", 11],
            ["Docker", "DevOps", "intermediate", 12],
        ];

        for (const [name, category, proficiency, order] of skills) {
            await query(
                `INSERT INTO skills (name, category, proficiency, display_order) 
            VALUES (?, ?, ?, ?)`,
                [name, category, proficiency, order]
            );
        }
        console.log(`Skills seeded (${skills.length})\n`);

        console.log("Database seeding completed successfully!");
        console.log("\nSummary:");
        console.log("   - 3 users");
        console.log("   - 19 technologies");
        console.log("   - 3 projects with technologies");
        console.log("   - 4 work experiences");
        console.log("   - 12 skills\n");

        console.log("Test Accounts:");
        console.log("   Admin: admin@portfolio.com / admin123");
        console.log("   Guest: guest@portfolio.com / guest123");
        console.log("   Owner: llagostinho01@gmail.com / admin123\n");

        process.exit(0);
    } catch (error) {
        console.error("\nError seeding database:", error);
        process.exit(1);
    }
}

// Run the seed function
seedDatabase();