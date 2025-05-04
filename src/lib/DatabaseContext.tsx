import { createContext, useContext, useEffect, useState } from 'react';
import { PGlite } from '@electric-sql/pglite';

const SCHEMA = `
CREATE TABLE IF NOT EXISTS patients (
  id SERIAL PRIMARY KEY,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  gender TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  blood_group TEXT,
  emergency_contact TEXT,
  medical_history TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_patients_gender ON patients(gender);
CREATE INDEX IF NOT EXISTS idx_patients_date_of_birth ON patients(date_of_birth);
CREATE INDEX IF NOT EXISTS idx_patients_created_at ON patients(created_at);
`;

export interface Patient {
  id: number;
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  email?: string;
  phone?: string;
  address?: string;
  blood_group?: string;
  emergency_contact?: string;
  medical_history?: string;
  created_at: string;
}

export interface PatientStats {
  total: number;
  newThisWeek: number;
  maleCount: number;
  femaleCount: number;
}

interface DatabaseContextType {
  db: any;
  initialized: boolean;
  error: Error | null;
  executeQuery: (sql: string, params?: any[]) => Promise<any>;
  getPatients: () => Promise<Patient[]>;
  addPatient: (patient: Omit<Patient, 'id' | 'created_at'>) => Promise<number>;
  getPatientStats: () => Promise<PatientStats>;
}

// Create BroadcastChannel once and reuse
const broadcast = new BroadcastChannel('patients_channel');

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export const DatabaseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [db, setDb] = useState<any>(null);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const initializeDatabase = async () => {
      try {
        const dbInstance = await PGlite.create();
        await dbInstance.exec(SCHEMA);

        setDb(dbInstance);
        setInitialized(true);
      } catch (err) {
        console.error('Failed to initialize database:', err);
        setError(err instanceof Error ? err : new Error('Unknown database error'));
      }
    };

    initializeDatabase();
  }, []);

  const executeQuery = async (sql: string, params: any[] = []) => {
    if (!db) throw new Error('Database not initialized');
    try {
      return await db.query(sql, params);
    } catch (err) {
      console.error('Query error:', sql, err);
      throw err;
    }
  };

  const getPatients = async (): Promise<Patient[]> => {
    const result = await executeQuery('SELECT * FROM patients ORDER BY created_at DESC');
    return result.rows || [];
  };

  const addPatient = async (
    patientData: Omit<Patient, 'id' | 'created_at'>
  ): Promise<number> => {
    const now = new Date().toISOString();

    const sql = `
      INSERT INTO patients (
        first_name,
        last_name,
        gender,
        date_of_birth,
        email,
        phone,
        address,
        blood_group,
        emergency_contact,
        medical_history,
        created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id
    `;

    const values = [
      patientData.first_name,
      patientData.last_name,
      patientData.gender,
      patientData.date_of_birth,
      patientData.email,
      patientData.phone,
      patientData.address,
      patientData.blood_group,
      patientData.emergency_contact,
      patientData.medical_history,
      now,
    ];

    try {
      const result = await executeQuery(sql, values);
      const newId = result.rows[0]?.id;

      // Broadcast event to other tabs
      broadcast.postMessage({ type: 'patient-added', id: newId });

      return newId;
    } catch (error) {
      console.error('Error in addPatient:', error);
      throw error;
    }
  };

  const getPatientStats = async (): Promise<PatientStats> => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    const oneWeekAgoStr = oneWeekAgo.toISOString();

    const totalResult = await executeQuery('SELECT COUNT(*) as count FROM patients');
    const newResult = await executeQuery(
      'SELECT COUNT(*) as count FROM patients WHERE created_at >= $1',
      [oneWeekAgoStr]
    );
    const maleResult = await executeQuery(
      'SELECT COUNT(*) as count FROM patients WHERE gender = $1',
      ['Male']
    );
    const femaleResult = await executeQuery(
      'SELECT COUNT(*) as count FROM patients WHERE gender = $1',
      ['Female']
    );

    return {
      total: totalResult.rows[0]?.count || 0,
      newThisWeek: newResult.rows[0]?.count || 0,
      maleCount: maleResult.rows[0]?.count || 0,
      femaleCount: femaleResult.rows[0]?.count || 0,
    };
  };

  // Listen for patient-added events from other tabs
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'patient-added') {
        console.log('New patient added in another tab. ID:', event.data.id);
        // Optionally trigger a refetch here using context or callback
      }
    };

    broadcast.addEventListener('message', handleMessage);

    return () => {
      broadcast.removeEventListener('message', handleMessage);
      // We do NOT call broadcast.close() here to keep the channel open
    };
  }, []);

  return (
    <DatabaseContext.Provider
      value={{
        db,
        initialized,
        error,
        executeQuery,
        getPatients,
        addPatient,
        getPatientStats,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
};
