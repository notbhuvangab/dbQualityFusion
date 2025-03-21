const express = require('express');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3001;
const nimApiKey = process.env.NIM_API_KEY || 'YOUR_NIM_API_KEY';

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from the backend!');
});

async function getDatabaseSchema(dbConfig) {
  const connection = mysql.createConnection(dbConfig);

  try {
    await connection.connect();

    const [tables] = await connection.execute(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = ?",
      [dbConfig.database]
    );

    const schema = {};

    for (const table of tables) {
      const tableName = table.table_name;
      const [columns] = await connection.execute(
        "SELECT column_name, data_type, is_nullable FROM information_schema.columns WHERE table_name = ? AND table_schema = ?",
        [tableName, dbConfig.database]
      );

      schema[tableName] = columns;
    }

    return schema;
  } catch (error) {
    console.error("Error getting database schema:", error);
    throw error;
  } finally {
    await connection.end();
  }
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
