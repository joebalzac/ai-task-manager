import { useState } from "react";
import "./App.css";
import TaskManager from "./Components/TaskManager";

function App() {
  console.log("Database URL:", import.meta.env.VITE_DATABASE_URL);

  return (
    <>
      <TaskManager />
    </>
  );
}

export default App;
