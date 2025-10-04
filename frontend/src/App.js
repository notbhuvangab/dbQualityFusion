import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  TextField,
  Button,
  Box,
  Tabs,
  Tab,
  Alert,
  CircularProgress,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import {
  Database as DatabaseIcon,
  BugReport as BugIcon,
  Assessment as AssessmentIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  PlayArrow as PlayIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import axios from 'axios';
import './App.css';

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function App() {
  const [tabValue, setTabValue] = useState(0);
  const [dbConfig, setDbConfig] = useState({
    host: '',
    user: '',
    password: '',
    database: '',
  });
  const [schema, setSchema] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [anomalies, setAnomalies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sqlQuery, setSqlQuery] = useState('');
  const [healthStatus, setHealthStatus] = useState(null);

  const API_BASE = 'http://localhost:3001';

  useEffect(() => {
    checkHealth();
  }, []);

  const checkHealth = async () => {
    try {
      const response = await axios.get(`${API_BASE}/health`);
      setHealthStatus(response.data);
    } catch (error) {
      console.error('Health check failed:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleChange = (e) => {
    setDbConfig({ ...dbConfig, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE}/schema`, dbConfig);
      setSchema(response.data);
      setTabValue(1); // Switch to schema tab
    } catch (error) {
      setError('Failed to connect to database: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateTestSuite = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE}/generate-test-suite`, dbConfig);
      setTestResults(response.data);
      setTabValue(2); // Switch to tests tab
    } catch (error) {
      setError('Failed to generate test suite: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const detectAnomalies = async () => {
    if (!sqlQuery.trim()) {
      setError('Please enter a SQL query');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${API_BASE}/detect-anomalies`, {
        sqlQuery: sqlQuery,
        tableSchema: schema
      });
      setAnomalies([response.data]);
      setTabValue(3); // Switch to anomalies tab
    } catch (error) {
      setError('Failed to detect anomalies: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return '#f44336';
      case 'HIGH': return '#ff9800';
      case 'MEDIUM': return '#ffc107';
      case 'LOW': return '#4caf50';
      default: return '#9e9e9e';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toUpperCase()) {
      case 'CRITICAL': return <ErrorIcon />;
      case 'HIGH': return <WarningIcon />;
      case 'MEDIUM': return <InfoIcon />;
      case 'LOW': return <CheckIcon />;
      default: return <InfoIcon />;
    }
  };

  // Mock data for charts
  const qualityMetrics = [
    { name: 'Jan', passed: 45, failed: 5 },
    { name: 'Feb', passed: 47, failed: 3 },
    { name: 'Mar', passed: 42, failed: 8 },
    { name: 'Apr', passed: 48, failed: 2 },
    { name: 'May', passed: 46, failed: 4 },
  ];

  const testDistribution = [
    { name: 'Passed', value: 85, color: '#4caf50' },
    { name: 'Failed', value: 10, color: '#f44336' },
    { name: 'Skipped', value: 5, color: '#ff9800' },
  ];

  return (
    <div className="App">
      <AppBar position="static">
        <Toolbar>
          <DatabaseIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            dbQualityFusion - AI-Driven Data Quality Pipeline
          </Typography>
          {healthStatus && (
            <Chip
              label={healthStatus.openaiConfigured ? 'AI Ready' : 'AI Not Configured'}
              color={healthStatus.openaiConfigured ? 'success' : 'error'}
              size="small"
            />
          )}
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="main tabs">
            <Tab label="Database Connection" icon={<DatabaseIcon />} />
            <Tab label="Schema Analysis" icon={<AssessmentIcon />} />
            <Tab label="Test Generation" icon={<PlayIcon />} />
            <Tab label="Anomaly Detection" icon={<BugIcon />} />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Database Connection
                  </Typography>
                  <form onSubmit={handleSubmit}>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Host"
                          name="host"
                          value={dbConfig.host}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Username"
                          name="user"
                          value={dbConfig.user}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField
                          fullWidth
                          label="Password"
                          name="password"
                          type="password"
                          value={dbConfig.password}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <TextField
                          fullWidth
                          label="Database"
                          name="database"
                          value={dbConfig.database}
                          onChange={handleChange}
                          required
                        />
                      </Grid>
                      <Grid item xs={12}>
                        <Button
                          type="submit"
                          variant="contained"
                          fullWidth
                          disabled={loading}
                          startIcon={loading ? <CircularProgress size={20} /> : <DatabaseIcon />}
                        >
                          {loading ? 'Connecting...' : 'Connect to Database'}
                        </Button>
                      </Grid>
                    </Grid>
                  </form>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Quality Metrics
                  </Typography>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={qualityMetrics}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="passed" stroke="#4caf50" name="Passed Tests" />
                      <Line type="monotone" dataKey="failed" stroke="#f44336" name="Failed Tests" />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </TabPanel>

        <TabPanel value={tabValue} index={1}>
          {schema ? (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography variant="h6">
                        Database Schema ({Object.keys(schema).length} tables)
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={generateTestSuite}
                        disabled={loading}
                        startIcon={loading ? <CircularProgress size={20} /> : <PlayIcon />}
                      >
                        {loading ? 'Generating...' : 'Generate AI Test Suite'}
                      </Button>
                    </Box>
                    {Object.entries(schema).map(([tableName, tableData]) => (
                      <Accordion key={tableName}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1">{tableName}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <TableContainer>
                            <Table size="small">
                              <TableHead>
                                <TableRow>
                                  <TableCell>Column</TableCell>
                                  <TableCell>Type</TableCell>
                                  <TableCell>Nullable</TableCell>
                                  <TableCell>Default</TableCell>
                                </TableRow>
                              </TableHead>
                              <TableBody>
                                {tableData.columns.map((column, index) => (
                                  <TableRow key={index}>
                                    <TableCell>{column.column_name}</TableCell>
                                    <TableCell>{column.data_type}</TableCell>
                                    <TableCell>{column.is_nullable}</TableCell>
                                    <TableCell>{column.column_default || '-'}</TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </TableContainer>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">
              Please connect to a database first to view the schema.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={2}>
          {testResults ? (
            <Grid container spacing={3}>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Test Distribution
                    </Typography>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={testDistribution}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}%`}
                        >
                          {testDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Generated Tests ({testResults.totalTables} tables)
                    </Typography>
                    {Object.entries(testResults.testSuite).map(([tableName, tests]) => (
                      <Accordion key={tableName}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Typography variant="subtitle1">{tableName}</Typography>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                              {typeof tests === 'string' ? tests : JSON.stringify(tests, null, 2)}
                            </pre>
                          </Paper>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          ) : (
            <Alert severity="info">
              Generate a test suite to view AI-generated dbt tests.
            </Alert>
          )}
        </TabPanel>

        <TabPanel value={tabValue} index={3}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    SQL Anomaly Detection
                  </Typography>
                  <Box display="flex" gap={2} mb={2}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="SQL Query"
                      value={sqlQuery}
                      onChange={(e) => setSqlQuery(e.target.value)}
                      placeholder="Enter SQL query to analyze..."
                    />
                    <Button
                      variant="contained"
                      onClick={detectAnomalies}
                      disabled={loading}
                      startIcon={loading ? <CircularProgress size={20} /> : <BugIcon />}
                      sx={{ minWidth: 150 }}
                    >
                      {loading ? 'Analyzing...' : 'Detect Anomalies'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            {anomalies.length > 0 && (
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Detected Anomalies
                    </Typography>
                    {anomalies.map((anomaly, index) => (
                      <Accordion key={index}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box display="flex" alignItems="center" gap={1}>
                            <BugIcon />
                            <Typography>SQL Query Analysis</Typography>
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Paper sx={{ p: 2, backgroundColor: '#f5f5f5' }}>
                            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '12px' }}>
                              {anomaly.anomalies}
                            </pre>
                          </Paper>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </CardContent>
                </Card>
              </Grid>
            )}
          </Grid>
        </TabPanel>
      </Container>
    </div>
  );
}

export default App;
