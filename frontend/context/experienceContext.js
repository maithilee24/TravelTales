// context/ExperienceContext.js
"use client";
import { createContext, useContext, useState, useEffect } from 'react';

const ExperienceContext = createContext();

export const ExperienceProvider = ({ children }) => {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentExperience, setCurrentExperience] = useState(null);

  const serverUrl = "http://localhost:8000";

  // Form state
  const [formData, setFormData] = useState({
    destination: '',
    itineraryDays: 1,
    placesCovered: [''],
    totalCost: 0,
    details: [{ day: 1, description: '', cost: 0 }],
    driverContact: '',
    suggestions: ['']
  });

  // Fetch all experiences
  const fetchExperiences = async () => {
    setLoading(true);
    try {
      let url = `${serverUrl}/api/v1/get`;
      if (searchTerm) {
        url = `${serverUrl}/api/v1/search/${encodeURIComponent(searchTerm)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch');
      setExperiences(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch single experience
  const fetchExperienceById = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${serverUrl}/api/v1/get/${id}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch');
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Create experience
  const createExperience = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${serverUrl}/api/v1/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          placesCovered: formData.placesCovered.filter(p => p.trim() !== ''),
          suggestions: formData.suggestions.filter(s => s.trim() !== '')
        }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to create');
      setExperiences([data.experience, ...experiences]);
      resetForm();
      setIsModalOpen(false);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update experience
  const updateExperience = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${serverUrl}/api/v1/update/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          placesCovered: formData.placesCovered.filter(p => p.trim() !== ''),
          suggestions: formData.suggestions.filter(s => s.trim() !== '')
        }),
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to update');
      setExperiences(experiences.map(exp => exp._id === id ? data : exp));
      resetForm();
      setIsModalOpen(false);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete experience
  const deleteExperience = async (id) => {
    setLoading(true);
    try {
      const response = await fetch(`${serverUrl}/api/v1/delete/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to delete');
      setExperiences(experiences.filter(exp => exp._id !== id));
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePlacesChange = (index, value) => {
    const newPlaces = [...formData.placesCovered];
    newPlaces[index] = value;
    setFormData(prev => ({ ...prev, placesCovered: newPlaces }));
  };

  const addPlace = () => {
    setFormData(prev => ({ ...prev, placesCovered: [...prev.placesCovered, ''] }));
  };

  const removePlace = (index) => {
    const newPlaces = formData.placesCovered.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, placesCovered: newPlaces }));
  };

  const handleDetailChange = (index, field, value) => {
    const newDetails = [...formData.details];
    newDetails[index][field] = value;
    setFormData(prev => ({ ...prev, details: newDetails }));
  };

  const handleSuggestionChange = (index, value) => {
    const newSuggestions = [...formData.suggestions];
    newSuggestions[index] = value;
    setFormData(prev => ({ ...prev, suggestions: newSuggestions }));
  };

  const addSuggestion = () => {
    setFormData(prev => ({ ...prev, suggestions: [...prev.suggestions, ''] }));
  };

  const removeSuggestion = (index) => {
    const newSuggestions = formData.suggestions.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, suggestions: newSuggestions }));
  };

  const updateDays = (days) => {
    const newDetails = [];
    for (let i = 1; i <= days; i++) {
      const existingDetail = formData.details.find(d => d.day === i) || {
        day: i,
        description: '',
        cost: 0
      };
      newDetails.push(existingDetail);
    }
    setFormData(prev => ({ ...prev, itineraryDays: days, details: newDetails }));
  };

  const resetForm = () => {
    setFormData({
      destination: '',
      itineraryDays: 1,
      placesCovered: [''],
      totalCost: 0,
      details: [{ day: 1, description: '', cost: 0 }],
      driverContact: '',
      suggestions: ['']
    });
    setCurrentExperience(null);
  };

  const openCreateModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = async (id) => {
    try {
      const experience = await fetchExperienceById(id);
      setCurrentExperience(experience);
      setFormData({
        destination: experience.destination,
        itineraryDays: experience.itineraryDays,
        placesCovered: experience.placesCovered,
        totalCost: experience.totalCost,
        details: experience.details,
        driverContact: experience.driverContact || '',
        suggestions: experience.suggestions || ['']
      });
      setIsModalOpen(true);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    fetchExperiences();
  }, [searchTerm]);

  return (
    <ExperienceContext.Provider value={{
      experiences,
      loading,
      error,
      searchTerm,
      setSearchTerm,
      isModalOpen,
      setIsModalOpen,
      currentExperience,
      formData,
      handleInputChange,
      handlePlacesChange,
      addPlace,
      removePlace,
      handleDetailChange,
      handleSuggestionChange,
      addSuggestion,
      removeSuggestion,
      updateDays,
      createExperience,
      updateExperience,
      deleteExperience,
      openCreateModal,
      openEditModal,
      resetForm,
      fetchExperiences
    }}>
      {children}
    </ExperienceContext.Provider>
  );
};

export const useExperience = () => useContext(ExperienceContext);
