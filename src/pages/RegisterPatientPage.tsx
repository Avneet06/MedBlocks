import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserPlus, CheckCircle } from 'lucide-react';
import { useDatabase } from '../lib/DatabaseContext';

interface FormData {
  first_name: string;
  last_name: string;
  gender: string;
  date_of_birth: string;
  email: string;
  phone: string;
  address: string;
  blood_group: string;
  emergency_contact: string;
  medical_history: string;
}

const RegisterPatientPage: React.FC = () => {
  const { addPatient } = useDatabase();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const [formData, setFormData] = useState<FormData>({
    first_name: '',
    last_name: '',
    gender: '',
    date_of_birth: '',
    email: '',
    phone: '',
    address: '',
    blood_group: '',
    emergency_contact: '',
    medical_history: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
 
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }
    
    if (!formData.gender) {
      newErrors.gender = 'Gender is required';
    }
    
    if (!formData.date_of_birth) {
      newErrors.date_of_birth = 'Date of birth is required';
    }
    
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email format is invalid';
    }
    
    if (formData.phone && !/^\+?[0-9\s-()]{10,15}$/.test(formData.phone)) {
      newErrors.phone = 'Phone number format is invalid';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setLoading(true);
    try {
      await addPatient(formData);
      setSuccess(true);
      
      // Reset form after success
      setTimeout(() => {
        setSuccess(false);
        setFormData({
          first_name: '',
          last_name: '',
          gender: '',
          date_of_birth: '',
          email: '',
          phone: '',
          address: '',
          blood_group: '',
          emergency_contact: '',
          medical_history: '',
        });
        navigate('/records');
      }, 2000);
    } catch (error) {
      console.error('Error adding patient:', error);
      setErrors({ submit: 'Failed to register patient. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="max-w-3xl mx-auto"
    >
      <div className="flex items-center mb-6">
        <UserPlus className="h-6 w-6 mr-2 text-primary" />
        <h1 className="text-2xl font-bold">Register New Patient</h1>
      </div>

      {success ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 text-center"
        >
          <CheckCircle className="h-16 w-16 mx-auto text-success mb-4" />
          <h2 className="text-xl font-semibold mb-2">Registration Successful!</h2>
          <p className="text-gray-600 mb-4">The patient has been registered successfully.</p>
          <p className="text-sm text-gray-500">Redirecting to patient records...</p>
        </motion.div>
      ) : (
        <motion.form
          onSubmit={handleSubmit}
          className="card p-6"
          initial={{ y: 20 }}
          animate={{ y: 0 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Personal Information</h2>
              
              <div className="mb-4">
                <label htmlFor="first_name" className="label">
                  First Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className={`input ${errors.first_name ? 'border-error ring-error/50' : ''}`}
                  required
                />
                {errors.first_name && (
                  <p className="text-error text-sm mt-1">{errors.first_name}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="last_name" className="label">
                  Last Name <span className="text-error">*</span>
                </label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className={`input ${errors.last_name ? 'border-error ring-error/50' : ''}`}
                  required
                />
                {errors.last_name && (
                  <p className="text-error text-sm mt-1">{errors.last_name}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="gender" className="label">
                  Gender <span className="text-error">*</span>
                </label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={`input ${errors.gender ? 'border-error ring-error/50' : ''}`}
                  required
                >
                  <option value="" disabled>Select gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
                {errors.gender && (
                  <p className="text-error text-sm mt-1">{errors.gender}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="date_of_birth" className="label">
                  Date of Birth <span className="text-error">*</span>
                </label>
                <input
                  type="date"
                  id="date_of_birth"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleChange}
                  className={`input ${errors.date_of_birth ? 'border-error ring-error/50' : ''}`}
                  required
                />
                {errors.date_of_birth && (
                  <p className="text-error text-sm mt-1">{errors.date_of_birth}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="email" className="label">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`input ${errors.email ? 'border-error ring-error/50' : ''}`}
                />
                {errors.email && (
                  <p className="text-error text-sm mt-1">{errors.email}</p>
                )}
              </div>
              
              <div className="mb-4">
                <label htmlFor="phone" className="label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`input ${errors.phone ? 'border-error ring-error/50' : ''}`}
                  placeholder="e.g., +1 234 567 8900"
                />
                {errors.phone && (
                  <p className="text-error text-sm mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
            
            <div>
              <h2 className="text-lg font-semibold mb-4">Medical Information</h2>
              
              <div className="mb-4">
                <label htmlFor="address" className="label">Address</label>
                <input
                  type="text"
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input"
                  placeholder="Street, City, State, ZIP"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="blood_group" className="label">Blood Group</label>
                <select
                  id="blood_group"
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="">Select blood group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              
              <div className="mb-4">
                <label htmlFor="emergency_contact" className="label">Emergency Contact</label>
                <input
                  type="text"
                  id="emergency_contact"
                  name="emergency_contact"
                  value={formData.emergency_contact}
                  onChange={handleChange}
                  className="input"
                  placeholder="Name and phone number"
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="medical_history" className="label">Medical History</label>
                <textarea
                  id="medical_history"
                  name="medical_history"
                  value={formData.medical_history}
                  onChange={handleChange}
                  className="input h-24"
                  placeholder="Any pre-existing conditions, allergies, or medications"
                />
              </div>
            </div>
          </div>
          
          {errors.submit && (
            <div className="bg-error/10 border border-error text-error p-3 rounded-md mb-4">
              {errors.submit}
            </div>
          )}
          
          <div className="mt-6 flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn btn-outline"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary min-w-[120px]"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Register Patient'
              )}
            </button>
          </div>
        </motion.form>
      )}
    </motion.div>
  );
};

export default RegisterPatientPage;