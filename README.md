# WeddingApp

## Overview

**WeddingApp** is a web-based application designed to manage wedding invitations and guest responses. It allows guests to log in, fill out forms for each invitee, and leave comments or ideas for the couple. Administrators can manage users, monitor form responses, and read comments from the guests.

## Features

- **Guest Login**: Guests can log in using a username and password.
- **Form Submission**: Each guest can submit forms for multiple invitees under their account.
- **Comment Section**: Guests can leave comments or ideas for the couple, visible only if they accept the invitation.
- **Admin Panel**: Administrators can manage users, view form responses, and read comments.

## Technology Stack

- **Frontend**: React.js
- **Backend**: Flask (Python)
- **Database**: SQLite
- **CSS Framework**: Custom CSS with Google Fonts (WindSong)

## Installation

### Prerequisites

- Node.js
- Python 3.10
- pip (Python package installer)

### Backend Setup

1. Clone the repository:

    ```bash
    git clone https://github.com/your-repo/weddingapp.git
    cd weddingapp
    ```

2. Create a virtual environment:

    ```bash
    python -m venv backend_wedding
    ```

3. Activate the virtual environment:

    - On Windows:
    
        ```bash
        backend_wedding\Scripts\activate
        ```
    
    - On macOS/Linux:
    
        ```bash
        source backend_wedding/bin/activate
        ```

4. Install the required packages:

    ```bash
    pip install -r requirements.txt
    ```

5. Run the Flask application:

    ```bash
    python app.py
    ```

### Frontend Setup

1. Navigate to the frontend directory:

    ```bash
    cd frontend_wedding
    ```

2. Install the required Node.js packages:

    ```bash
    npm install
    ```

3. Start the React development server:

    ```bash
    npm start
    ```

### Database Setup

1. Flask will automatically create the SQLite database (`app.db`) when you first run the backend.

2. If you need to make migrations, use the following commands:

    ```bash
    flask db init
    flask db migrate -m "Initial migration."
    flask db upgrade
    ```

## Altering the Database Table Directly

In some cases, you may need to directly alter the database tables (e.g., to add, modify, or remove columns). Here’s how you can do it:

### Using SQLite Command Line

1. Open the SQLite command line interface (CLI):

    ```bash
    sqlite3 app.db
    ```

2. List all tables to ensure you're working with the correct one:

    ```sql
    .tables
    ```

3. Use the following SQL commands to modify the table:

   - **Add a new column**:

    ```sql
    ALTER TABLE table_name ADD COLUMN new_column_name column_type;
    ```

   - **Rename a column** (Note: SQLite does not directly support renaming columns, so you'd need to create a new table, copy the data, and rename it):

    ```sql
    ALTER TABLE old_table_name RENAME TO new_table_name;
    ```

   - **Drop a column** (Note: SQLite does not directly support dropping columns, so you'd need to create a new table without the column, copy the data, and rename it):

    ```sql
    -- Create a new table without the column to drop
    CREATE TABLE new_table AS SELECT existing_column1, existing_column2 FROM old_table;

    -- Drop the old table
    DROP TABLE old_table;

    -- Rename the new table to the original table name
    ALTER TABLE new_table RENAME TO old_table;
    ```

4. Exit the SQLite CLI:

    ```bash
    .exit
    ```

### Using a Database Manager (e.g., DB Browser for SQLite)

1. Open your SQLite database (`app.db`) using a GUI database manager.
2. Navigate to the **"Database Structure"** tab.
3. Select the table you want to modify.
4. Use the GUI options to add, rename, or remove columns.

### Reflecting Changes in Your Application

After altering the database, make sure your application code reflects the changes. Update your SQLAlchemy models and any queries that interact with the altered tables.

## Usage

### Accessing the Application

- **Guests**: Guests can log in and access the guest details page to fill out forms and leave comments.
- **Admin**: Admins can log in and access the admin panel to manage users, view forms, and read comments.

### Admin Panel

- **Manage Users**: Add, edit, or remove users. Assign `name_surname` values for each guest.
- **View Form Responses**: See all the forms submitted by guests.
- **View Comments**: Read comments submitted by guests after accepting the invitation.

## Deployment

To deploy the application:

1. Set up a server (e.g., AWS, Heroku).
2. Install the necessary dependencies on the server.
3. Configure the environment variables as needed.
4. Deploy both the frontend and backend, ensuring they are properly connected.

## CSS Customization

The application uses custom CSS with Google Fonts for a tailored look:

- **Font**: WindSong for a beautiful, curvy aesthetic.
- **Background**: Slightly off-white (`#fafafa`) with a soft pink theme for buttons.
- **Fixed Background Image**: The image stays fixed at the top, with text and separator scrolling over it.

## Contributing

1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit and push your changes (`git push origin feature-branch`).
5. Create a pull request.
