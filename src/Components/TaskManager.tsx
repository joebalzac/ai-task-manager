import { useEffect, useState } from "react";
import useData from "../Hooks/useData";

interface Task {
  id: number;
  title: string;
}

const TaskManager = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [editingText, setEditingText] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const { data, error, isLoading, postData, deleteData, updateData } =
    useData<Task>();

  if (error) {
    <div>An un known error has occurred</div>;
  }

  if (isLoading) {
    <div>Loading....</div>;
  }

  useEffect(() => {
    if (data) {
      setTasks(data);
    }
  }, [data]);

  const handleAddTask = async (taskTitle: string) => {
    if (!taskTitle.trim()) return;

    try {
      const task = await postData(taskTitle);
      if (task) {
        setTasks([...tasks, task]);
      }
      setNewTask("");
    } catch (error) {
      console.error("Failed to add task:", error);
    }
  };

  const handleDeleteTask = async (id: number) => {
    try {
      await deleteData(id);
      setTasks(tasks.filter((task) => task.id !== id));
    } catch (error) {
      console.error("Failed to delete task:", error);
    }
  };

  const handleEditText = (id: number, title: string) => {
    setEditingText(title);
    setEditingId(id);
  };

  const handleSaveTask = async () => {
    if (editingId !== null && editingText.trim()) {
      try {
        await updateData(editingId, editingText);
        setEditingId(null);
        setEditingText("");
      } catch (err) {
        console.error("Failed to update task:", error);
      }
      setEditingId(null);
    }
  };

  return (
    <div>
      TaskManager
      <div>
        <input
          value={newTask}
          type="text"
          onChange={(e) => {
            setNewTask(e.target.value);
          }}
        />
        <button onClick={() => handleAddTask(newTask)}>Add Task</button>
        <ul>
          {tasks.map((task) => (
            <li key={task.id}>
              {editingId === task.id ? (
                <div>
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                  />
                  <button onClick={() => handleSaveTask()}>Save</button>
                </div>
              ) : (
                <div>
                  {task.title}
                  <button onClick={() => handleDeleteTask(task.id)}>
                    Delete
                  </button>
                  <button onClick={() => handleEditText(task.id, task.title)}>
                    Edit
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default TaskManager;
