
# from fastapi import FastAPI
# from app.api.routes import router as analysis_router
# from app.api.auth_routes import router as auth_router
# from fastapi.middleware.cors import CORSMiddleware

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:3000"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# app = FastAPI(title="AI Beauty Consultant Backend")

# app.include_router(auth_router)
# app.include_router(analysis_router)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# 1️⃣ CREATE APP FIRST
app = FastAPI(
    title="AI Beauty Consultant Backend",
    version="1.0"
)

# 2️⃣ ADD MIDDLEWARE AFTER app IS DEFINED
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3️⃣ IMPORT ROUTERS AFTER app EXISTS
from app.api.routes import router as analysis_router
from app.api.auth_routes import router as auth_router

# 4️⃣ REGISTER ROUTERS
app.include_router(auth_router)
app.include_router(analysis_router)
