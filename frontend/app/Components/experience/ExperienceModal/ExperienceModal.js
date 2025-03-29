"use client";
import { useExperience } from '../../../../context/experienceContext.js';

const ExperienceModal = () => {
  const {
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
    resetForm,
    loading
  } = useExperience();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (currentExperience) {
        await updateExperience(currentExperience._id);
      } else {
        await createExperience();
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-gray-800">
              {currentExperience ? 'Edit Experience' : 'Share Your Experience'}
            </h2>
            <button
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Destination */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="destination">
                Destination*
              </label>
              <input
                type="text"
                id="destination"
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {/* Number of Days */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="itineraryDays">
                Number of Days*
              </label>
              <input
                type="number"
                id="itineraryDays"
                name="itineraryDays"
                min="1"
                value={formData.itineraryDays}
                onChange={(e) => {
                  const days = parseInt(e.target.value);
                  updateDays(days);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {/* Places Covered */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Places Covered*
              </label>
              {formData.placesCovered.map((place, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={place}
                    onChange={(e) => handlePlacesChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required={index === 0}
                  />
                  {formData.placesCovered.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePlace(index)}
                      className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPlace}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Another Place
              </button>
            </div>
            
            {/* Total Cost */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="totalCost">
                Total Cost (in ₹)*
              </label>
              <input
                type="number"
                id="totalCost"
                name="totalCost"
                min="0"
                value={formData.totalCost}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            {/* Daily Details */}
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2 text-gray-800">Daily Itinerary*</h3>
              {formData.details.map((detail, index) => (
                <div key={index} className="mb-6 p-4 border border-gray-200 rounded-md">
                  <h4 className="font-medium mb-3 text-gray-700">Day {detail.day}</h4>
                  <div className="mb-3">
                    <label className="block text-gray-700 mb-1">Description*</label>
                    <textarea
                      value={detail.description}
                      onChange={(e) => handleDetailChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows="3"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 mb-1">Cost (in ₹)*</label>
                    <input
                      type="number"
                      min="0"
                      value={detail.cost}
                      onChange={(e) => handleDetailChange(index, 'cost', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
              ))}
            </div>
            
            {/* Driver Contact */}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="driverContact">
                Driver Contact (if any)
              </label>
              <input
                type="text"
                id="driverContact"
                name="driverContact"
                value={formData.driverContact}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Phone number or other contact info"
              />
            </div>
            
            {/* Suggestions */}
            <div className="mb-6">
              <label className="block text-gray-700 mb-2">
                Suggestions/Tips
              </label>
              {formData.suggestions.map((suggestion, index) => (
                <div key={index} className="flex mb-2">
                  <input
                    type="text"
                    value={suggestion}
                    onChange={(e) => handleSuggestionChange(index, e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.suggestions.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeSuggestion(index)}
                      className="ml-2 px-3 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addSuggestion}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Add Another Suggestion
              </button>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {currentExperience ? 'Updating...' : 'Sharing...'}
                  </span>
                ) : currentExperience ? 'Update Experience' : 'Share Experience'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ExperienceModal;