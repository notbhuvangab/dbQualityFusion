const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');
const { ChatOpenAI } = require('@langchain/openai');
const { ChatPromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { spawn } = require('child_process');
const yaml = require('yaml');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Initialize OpenAI with Langchain
const llm = new ChatOpenAI({
  model: 'gpt-4',
  temperature: 0,
  openAIApiKey: process.env.OPENAI_API_KEY,
});

// SQL Anomaly Detection Prompt
const anomalyDetectionPrompt = ChatPromptTemplate.fromTemplate(`
You are an expert SQL analyst and data quality engineer. Analyze the following SQL query for potential anomalies and data quality issues.

SQL Query: {sqlQuery}
Table Schema: {tableSchema}

Please identify:
1. Syntax errors or potential runtime errors
2. Logic issues that might produce incorrect results
3. Performance concerns (missing indexes, inefficient joins)
4. Data quality issues (null handling, data type mismatches)
5. Security vulnerabilities (SQL injection risks)
6. Best practice violations

Provide a detailed analysis with severity levels (CRITICAL, HIGH, MEDIUM, LOW) and specific recommendations for fixes.

Response format:
SEVERITY: [level]
ISSUE: [description]
RECOMMENDATION: [specific fix]
`);

// dbt Test Generation Prompt
const dbtTestPrompt = ChatPromptTemplate.fromTemplate(`
You are a data quality engineer specializing in dbt testing. Generate comprehensive dbt tests for the following table schema.

Table Name: {tableName}
Columns: {columns}
Sample Data: {sampleData}

Generate 10-15 different types of dbt tests including:
1. Unique tests
2. Not null tests
3. Accepted values tests
4. Relationships tests
5. Custom SQL tests for data quality checks
6. Data freshness tests
7. Volume tests
8. Statistical tests

Output the tests in YAML format suitable for dbt models. Each test should be well-documented and include appropriate test names and descriptions.

Focus on creating tests that would catch common data quality issues in this type of data.
`);

app.get('/', (req, res) => {
  res.json({
    message: 'dbQualityFusion AI-driven validation pipeline',
    version: '1.0.0',
    features: [
      'AI-powered dbt test generation',
      'SQL anomaly detection',
      'Automated quality checks',
      'LLM-based validation'
    ]
  });
});

async function getDatabaseSchema(dbConfig) {
  const connection = mysql.createConnection(dbConfig);

  try {
    await connection.connect();
    console.log("Connected to the database");
    
    // Fetching the list of tables in the database
    console.log("Fetching database schema...");
    const [tables] = await connection.execute(  
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ?",
      [dbConfig.database]
    );

    const schema = {};

    for (const table of tables) {
      const tableName = table.table_name;
      const [columns] = await connection.execute(
        "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = ? AND table_schema = ? ORDER BY ordinal_position",
        [tableName, dbConfig.database]
      );

      // Get sample data for better test generation
      const [sampleData] = await connection.execute(
        `SELECT * FROM ${tableName} LIMIT 5`
      ).catch(() => [[]]); // Handle errors gracefully

      schema[tableName] = {
        columns: columns,
        sampleData: sampleData
      };
    }

    return schema;
  } catch (error) {
    console.error("Error getting database schema:", error);
    throw error;
  } finally {
    await connection.end();
  }
}

// Generate dbt tests using AI
async function generateDbtTests(tableName, columns, sampleData) {
  try {
    const outputParser = new StringOutputParser();
    const chain = dbtTestPrompt.pipe(llm).pipe(outputParser);
    
    const result = await chain.invoke({
      tableName: tableName,
      columns: JSON.stringify(columns),
      sampleData: JSON.stringify(sampleData)
    });

    return result;
  } catch (error) {
    console.error("Error generating dbt tests:", error);
    throw error;
  }
}

// Detect SQL anomalies using AI
async function detectSQLAnomalies(sqlQuery, tableSchema) {
  try {
    const outputParser = new StringOutputParser();
    const chain = anomalyDetectionPrompt.pipe(llm).pipe(outputParser);
    
    const result = await chain.invoke({
      sqlQuery: sqlQuery,
      tableSchema: JSON.stringify(tableSchema)
    });

    return result;
  } catch (error) {
    console.error("Error detecting SQL anomalies:", error);
    throw error;
  }
}

// Run dbt tests
async function runDbtTests(projectPath) {
  return new Promise((resolve, reject) => {
    const dbtProcess = spawn('dbt', ['test', '--project-dir', projectPath], {
      stdio: 'pipe'
    });

    let stdout = '';
    let stderr = '';

    dbtProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    dbtProcess.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    dbtProcess.on('close', (code) => {
      resolve({
        exitCode: code,
        stdout: stdout,
        stderr: stderr
      });
    });

    dbtProcess.on('error', (error) => {
      reject(error);
    });
  });
}

app.post('/schema', async (req, res) => {
  try {
    const dbConfig = {
      host: req.body.host,
      user: req.body.user,
      password: req.body.password,
      database: req.body.database,
    };

    const schema = await getDatabaseSchema(dbConfig);
    res.json(schema);
  } catch (error) {
    console.error("Error getting schema:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate dbt tests for a specific table
app.post('/generate-tests', async (req, res) => {
  try {
    const { tableName, columns, sampleData } = req.body;
    
    if (!tableName || !columns) {
      return res.status(400).json({ error: 'Table name and columns are required' });
    }

    const tests = await generateDbtTests(tableName, columns, sampleData);
    res.json({ tests, tableName });
  } catch (error) {
    console.error("Error generating tests:", error);
    res.status(500).json({ error: error.message });
  }
});

// Detect SQL anomalies
app.post('/detect-anomalies', async (req, res) => {
  try {
    const { sqlQuery, tableSchema } = req.body;
    
    if (!sqlQuery) {
      return res.status(400).json({ error: 'SQL query is required' });
    }

    const anomalies = await detectSQLAnomalies(sqlQuery, tableSchema);
    res.json({ anomalies, sqlQuery });
  } catch (error) {
    console.error("Error detecting anomalies:", error);
    res.status(500).json({ error: error.message });
  }
});

// Run dbt tests
app.post('/run-tests', async (req, res) => {
  try {
    const { projectPath } = req.body;
    
    if (!projectPath) {
      return res.status(400).json({ error: 'Project path is required' });
    }

    const testResults = await runDbtTests(projectPath);
    res.json(testResults);
  } catch (error) {
    console.error("Error running tests:", error);
    res.status(500).json({ error: error.message });
  }
});

// Generate comprehensive test suite for all tables
app.post('/generate-test-suite', async (req, res) => {
  try {
    const dbConfig = {
      host: req.body.host,
      user: req.body.user,
      password: req.body.password,
      database: req.body.database,
    };

    const schema = await getDatabaseSchema(dbConfig);
    const testSuite = {};

    for (const [tableName, tableData] of Object.entries(schema)) {
      try {
        const tests = await generateDbtTests(tableName, tableData.columns, tableData.sampleData);
        testSuite[tableName] = tests;
      } catch (error) {
        console.error(`Error generating tests for ${tableName}:`, error);
        testSuite[tableName] = { error: error.message };
      }
    }

    res.json({ testSuite, totalTables: Object.keys(schema).length });
  } catch (error) {
    console.error("Error generating test suite:", error);
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    openaiConfigured: !!process.env.OPENAI_API_KEY
  });
});

app.listen(port, () => {
  console.log(`dbQualityFusion API server is running on port ${port}`);
  console.log(`OpenAI configured: ${!!process.env.OPENAI_API_KEY}`);
});
