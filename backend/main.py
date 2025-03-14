from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from sqlalchemy import Column, Integer, String
from sqlalchemy.future import select
from pydantic import BaseModel
from typing import List
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
DATABASE_URL = os.getenv("VITE_DATABASE_URL").replace("postgresql", "postgresql+asyncpg")

# Create async SQLAlchemy engine
engine = create_async_engine(DATABASE_URL, echo=True)
async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Define SQLAlchemy Base
Base = declarative_base()

# Define Task Model
class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)

# Function to create tables manually
async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

# Initialize FastAPI
app = FastAPI()

# ✅ Enable CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Frontend origin
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)

# Create tables on startup
@app.on_event("startup")
async def startup_event():
    await init_db()

# Dependency for getting DB session
async def get_db():
    async with async_session() as session:
        yield session

# Request model
class TaskCreate(BaseModel):
    title: str

# Response model
class TaskResponse(BaseModel):
    id: int
    title: str

# Request model for updating tasks
class TaskUpdate(BaseModel):
    title: str

# GET API: Fetch all tasks
@app.get("/tasks", response_model=List[TaskResponse])
async def get_tasks(db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Task))
    tasks = result.scalars().all()
    return tasks

# POST API: Create a new task
@app.post("/tasks", response_model=TaskResponse)
async def create_task(task: TaskCreate, db: AsyncSession = Depends(get_db)):
    new_task = Task(title=task.title)
    db.add(new_task)
    await db.commit()
    await db.refresh(new_task)
    return new_task

# DELETE API: Remove a task by ID
@app.delete("/tasks/{task_id}", response_model=TaskResponse)
async def delete_task(task_id: int, db: AsyncSession = Depends(get_db)):
    # Fetch the task to ensure it exists
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalars().first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    await db.delete(task)
    await db.commit()
    return task  


# PUT API: Update a task by ID
@app.put("/tasks/{task_id}", response_model=TaskResponse)  # ✅ Ensure leading `/`
async def update_task(task_id: int, task_update: TaskUpdate, db: AsyncSession = Depends(get_db)):
    # Fetch the task to ensure it exists
    result = await db.execute(select(Task).where(Task.id == task_id))
    task = result.scalars().first()

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Update task title
    task.title = task_update.title
    await db.commit()
    await db.refresh(task)

    return task
