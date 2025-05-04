import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, ChevronLeft, ChevronRight, Eye, UserPlus, X } from 'lucide-react';
import { useDatabase, Patient } from '../lib/DatabaseContext';
import { format } from 'date-fns';

const PatientRecordsPage: React.FC = () => {
  const { getPatients, initialized } = useDatabase();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDetailsCardOpen, setIsDetailsCardOpen] = useState(false);

  useEffect(() => {
    if (initialized) {
      const fetchPatients = async () => {
        try {
          const data = await getPatients();
          setPatients(data);
          setFilteredPatients(data);
        } catch (error) {
          console.error('Error fetching patients:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchPatients();

      //  polling to refresh data (useful for multi-tab scenarios)
      const interval = setInterval(fetchPatients, 5000);
      return () => clearInterval(interval);
    }
  }, [getPatients, initialized]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPatients(patients);
    } else {
      const lowercaseQuery = searchQuery.toLowerCase();
      const filtered = patients.filter((patient) => {
        const fullName = `${patient.first_name} ${patient.last_name}`.toLowerCase();
        const email = (patient.email || '').toLowerCase();
        const phone = (patient.phone || '').toLowerCase();

        return (
          fullName.includes(lowercaseQuery) ||
          email.includes(lowercaseQuery) ||
          phone.includes(lowercaseQuery)
        );
      });
      setFilteredPatients(filtered);
    }
    setCurrentPage(1);
  }, [searchQuery, patients]);

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentPatients = filteredPatients.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const openDetailsCard = (patient: Patient) => {
    setSelectedPatient(patient);
    setIsDetailsCardOpen(true);
  };

  const closeDetailsCard = () => {
    setSelectedPatient(null);
    setIsDetailsCardOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="space-y-6 relative" // Added relative for absolute positioning of the card
    >
      {/* Patient Details Card */}
      <AnimatePresence>
        {isDetailsCardOpen && selectedPatient && (
          <motion.div
            key="patientDetails"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed top-0 left-0 w-full h-full flex items-center justify-center z-50" // Changed to fixed and removed backdrop-blur
            onClick={closeDetailsCard} // Close on outside click
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.2)' }} // Optional: Add a subtle background overlay
          >
            <motion.div
              className="bg-white rounded-md shadow-lg p-6 w-full max-w-md overflow-y-auto m-4" // Added m-4 for centering
              onClick={(e) => e.stopPropagation()} // Prevent closing on card click
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Patient Details</h2>
                <button onClick={closeDetailsCard} className="p-1 rounded-full hover:bg-gray-100 text-gray-600">
                  <X className="h-5 w-5" />
                </button>
              </div>
              {/* Display Patient Details */}
              <p><strong>Name:</strong> {selectedPatient.first_name} {selectedPatient.last_name}</p>
              <p><strong>Gender:</strong> {selectedPatient.gender}</p>
              <p><strong>Date of Birth:</strong> {format(new Date(selectedPatient.date_of_birth), 'MMM d, yyyy')}</p>
              {selectedPatient.email && <p><strong>Email:</strong> {selectedPatient.email}</p>}
              {selectedPatient.phone && <p><strong>Phone:</strong> {selectedPatient.phone}</p>}
              {selectedPatient.address && <p><strong>Address:</strong> {selectedPatient.address}</p>}
              {selectedPatient.blood_group && <p><strong>Blood Group:</strong> {selectedPatient.blood_group}</p>}
              {selectedPatient.emergency_contact && <p><strong>Emergency Contact:</strong> {selectedPatient.emergency_contact}</p>}
              {selectedPatient.medical_history && <p><strong>Medical History:</strong> {selectedPatient.medical_history}</p>}
              <p><strong>Registered On:</strong> {format(new Date(selectedPatient.created_at), 'MMM d, yyyy h:mm a')}</p>
              {/* Add more details as needed */}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center">
          <Users className="h-6 w-6 mr-2 text-primary" />
          <h1 className="text-2xl font-bold">Patient Records</h1>
        </div>

        <div className="flex space-x-2">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="input pl-10"
              placeholder="Search by name, email or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Link to="/register" className="btn btn-primary inline-flex items-center">
            <UserPlus className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Register</span>
          </Link>
        </div>
      </div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="card"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Name</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Age</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Gender</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Email</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Registered On</th>
                <th className="px-4 py-3 text-left font-medium text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index}>
                    {Array.from({ length: 7 }).map((_, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-3">
                        <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
                      </td>
                    ))}
                  </tr>
                ))
              ) : currentPatients.length > 0 ? (
                <AnimatePresence>
                  {currentPatients.map((patient) => {
                    // Calculate age
                    const birthDate = new Date(patient.date_of_birth);
                    const today = new Date();
                    let age = today.getFullYear() - birthDate.getFullYear();
                    const months = today.getMonth() - birthDate.getMonth();
                    if (months < 0 || (months === 0 && today.getDate() < birthDate.getDate())) {
                      age--;
                    }

                    // Format date
                    const registeredDate = new Date(patient.created_at);

                    return (
                      <motion.tr
                        key={patient.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium">
                          {patient.first_name} {patient.last_name}
                        </td>
                        <td className="px-4 py-3">{age}</td>
                        <td className="px-4 py-3">{patient.gender}</td>
                        <td className="px-4 py-3">{patient.phone || '-'}</td>
                        <td className="px-4 py-3">{patient.email || '-'}</td>
                        <td className="px-4 py-3">
                          {format(registeredDate, 'MMM d, yyyy')}
                        </td>
                        <td className="px-4 py-3">
                          <button
                            className="p-1 rounded-full hover:bg-gray-100 text-gray-600"
                            aria-label="View patient details"
                            onClick={() => openDetailsCard(patient)}
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    {searchQuery ? (
                      <div>
                        <p className="mb-2">No patients found matching your search criteria</p>
                        <button
                          onClick={() => setSearchQuery('')}
                          className="text-primary hover:underline"
                        >
                          Clear search
                        </button>
                      </div>
                    ) : (
                      <div>
                        <p className="mb-2">No patients have been registered yet</p>
                        <Link
                          to="/register"
                          className="text-primary hover:underline"
                        >
                          Register a new patient
                        </Link>
                      </div>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredPatients.length > 0 && (
          <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Rows per page:
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="ml-2 border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="text-sm text-gray-700">
              {filteredPatients.length === 0 ? (
                '0-0 of 0'
              ) : (
                <>
                  {startIndex + 1}-{Math.min(endIndex, filteredPatients.length)} of {filteredPatients.length}
                </>
              )}
            </div>

            <div className="flex">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`p-1 rounded-full ${
                  currentPage === 1
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="Previous page"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage >= totalPages}
                className={`p-1 rounded-full ${
                  currentPage >= totalPages
                    ? 'text-gray-300 cursor-not-allowed'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                aria-label="Next page"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PatientRecordsPage;
