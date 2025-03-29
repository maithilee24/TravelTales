// app/page.js
"use client";
import { useExperience } from '../../../../context/experienceContext.js';
import ExperienceModal from '../ExperienceModal/ExperienceModal.js';
import { useEffect } from 'react';

export default function ExperienceHome() {
  const {
    experiences,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    isModalOpen,
    openCreateModal,
    deleteExperience
  } = useExperience();

  return (
    <div className="min-h-screen bg-gradient-to-r from-[#0f252b] to-[#043535]">
      {/* Header */}
      <header className="shadow-sm">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-amber-500">Travel Experiences</h1>
            <button
              onClick={openCreateModal}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Share Your Experience
            </button>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by destination (e.g., Himachal Pradesh)"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No experiences found</h3>
            <p className="mt-2 text-gray-600">
              {searchTerm ? 'Try a different search term' : 'Be the first to share your travel experience!'}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {experiences.map((experience) => (
              <ExperienceCard 
                key={experience._id} 
                experience={experience} 
                onDelete={deleteExperience}
              />
            ))}
          </div>
        )}
      </main>

      {/* Experience Modal */}
      <ExperienceModal isOpen={isModalOpen} />
    </div>
  );
}

const ExperienceCard = ({ experience, onDelete }) => {
    const { openEditModal } = useExperience();
    const { user } = experience;
  
    return (
      <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
        <div className="p-6">
          {/* User Info with Avatar */}
          <div className="flex items-center mb-4">
            {user?.photo ? (
              <img 
                src={user.photo} 
                alt={user.name} 
                className="w-12 h-12 rounded-full mr-3 object-cover border-2 border-amber-500"
              />
            ) : (
              <div className="w-12 h-12 rounded-full mr-3 bg-gray-300 flex items-center justify-center text-gray-600 font-semibold">
                {user?.name?.charAt(0) || 'A'}
              </div>
            )}
            <div>
              <h3 className="font-medium text-gray-900 text-lg">{user?.name || 'Anonymous Traveler'}</h3>
              <p className="text-sm text-gray-500">
                {new Date(experience.createdAt).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
  
          {/* Destination Header */}
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-gray-800 mb-1">{experience.destination}</h2>
            <div className="flex items-center">
              <span className="text-amber-500">
                <i className="fas fa-calendar-days mr-1"></i>
              </span>
              <span className="text-gray-600 ml-1">
                {experience.itineraryDays} day{experience.itineraryDays > 1 ? 's' : ''} trip
              </span>
            </div>
          </div>
  
          {/* Places Covered */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <span className="text-amber-500 mr-2">
                <i className="fas fa-map-marked-alt"></i>
              </span>
              Places Visited
            </h4>
            <div className="flex flex-wrap gap-2">
              {experience.placesCovered.map((place, i) => (
                <span 
                  key={i}
                  className="bg-gray-100 text-gray-800 text-sm px-3 py-1 rounded-full"
                >
                  {place}
                </span>
              ))}
            </div>
          </div>
  
          {/* Trip Details */}
          <div className="mb-4">
            <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
              <span className="text-amber-500 mr-2">
                <i className="fas fa-route"></i>
              </span>
              Trip Itinerary
            </h4>
            <div className="space-y-3">
              {experience.details.map((detail, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="font-medium text-gray-700">Day {detail.day}</div>
                    <div className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded">
                      ₹{detail.cost.toLocaleString()}
                    </div>
                  </div>
                  <p className="text-gray-600 mt-1 text-sm">{detail.description}</p>
                </div>
              ))}
            </div>
          </div>
  
          {/* Total Cost */}
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="font-semibold text-gray-800">Total Trip Cost:</span>
              <span className="text-lg font-bold text-blue-600">
                ₹{experience.totalCost.toLocaleString()}
              </span>
            </div>
          </div>
  
          {/* Additional Info */}
          <div className="space-y-3">
            {experience.driverContact && (
              <div className="flex items-start">
                <span className="text-amber-500 mt-1 mr-2">
                  <i className="fas fa-car"></i>
                </span>
                <div>
                  <h5 className="font-medium text-gray-800">Contact(If any)</h5>
                  <p className="text-gray-600">{experience.driverContact}</p>
                </div>
              </div>
            )}
  
            {experience.suggestions?.length > 0 && (
              <div className="flex items-start">
                <span className="text-amber-500 mt-1 mr-2">
                  <i className="fas fa-lightbulb"></i>
                </span>
                <div>
                  <h5 className="font-medium text-gray-800">Travel Tips</h5>
                  <ul className="list-disc list-inside text-gray-600 space-y-1">
                    {experience.suggestions.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
  
          {/* Action Buttons */}
          <div className="mt-6 pt-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={() => openEditModal(experience._id)}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
            >
              <i className="fas fa-edit mr-2"></i>
              Edit
            </button>
            <button
              onClick={() => onDelete(experience._id)}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors flex items-center"
            >
              <i className="fas fa-trash mr-2"></i>
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };