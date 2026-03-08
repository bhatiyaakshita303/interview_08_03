import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Dashboard() {
    const [projects, setProjects] = useState([]);
    const [name, setName] = useState("");

    const navigate = useNavigate();
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await axios.get("http://localhost:5000/projects", {
                headers: { Authorization: token }
            });
            setProjects(res.data);
        } catch (err) {
            console.log(err);
            alert("Failed to fetch projects");
        }
    };

    // Create new project
    const createProject = async () => {
        try {
            if (!name) {
                alert("Enter project name");
                return;
            }
            const res = await axios.post(
                "http://localhost:5000/projects",
                { name },
                { headers: { Authorization: token } }
            );
            setProjects([...projects, res.data]);
            setName("");
        } catch (err) {
            console.log(err);
            alert("Failed to create project");
        }
    };

    // Delete project
    const deleteProject = async (id) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;

        try {
            await axios.delete(`http://localhost:5000/projects/${id}`, {
                headers: { Authorization: token }
            });
            setProjects(projects.filter(p => p._id !== id));
        } catch (err) {
            console.log(err);
            alert("Failed to delete project");
        }
    };

    // Update project
    const updateProject = async (project) => {
        const newName = prompt("Enter new project name", project.name);
        if (!newName) return;

        try {
            const res = await axios.put(
                `http://localhost:5000/projects/${project._id}`,
                { name: newName },
                { headers: { Authorization: token } }
            );
            setProjects(projects.map(p => (p._id === project._id ? res.data : p)));
        } catch (err) {
            console.log(err);
            alert("Failed to update project");
        }
    };

    return (
        <div className="dashboard">
            <h2>Projects</h2>

            <input
                placeholder="Project Name"
                value={name}
                onChange={e => setName(e.target.value)}
            />
            <button onClick={createProject}>Create</button>

            <hr />

            {projects.map(p => (
                <div key={p._id} className="project">
                    <h3>{p.name}</h3>
                    {p.owner && p.owner.name && <p>Owner: {p.owner.name}</p>}
                    <div className="project-buttons">
                        <button onClick={() => navigate(`/tasks/${p._id}`)}>View Tasks</button>
                        <button
                            onClick={() => updateProject(p)}
                            className="update-btn"
                        >
                            Update
                        </button>
                        <button
                            onClick={() => deleteProject(p._id)}
                            className="delete-btn"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Dashboard;