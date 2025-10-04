# dbQualityFusion

## Project Description

dbQualityFusion is an AI-driven validation pipeline that automates data quality testing using Langchain and OpenAI. The system leverages Large Language Models to generate comprehensive dbt tests, detect SQL anomalies, and streamline quality checks across your data infrastructure. Built with modern React and Node.js, it provides an intuitive dashboard for surfacing data quality issues faster than ever.

### Key Features

- 🤖 **AI-Powered Test Generation**: Automatically generates 60+ dbt tests using OpenAI GPT-4
- 🔍 **SQL Anomaly Detection**: LLM-based analysis of SQL queries for potential issues
- 📊 **Interactive Dashboard**: React-based UI for visualizing test results and quality metrics
- ⚡ **Real-time Validation**: Streamlined quality checks with immediate feedback
- 🎯 **Schema-Aware**: Intelligent test generation based on database schema analysis

## Technology Stack

- **Frontend**: React 19 with Material-UI components
- **Backend**: Node.js/Express with Langchain integration
- **AI/LLM**: OpenAI GPT-4 via Langchain.js
- **Database**: MySQL (with support for other SQL databases)
- **Data Transformation**: dbt (data build tool)
- **Visualization**: Recharts for quality metrics
- **Styling**: Material-UI with responsive design

## Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │  Express API    │    │   OpenAI API    │
│   Dashboard     │◄──►│  Langchain      │◄──►│   GPT-4         │
│                 │    │  Integration    │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │   MySQL DB      │
                       │   Schema        │
                       └─────────────────┘
```

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- MySQL database
- OpenAI API key
- Python 3.8+ (for dbt)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository_url>
   cd dbQualityFusion
   ```

2. **Install backend dependencies**:
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

4. **Configure environment variables**:
   ```bash
   # In backend directory, copy the example env file
   cp env.example .env
   
   # Edit .env with your configuration
   DB_HOST=localhost
   DB_USER=your_db_user
   DB_PASSWORD=your_db_password
   DB_DATABASE=your_db_database
   OPENAI_API_KEY=your_openai_api_key
   ```

5. **Set up dbt** (optional, for running generated tests):
   ```bash
   pip install dbt-mysql
   
   # Create dbt profiles
   mkdir -p ~/.dbt
   # Add your database connection to ~/.dbt/profiles.yml
   ```

### OpenAI API Key Setup

1. Visit [OpenAI Platform](https://platform.openai.com/)
2. Create an account and generate an API key
3. Add the key to your `.env` file as `OPENAI_API_KEY`
4. Ensure you have sufficient credits for API usage

## Running the Application

### Development Mode

1. **Start the backend server**:
   ```bash
   cd backend
   npm run dev  # Uses nodemon for auto-restart
   # or
   npm start
   ```

2. **Start the frontend development server**:
   ```bash
   cd frontend
   npm start
   ```

3. **Access the application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - Health check: http://localhost:3001/health

### Production Mode

1. **Build the frontend**:
   ```bash
   cd frontend
   npm run build
   ```

2. **Start the backend**:
   ```bash
   cd backend
   npm start
   ```

## API Endpoints

### Core Endpoints

- `GET /` - API information and features
- `GET /health` - Health check and configuration status
- `POST /schema` - Retrieve database schema
- `POST /generate-tests` - Generate dbt tests for a specific table
- `POST /generate-test-suite` - Generate comprehensive test suite for all tables
- `POST /detect-anomalies` - Analyze SQL query for anomalies
- `POST /run-tests` - Execute dbt tests (requires dbt installation)

### Example Usage

```bash
# Health check
curl http://localhost:3001/health

# Generate test suite
curl -X POST http://localhost:3001/generate-test-suite \
  -H "Content-Type: application/json" \
  -d '{
    "host": "localhost",
    "user": "root",
    "password": "password",
    "database": "testdb"
  }'

# Detect SQL anomalies
curl -X POST http://localhost:3001/detect-anomalies \
  -H "Content-Type: application/json" \
  -d '{
    "sqlQuery": "SELECT * FROM users WHERE id = 1",
    "tableSchema": {...}
  }'
```

## Features in Detail

### 1. AI-Powered Test Generation

The system uses OpenAI GPT-4 to generate comprehensive dbt tests based on:
- Database schema analysis
- Column types and constraints
- Sample data patterns
- Data quality best practices

Generated tests include:
- Unique constraints
- Not null validations
- Accepted values checks
- Relationship validations
- Custom SQL quality checks
- Data freshness tests
- Volume and statistical tests

### 2. SQL Anomaly Detection

Advanced LLM-based analysis identifies:
- Syntax errors and runtime issues
- Logic problems and incorrect results
- Performance concerns (missing indexes, inefficient joins)
- Data quality issues (null handling, type mismatches)
- Security vulnerabilities (SQL injection risks)
- Best practice violations

### 3. Interactive Dashboard

The React dashboard provides:
- Database connection management
- Schema visualization with expandable tables
- Test generation and execution
- Anomaly detection interface
- Quality metrics visualization
- Real-time status updates

