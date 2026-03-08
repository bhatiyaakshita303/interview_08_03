const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const app = express()

app.use(cors())
app.use(express.json())

// MongoDB connect
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI); // no options needed
        console.log("MongoDB Connected");
    } catch (err) {
        console.log("MongoDB Error:", err.message);
    }
};

connectDB();
// USER MODEL

const User = mongoose.model("User", {
    name: String,
    email: String,
    password: String
})

// PROJECT MODEL
const Project = mongoose.model("Project", {
    name: {
        type: String,
        required: true
    },
    description: String,

    status: {
        type: String,
        default: "Active"
    },
    owner: String,

    createdAt: {
        type: Date,
        default: Date.now
    }
})

// TASK MODEL
const Task = mongoose.model("Task", {
    title: {
        type: String,
        required: true
    },
    description: String,
    priority: String,

    status: {
        type: String,
        default: "Todo"
    },
    dueDate: Date,
    projectId: String
})

// AUTH MIDDLEWARE
function auth(req, res, next) {
    const token = req.headers.authorization
    if (!token) {
        return res.status(401).json("Access denied")
    }
    try {
        const decoded = jwt.verify(token, "secretkey")
        req.userId = decoded.id
        next()
    } catch {
        res.status(401).json("Invalid token")
    }
}

// REGISTER
app.post("/api/auth/register", async (req, res) => {
    try {
        const { name, email, password } = req.body
        const hash = await bcrypt.hash(password, 10)
        const user = new User({
            name,
            email,
            password: hash

        })
        await user.save()
        res.json({ message: "User Registered" })
    } catch (err) {
        res.status(500).json(err)
    }
})

// LOGIN
app.post("/api/auth/login", async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json("User not found")
        }
        const match = await bcrypt.compare(password, user.password)
        if (!match) {
            return res.status(400).json("Wrong password")
        }
        const token = jwt.sign({ id: user._id }, "secretkey")
        res.json({ token })
    } catch (err) {
        res.status(500).json(err)
    }
})

// CREATE PROJECT
app.post("/projects", auth, async (req, res) => {
    const project = new Project({
        name: req.body.name,
        description: req.body.description,
        owner: req.userId
    })
    await project.save()
    res.json(project)
})

// GET PROJECTS
app.get("/projects", auth, async (req, res) => {
    const projects = await Project.find({
        owner: req.userId
    })
    res.json(projects)
})

// DELETE PROJECT
app.delete("/projects/:id", auth, async (req, res) => {
    await Project.findByIdAndDelete(req.params.id)
    res.json({ message: "Project Deleted" })
})

// UPDATE PROJECT
app.put("/projects/:id", auth, async (req, res) => {
    try {
        const { name, description, status } = req.body;

        const project = await Project.findById(req.params.id);
        if (!project) return res.status(404).json("Project not found");

        if (project.owner.toString() !== req.userId) {
            return res.status(403).json("Access denied");
        }

        project.name = name || project.name;
        project.description = description || project.description;
        project.status = status || project.status;

        await project.save();

        res.json(project);
    } catch (err) {
        res.status(500).json(err);
    }
});

// CREATE TASK
app.post("/tasks", auth, async (req, res) => {
    const task = new Task({
        title: req.body.title,
        description: req.body.description,
        priority: req.body.priority,
        projectId: req.body.projectId
    })
    await task.save()
    res.json(task)
})

// GET TASKS BY PROJECT

app.get("/tasks/:projectId", auth, async (req, res) => {
    const tasks = await Task.find({
        projectId: req.params.projectId
    })
    res.json(tasks)
})

// DELETE TASK
app.delete("/tasks/:id", auth, async (req, res) => {
    await Task.findByIdAndDelete(req.params.id)
    res.json({ message: "Task Deleted" })
})

// Update Task
app.put("/tasks/:id", auth, async (req, res) => {
    try {
        const { title, description, priority, status, dueDate } = req.body;

        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json("Task not found");

        task.title = title || task.title;
        task.description = description || task.description;
        task.priority = priority || task.priority;
        task.status = status || task.status;
        task.dueDate = dueDate || task.dueDate;

        await task.save();

        res.json(task);
    } catch (err) {
        res.status(500).json(err);
    }
})

// SERVER
app.listen(PORT, () => {
    console.log("Server running on port " + PORT)
})