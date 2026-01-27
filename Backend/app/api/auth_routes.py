




# from fastapi import APIRouter, HTTPException, Depends
# from fastapi.security import OAuth2PasswordRequestForm

# from app.mongodb.user_collection import user_collection
# from app.auth.security import hash_password, verify_password
# from app.auth.jwt_handler import create_access_token

# router = APIRouter(prefix="/auth", tags=["Auth"])


# @router.post("/signup")
# def signup(user: dict):
#     email = user.get("email")
#     password = user.get("password")

#     if not email or not password:
#         raise HTTPException(status_code=400, detail="Email and password required")

#     if user_collection.find_one({"email": email}):
#         raise HTTPException(status_code=400, detail="User already exists")

#     user_doc = {
#         "email": email,
#         "password": hash_password(password),
#         "role": "user"
#     }

#     user_collection.insert_one(user_doc)

#     return {"message": "User registered successfully"}


# @router.post("/login")
# def login(form_data: OAuth2PasswordRequestForm = Depends()):
#     user = user_collection.find_one({"email": form_data.username})

#     if not user:
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     if not verify_password(form_data.password, user["password"]):
#         raise HTTPException(status_code=401, detail="Invalid credentials")

#     token = create_access_token({
#         "sub": user["email"],
#         "role": user["role"]
#     })

#     return {
#         "access_token": token,
#         "token_type": "bearer"
#     }



from fastapi import APIRouter, HTTPException
from app.mongodb.user_collection import user_collection
from app.auth.security import hash_password, verify_password
from app.auth.jwt_handler import create_access_token
from app.auth.schemas import UserAuth

router = APIRouter(prefix="/auth", tags=["Auth"])


@router.post("/signup")
def signup(user: UserAuth):
    if user_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="User already exists")

    raw_password = user.password.strip()

    user_doc = {
        "email": user.email,
        "password": hash_password(raw_password),
        "role": "user"
    }

    user_collection.insert_one(user_doc)
    return {"message": "User registered successfully"}


@router.post("/login")
def login(user: UserAuth):
    db_user = user_collection.find_one({"email": user.email})
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user.password, db_user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({
        "sub": db_user["email"],
        "role": db_user["role"]
    })

    return {"access_token": token}
