# QamqorPaw - Pet Adoption Platform

QamqorPaw is a comprehensive pet adoption and fostering platform designed to connect pets in need with loving homes. The name "Qamqor" means "caretaker" or "guardian" in Kazakh, reflecting the platform's mission to provide care and protection for pets.

## Features

- **Pet Adoption**: Browse available dogs and cats for adoption
- **Shelter & Clinic Directory**: Find animal shelters and veterinary clinics
- **Pet Report System**: Report found pets to help reunite them with owners
- **User Profiles**: Save favorite pets, track adopted pets, and manage pet reports
- **Advanced Filtering**: Search pets by breed, age, size, location, and more
- **Interactive Map**: View shelters and clinics on a map interface

## Tech Stack

### Backend
- Django 4.2
- Django REST Framework
- PostgreSQL
- Gunicorn
- Docker

### Frontend
- React 18
- Material UI 5
- React Router
- Axios
- Leaflet (for maps)
- Docker

## Project Structure

```
qamqor_paw/
├── docker-compose.yml
├── .env
├── README.md
├── backend/
│   ├── Dockerfile
│   ├── entrypoint.sh
│   ├── requirements.txt
│   ├── manage.py
│   ├── qamqor_paw/           # Django project settings
│   ├── pets/                 # App for pets and pet reports
│   ├── shelters/             # App for shelters and clinics
│   └── users/                # App for user profiles
└── frontend/
    ├── Dockerfile
    ├── package.json
    ├── public/
    └── src/
        ├── App.js
        ├── components/
        ├── contexts/
        ├── services/
        └── utils/
```

## Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js (for local frontend development)
- Python 3.11 (for local backend development)

### Running with Docker

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/qamqor_paw.git
   cd qamqor_paw
   ```

2. Create a `.env` file in the root directory with the required environment variables (see `.env.example`).

3. Build and start the containers:
   ```
   docker-compose up --build
   ```

4. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/
   - Admin interface: http://localhost:8000/admin/

### Local Development

#### Backend

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Create and activate a virtual environment:
   ```
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```
   pip install -r requirements.txt
   ```

4. Run migrations:
   ```
   python manage.py migrate
   ```

5. Create a superuser:
   ```
   python manage.py createsuperuser
   ```

6. Start the development server:
   ```
   python manage.py runserver
   ```

#### Frontend

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development server:
   ```
   npm start
   ```

## API Documentation

The API documentation is available at `/api/docs/` when the backend server is running.

## Database Initialization

The project includes fixture data to populate the database with initial data. Load the fixtures with:

```
python manage.py loaddata cities breeds
```

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Open a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.