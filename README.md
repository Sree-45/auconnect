# AuConnect

AuConnect is a university-centric social networking platform designed to connect students, faculty, and staff. It provides features such as user registration, profile management, messaging, events, and more, tailored to foster collaboration and communication within the academic community.

## Features

- **User Registration and Login**: Secure user authentication with email verification.
- **Profile Management**: Users can create and update their profiles, including uploading profile and cover photos.
- **Connections**: Send, accept, reject, and manage connection requests between users.
- **Messaging**: Real-time messaging with support for attachments (images, videos, and documents).
- **University Contact Management**: Manage and display university contact details.
- **File Uploads**: Support for uploading images, videos, and other media.
- **News and Events**: Stay updated with university news and events.
- **Marketplace**: A platform for students to post and accept gigs.
- **Responsive Design**: Optimized for both desktop and mobile devices.

## Project Structure

### Backend (backend)
- **Framework**: Spring Boot
- **Language**: Java
- **Database**: MySQL
- **Key Directories**:
  - `src/main/java`: Contains the main application code.
    - `controller`: REST API endpoints.
    - `service`: Business logic.
    - `model`: Entity classes.
    - `repository`: Database access layer.
    - `config`: Configuration files.
  - `src/main/resources`: Configuration files like application.properties.

### Frontend (frontend)
- **Framework**: React.js
- **Language**: JavaScript
- **Key Directories**:
  - `src/components`: React components.
  - `src/assets`: Static assets like images.
  - `src/utils`: Utility functions.

## Prerequisites

### Backend:
- Java 17+
- Maven 3.8+
- MySQL 8.0+

### Frontend:
- Node.js 16+
- npm 8+

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/auconnect.git
cd auconnect
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd backend
```

Configure the database in application.properties:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/auconnect
spring.datasource.username=YOUR_DB_USERNAME
spring.datasource.password=YOUR_DB_PASSWORD
```

Update the email domain in the following files:

- **UserController.java**:
  - Locate the following line:
  ```java
  if (!userDto.getEmail().endsWith("@anurag.edu.in")) {
  ```
  - Replace `@anurag.edu.in` with your desired domain.

- **Register.jsx**:
  - Locate the following line:
  ```javascript
  else if (!formData.email.endsWith('@anurag.edu.in')) {
  ```
  - Replace `@anurag.edu.in` with your desired domain.

- **Login.jsx**:
  - Add email validation logic if required.

Build and run the backend:
```bash
./mvnw spring-boot:run
```

The backend will be available at http://localhost:8080.

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd ../frontend
```

Install dependencies:
```bash
npm install
```

Start the development server:
```bash
npm run dev
```

The frontend will be available at http://localhost:5173.

## How to Run

Start the backend server:
```bash
cd backend
./mvnw spring-boot:run
```

Start the frontend development server:
```bash
cd frontend
npm run dev
```

Open your browser and navigate to http://localhost:5173.

## File Uploads
Uploaded files (e.g., profile photos, post images) are stored in the `uploads` directory. The `WebConfig.java` file maps this directory to the `/uploads/**` URL path.

## API Endpoints

### Backend API

#### User Management:
- `POST /register/initiate` - Initiate user registration.
- `POST /register/verify` - Verify OTP and complete registration.
- `POST /login` - User login.
- `GET /profile` - Fetch user profile.
- `PUT /profile` - Update user profile.
- `DELETE /profile/delete` - Delete user account.

#### Connections:
- `POST /api/connections/connect` - Send a connection request.
- `POST /api/connections/accept` - Accept a connection request.
- `POST /api/connections/reject` - Reject a connection request.
- `POST /api/connections/disconnect` - Disconnect from a user.
- `GET /api/connections/requests` - Get pending connection requests.
- `GET /api/connections/user/{username}` - Get user connections.

#### University Contact:
- `GET /university/contact` - Fetch university contact details.
- `POST /university/contact` - Update university contact details.
- `DELETE /university/contact` - Delete university contact details.

#### Messaging:
- `POST /api/messages/send` - Send a message.
- `GET /api/messages/conversations` - Fetch all conversations for a user.
- `GET /api/messages/conversation/{otherUsername}` - Fetch messages in a conversation.

#### Marketplace:
- `GET /api/marketplace` - Fetch all gigs.
- `POST /api/marketplace` - Create a new gig.
- `GET /api/marketplace/user/{username}` - Fetch gigs by a user.

## Configuration

### Email Configuration
The email service is configured in application.properties:
```properties
spring.mail.host=smtp.gmail.com
spring.mail.port=587
spring.mail.username=YOUR_EMAIL
spring.mail.password=YOUR_PASSWORD
```

Replace `YOUR_EMAIL` and `YOUR_PASSWORD` with your email credentials.
