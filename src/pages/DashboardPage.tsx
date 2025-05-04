import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Users, UserPlus, User, UserRound, Database } from 'lucide-react';
import { useDatabase, PatientStats } from '../lib/DatabaseContext';

const DashboardPage: React.FC = () => {
  const { getPatientStats, initialized } = useDatabase();
  const [stats, setStats] = useState<PatientStats>({
    total: 0,
    newThisWeek: 0,
    maleCount: 0,
    femaleCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (initialized) {
      const fetchStats = async () => {
        try {
          const patientStats = await getPatientStats();
          setStats(patientStats);
        } catch (error) {
          console.error('Error fetching patient stats:', error);
        } finally {
          setLoading(false);
        }
      };
      
      fetchStats();
      
     
      const interval = setInterval(fetchStats, 5000);
      return () => clearInterval(interval);
    }
  }, [getPatientStats, initialized]);


  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="space-y-8"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold mb-2">Patient Registration Dashboard</h1>
        <p className="text-gray-600">
          Welcome to MedTrack, your patient management system. View statistics, register new patients, and manage records.
        </p>
      </motion.div>

     
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Patients"
          value={stats.total}
          icon={<Users className="h-6 w-6" />}
          color="primary"
          loading={loading}
        />
        <StatsCard
          title="New This Week"
          value={stats.newThisWeek}
          icon={<UserPlus className="h-6 w-6" />}
          color="secondary"
          loading={loading}
        />
        <StatsCard
          title="Male Patients"
          value={stats.maleCount}
          icon={<User className="h-6 w-6" />}
          color="blue"
          loading={loading}
        />
        <StatsCard
          title="Female Patients"
          value={stats.femaleCount}
          icon={<UserRound className="h-6 w-6" />}
          color="accent"
          loading={loading}
        />
      </div>

      {/* Feature Cards */}
      <motion.h2 variants={itemVariants} className="text-xl font-semibold mt-8 mb-4">
        Getting Started
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FeatureCard
          title="Register Patient"
          description="Add new patients to the system by completing the registration form with their personal and medical information."
          icon={<UserPlus className="h-6 w-6" />}
          linkTo="/register"
        />
        <FeatureCard
          title="View Records"
          description="Browse through patient records, view their details, and manage their information efficiently."
          icon={<Users className="h-6 w-6" />}
          linkTo="/records"
        />
        <FeatureCard
          title="Run SQL Queries"
          description="Perform custom SQL queries to analyze patient data and generate reports based on specific criteria."
          icon={<Database className="h-6 w-6" />}
          linkTo="/query"
        />
      </div>
    </motion.div>
  );
};

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  loading: boolean;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, color, loading }) => {
  const getColorClass = () => {
    switch (color) {
      case 'primary': return 'bg-primary text-white';
      case 'secondary': return 'bg-secondary text-white';
      case 'accent': return 'bg-[#E91E63] text-white';
      case 'blue': return 'bg-[#2196F3] text-white';
      default: return 'bg-primary text-white';
    }
  };

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      className={`card p-6 ${getColorClass()}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium opacity-90">{title}</h3>
          {loading ? (
            <div className="animate-pulse h-8 w-16 bg-white/30 rounded mt-1"></div>
          ) : (
            <p className="text-3xl font-bold mt-1">{value}</p>
          )}
        </div>
        <div>
          {icon}
        </div>
      </div>
    </motion.div>
  );
};

interface FeatureCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  linkTo: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({ title, description, icon, linkTo }) => {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
      }}
      whileHover={{ y: -5 }}
      className="card overflow-hidden"
    >
      <div className="p-6">
        <div className="text-primary mb-4">{icon}</div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link
          to={linkTo}
          className="inline-flex items-center text-primary hover:text-primary/80 font-medium"
        >
          Get Started
          <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </motion.div>
  );
};

export default DashboardPage;