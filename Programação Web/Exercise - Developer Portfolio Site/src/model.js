// User Model Structure
const UserModel = {
    id: Number,
    name: String,
    email: String,
    password: String,   // hashed
    role: String,       // 'admin' or 'guest'
    createdAt: Date
};

// Project Model Structure
const ProjectModel = {
    id: Number,
    title: String,
    role: String,
    description: String,
    year: String,
    technologies: Array,
    link: String,
    status: String,     // 'active' or 'completed'
    createdBy: Number,
    createdAt: Date,
    updatedAt: Date
};

module.exports = {
    UserModel,
    ProjectModel
};