import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Database, Info, Play } from 'lucide-react';
import { useDatabase } from '../lib/DatabaseContext';

interface QueryResult {
  columns: string[];
  rows: any[];
  error?: string;
}

const exampleQueries = [
  { name: 'All Patients', query: 'SELECT * FROM patients LIMIT 10' },
  { name: 'Male Patients', query: "SELECT * FROM patients WHERE gender = 'Male'" },
  { name: 'Female Patients', query: "SELECT * FROM patients WHERE gender = 'Female'" },
  { name: 'Patients by Age', query: "SELECT first_name, last_name, date_of_birth, (strftime('%Y', 'now') - strftime('%Y', date_of_birth)) - (strftime('%m-%d', 'now') < strftime('%m-%d', date_of_birth)) AS age FROM patients ORDER BY age DESC" },
];

const SQLQueryPage: React.FC = () => {
  const { executeQuery } = useDatabase();
  const [query, setQuery] = useState('SELECT * FROM patients LIMIT 10');
  const [result, setResult] = useState<QueryResult | null>(null);
  const [loading, setLoading] = useState(false);
  
  const handleQueryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setQuery(e.target.value);
  };
  
  const handleExampleQuery = (exampleQuery: string) => {
    setQuery(exampleQuery);
  };
  
  const handleRunQuery = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const result = await executeQuery(query);
      
      // Extract column names from the first row if available
      let columns: string[] = [];
      if (result.rows && result.rows.length > 0) {
        columns = Object.keys(result.rows[0]);
      }
      
      setResult({
        columns,
        rows: result.rows || [],
      });
    } catch (error) {
      console.error('Query error:', error);
      setResult({
        columns: [],
        rows: [],
        error: error instanceof Error ? error.message : 'An unknown error occurred',
      });
    } finally {
      setLoading(false);
    }
  };
  
  const handleClear = () => {
    setQuery('');
    setResult(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6"
    >
      <div className="flex items-center">
        <Database className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">SQL Query Interface</h1>
      </div>
      
      <p className="text-gray-600">
        Run custom SQL queries to analyze and extract patient data. Use the example queries to get started.
      </p>
      
      <div className="card p-6">
        <div className="mb-4">
          <h2 className="text-lg font-semibold mb-2 flex items-center">
            <Info className="h-4 w-4 mr-1 text-secondary" />
            Example Queries
          </h2>
          <div className="flex flex-wrap gap-2">
            {exampleQueries.map((ex, index) => (
              <button
                key={index}
                onClick={() => handleExampleQuery(ex.query)}
                className="px-3 py-1 text-sm rounded-full bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
              >
                {ex.name}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <textarea
            value={query}
            onChange={handleQueryChange}
            className="w-full h-36 p-3 font-mono text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Enter SQL query..."
          />
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={handleClear}
            className="btn btn-outline"
          >
            Clear
          </button>
          <button
            onClick={handleRunQuery}
            disabled={loading || !query.trim()}
            className="btn btn-primary inline-flex items-center"
          >
            {loading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Running...
              </span>
            ) : (
              <>
                <Play className="h-4 w-4 mr-2" />
                Run Query
              </>
            )}
          </button>
        </div>
      </div>
      
      {/* Query Results */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="p-4 border-b">
            <h2 className="font-semibold">Query Results</h2>
          </div>
          
          {result.error ? (
            <div className="p-4 text-error">
              <h3 className="font-semibold mb-2">Error</h3>
              <pre className="bg-error/10 p-3 rounded-md overflow-x-auto whitespace-pre-wrap">
                {result.error}
              </pre>
            </div>
          ) : result.rows.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No results found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    {result.columns.map((column, index) => (
                      <th
                        key={index}
                        className="px-4 py-3 text-left font-medium text-gray-500"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {result.rows.map((row, rowIndex) => (
                    <tr key={rowIndex} className="hover:bg-gray-50">
                      {result.columns.map((column, colIndex) => (
                        <td key={colIndex} className="px-4 py-3">
                          {row[column] === null ? (
                            <span className="text-gray-400">NULL</span>
                          ) : (
                            String(row[column])
                          )}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};

export default SQLQueryPage;