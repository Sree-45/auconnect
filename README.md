AuConnect
=========

AuConnect is a university-centric social networking platform designed to connect students, faculty, and staff. It provides features such as user registration, profile management, messaging, events, and more, tailored to foster collaboration and communication within the academic community.

* * * * *

Features
--------

-   **User Registration and Login**: Secure user authentication with email verification.
-   **Profile Management**: Users can create and update their profiles, including uploading profile and cover photos.
-   **Connections**: Send, accept, reject, and manage connection requests between users.
-   **Messaging**: Real-time messaging with support for attachments (images, videos, and documents).
-   **University Contact Management**: Manage and display university contact details.
-   **File Uploads**: Support for uploading images, videos, and other media.
-   **News and Events**: Stay updated with university news and events.
-   **Marketplace**: A platform for students to post and accept gigs.
-   **Responsive Design**: Optimized for both desktop and mobile devices.

* * * * *

Project Structure
-----------------

### Backend ([backend](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html))

-   **Framework**: Spring Boot
-   **Language**: Java
-   **Database**: MySQL
-   **Key Directories**:
    -   [src/main/java](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html): Contains the main application code.
        -   [controller](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html): REST API endpoints.
        -   [service](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html): Business logic.
        -   [model](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html): Entity classes.
        -   [repository](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html): Database access layer.
        -   [config](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html): Configuration files.
    -   [src/main/resources](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html): Configuration files like [application.properties](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html).

### Frontend ([frontend](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html))

-   **Framework**: React.js
-   **Language**: JavaScript
-   **Key Directories**:
    -   [src/components](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html): React components.
    -   [src/assets](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html): Static assets like images.
    -   [src/utils](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html): Utility functions.

* * * * *

Prerequisites
-------------

-   **Backend**:
    -   Java 17+
    -   Maven 3.8+
    -   MySQL 8.0+
-   **Frontend**:
    -   Node.js 16+
    -   npm 8+

* * * * *

Setup Instructions
------------------

### 1\. Clone the Repository

git clone https://github.com/your-username/auconnect.git

cd auconnect

### 2\. Backend Setup

1.  Navigate to the [backend](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) directory:

    cd backend

2.  Configure the database in [application.properties](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html):

    spring.datasource.url=jdbc:mysql://localhost:3306/auconnect

    spring.datasource.username=YOUR_DB_USERNAME

    spring.datasource.password=YOUR_DB_PASSWORD

3.  Update the email domain in the following files:

    -   **[UserController.java](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)**:
        -   Filepath: [UserController.java](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)
        -   Locate the following line:

            if (!userDto.getEmail().endsWith("@anurag.edu.in")) {

            Replace `@anurag.edu.in` with your desired domain.
    -   **[Register.jsx](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)**:
        -   Filepath: [Register.jsx](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)
        -   Locate the following line:

            else if (!formData.email.endsWith('@anurag.edu.in')) {

            Replace `@anurag.edu.in` with your desired domain.
    -   **[Login.jsx](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)**:
        -   Filepath: [Login.jsx](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html)
        -   Add email validation logic if required.
4.  Build and run the backend:

    ./mvnw spring-boot:run

5.  The backend will be available at [http://localhost:8080](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html).

### 3\. Frontend Setup

1.  Navigate to the [frontend](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) directory:

    cd ../frontend

2.  Install dependencies:

    npm install

3.  Start the development server:

    npm run dev

4.  The frontend will be available at [http://localhost:5173](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html).

* * * * *

How to Run
----------

1.  Start the backend server:

    cd backend

    ./mvnw spring-boot:run

2.  Start the frontend development server:

    cd frontend

    npm run dev

3.  Open your browser and navigate to [http://localhost:5173](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html).

* * * * *

File Uploads
------------

Uploaded files (e.g., profile photos, post images) are stored in the [uploads](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) directory. The [WebConfig.java](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html) file maps this directory to the `/uploads/**` URL path.

* * * * *

API Endpoints
-------------

### Backend API

-   **User Management**:

    -   `POST /register/initiate`: Initiate user registration.
    -   `POST /register/verify`: Verify OTP and complete registration.
    -   `POST /login`: User login.
    -   `GET /profile`: Fetch user profile.
    -   `PUT /profile`: Update user profile.
    -   `DELETE /profile/delete`: Delete user account.
-   **Connections**:

    -   `POST /api/connections/connect`: Send a connection request.
    -   `POST /api/connections/accept`: Accept a connection request.
    -   `POST /api/connections/reject`: Reject a connection request.
    -   `POST /api/connections/disconnect`: Disconnect from a user.
    -   `GET /api/connections/requests`: Get pending connection requests.
    -   `GET /api/connections/user/{username}`: Get user connections.
-   **University Contact**:

    -   `GET /university/contact`: Fetch university contact details.
    -   `POST /university/contact`: Update university contact details.
    -   `DELETE /university/contact`: Delete university contact details.
-   **Messaging**:

    -   `POST /api/messages/send`: Send a message.
    -   `GET /api/messages/conversations`: Fetch all conversations for a user.
    -   `GET /api/messages/conversation/{otherUsername}`: Fetch messages in a conversation.
-   **Marketplace**:

    -   `GET /api/marketplace`: Fetch all gigs.
    -   `POST /api/marketplace`: Create a new gig.
    -   `GET /api/marketplace/user/{username}`: Fetch gigs by a user.

* * * * *

Configuration
-------------

### Email Configuration

The email service is configured in [application.properties](vscode-file://vscode-app/c:/Users/srees/AppData/Local/Programs/Microsoft%20VS%20Code/resources/app/out/vs/code/electron-sandbox/workbench/workbench.html):

spring.mail.host=smtp.gmail.com

spring.mail.port=587

spring.mail.username=YOUR_EMAIL

spring.mail.password=YOUR_PASSWORD

Replace `YOUR_EMAIL` and `YOUR_PASSWORD` with your email credentials.

* * * * *
