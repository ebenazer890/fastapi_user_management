from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel, Field, Session, create_engine,select
app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://127.0.0.1:8080",
        "https://6a844283d52e49122678a5a9--coruscating-paletas-f2a6c3.netlify.app",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
class User(SQLModel,table=True):
    id:int=Field(default=None,primary_key=True)     
    name:str
    age:int
c="sqlite:///database.db"
v=create_engine(c,connect_args={"check_same_thread":False})     
SQLModel.metadata.create_all(v)
@app.get("/")
def read_root():
    return {"Hello": "welcome to my API!"}
@app.post("/user")
def create_user(user: User):
    with Session(v) as session:
        session.add(user)
        session.commit()
        session.refresh(user)
    return user
@app.get("/users")  
def get_users():
    with Session(v) as session:
        Users=session.exec(select(User)).all() 
        return Users
@app.get("/users/{user_id}")
def get_user(user_id: int):
    with Session(v) as session:  
        user = session.get(User, user_id)
    return user
@app.put("/users/{user_id}")
def update(user_id: int, user_data: User):
    with Session(v) as session:
        user = session.get(User, user_id)
        if user is None:
            return {"message":"User not found"}
    user.name=user_data.name
    user.age=user_data.age  
    session.add(user)
    session.commit()
    session.refresh(user)
    return user
@app.delete("/users/{user_id}")
def delete_user(user_id:int):
    with Session(v) as session:
        user=session.get(User,user_id)
        if user is None:
            return {"message":"User not found"}
        session.delete(user)
        session.commit() 
        return {"message":"User deleted successfully"}   
@app.delete("/users")
def delete_all_users():
    with Session(v) as session:
        users = session.exec(select(User)).all()
        for user in users:
            session.delete(user)
        session.commit()
        return {"message": "All users deleted successfully"}
        