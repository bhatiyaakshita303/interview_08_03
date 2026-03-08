import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

function Tasks() {
    const { id } = useParams();
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState("");
    const [status, setStatus] = useState("Todo");
    const token = localStorage.getItem("token");

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await axios.get(`http://localhost:5000/tasks/${id}`, {
                headers: { Authorization: token }
            });
            setTasks(res.data);
        } catch (err) {
            console.log(err);
            alert("Failed to fetch tasks");
        }
    };

    // Create new task
    const createTask = async () => {
        if (!title) {
            alert("Enter task title");
            return;
        }

        try {
            const res = await axios.post(
                "http://localhost:5000/tasks",
                { title, projectId: id, status },
                { headers: { Authorization: token } }
            );
            setTasks([...tasks, res.data]);
            setTitle("");
            setStatus("Todo");
        } catch (err) {
            console.log(err);
            alert("Failed to create task");
        }
    };

    // Delete task
    const deleteTask = async (taskId) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        try {
            await axios.delete(`http://localhost:5000/tasks/${taskId}`, {
                headers: { Authorization: token }
            });
            setTasks(tasks.filter(t => t._id !== taskId));
        } catch (err) {
            console.log(err);
            alert("Failed to delete task");
        }
    };

    // Update task title
    const updateTask = async (task) => {
        const newTitle = prompt("Enter new task title", task.title);
        if (!newTitle) return;

        try {
            const res = await axios.put(
                `http://localhost:5000/tasks/${task._id}`,
                { title: newTitle },
                { headers: { Authorization: token } }
            );
            setTasks(tasks.map(t => (t._id === task._id ? res.data : t)));
        } catch (err) {
            console.log(err);
            alert("Failed to update task");
        }
    };

    // Update task status
    const changeStatus = async (task, newStatus) => {
        try {
            const res = await axios.put(
                `http://localhost:5000/tasks/${task._id}`,
                { status: newStatus },
                { headers: { Authorization: token } }
            );
            setTasks(tasks.map(t => (t._id === task._id ? res.data : t)));
        } catch (err) {
            console.log(err);
            alert("Failed to update status");
        }
    };

    return (
        <div className="dashboard">
            <h2>Tasks</h2>

            <input
                placeholder="Task Title"
                value={title}
                onChange={e => setTitle(e.target.value)}
            />
            <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="Todo">Todo</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
            </select>
            <button onClick={createTask}>Add Task</button>

            <hr />

            {tasks.map(t => (
                <div key={t._id} className="task">
                    <span>{t.title} - <strong>{t.status}</strong></span>
                    <div className="task-buttons">
                        <button onClick={() => updateTask(t)} className="update-btn">Update</button>
                        <button onClick={() => deleteTask(t._id)} className="delete-btn">Delete</button>
                        <select value={t.status} onChange={e => changeStatus(t, e.target.value)}>
                            <option value="Todo">Todo</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                        </select>
                    </div>
                </div>
            ))}
        </div>
    );
}

export default Tasks;