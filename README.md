# Shraddha Sales

Premium appliance e-commerce app based on `saved.txt`.

## Run Locally

### Using Command Prompt

Open `cmd`, then run:

```cmd
cd /d "D:\STUDY\PROJECTS\shradhasales"
```

Install backend dependencies once:

```cmd
cd backend
python -m pip install -r requirements.txt
cd ..
```

Start the backend:

```cmd
start-backend.cmd
```
```cmd
start-frontend.cmd
```
Open another `cmd` window, go to the project folder again, then start the frontend:

```cmd
cd /d "C:\Users\Som\3D Objects\shradhasales"
start-frontend.cmd
```

### Using PowerShell

1. Install backend dependencies:

   ```powershell
   cd backend
   python -m pip install -r requirements.txt
   ```

2. Start the backend:

   ```powershell
   ..\start-backend.ps1
   ```

3. In another terminal, start the frontend:

   ```powershell
   .\start-frontend.ps1
   ```

Frontend: `http://localhost:4173`

Backend API: `http://localhost:8000/api`

MongoDB is optional for local development. If `mongodb://localhost:27017` is available, the backend uses it. If not, it automatically uses `backend/local_db.json`.

Seeded admin:

- Email: `admin@shraddhasales.com`
- Password: `admin123`

Seeded customer:

- Email: `customer@test.com`
- Password: `customer123`
