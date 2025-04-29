# dbQualityFusion

## Project Description

dbQualityFusion is an automated data quality testing system that leverages an LLM to generate and run dbt tests based on database schema information. The system takes database/table schema as input, analyzes it using an LLM, generates dbt tests (SQL queries within YAML), displays the proposed tests to the user, allows the user to run the tests, and displays the results in a tabular format.

## Technology Stack

*   Frontend: React
*   Backend: Node.js/Express
*   Database: MySQL
*   Data Transformation: dbt
*   LLM: NVIDIA NIM

## Setup Instructions

1.  Clone the repository: `git clone <repository_url>`
2.  Navigate to the project directory: `cd dbQualityFusion`
3.  Install frontend dependencies: `cd frontend && npm install`
4.  Install backend dependencies: `cd ../backend && npm install`
5.  Configure the database connection:
    *   Create a `.env` file in the `backend` directory.
    *   Add the following environment variables:
        ```
        DB_HOST=<your_db_host>
        DB_USER=<your_db_user>
        DB_PASSWORD=<your_db_password>
        DB_DATABASE=<your_db_database>
        ```
6.  Set up dbt:
    *   Install dbt: `pip install dbt-mysql`
    *   Configure your dbt project:
        *   Create a `profiles.yml` file in your `~/.dbt/` directory.
        *   Add your MySQL connection details to the `profiles.yml` file.
    *   Initialize your dbt project: `dbt init`
    *   Configure your dbt project to connect to your MySQL database.
7.  Obtain the NVIDIA NIM API key:
    *   Follow the instructions on the NVIDIA NIM website to obtain an API key.
    *   Set the `NIM_API_KEY` environment variable in the `.env` file in the `backend` directory.

## Running the Application

1.  Start the frontend server: `cd frontend && npm start`
2.  Start the backend server: `cd backend && node server.js`

## Docker Instructions

1.  Build the Docker image: `docker build -t dbqualityfusion .`
2.  Run the Docker container: `docker run -p 3000:3000 -p 3001:3001 dbqualityfusion`

## OpenAI API Key

To use the LLM functionality, you need to obtain an OpenAI API key and set the `NIM_API_KEY` environment variable in the `.env` file in the `backend` directory.
