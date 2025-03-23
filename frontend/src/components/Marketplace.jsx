import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSearch, FiPlus, FiUser, FiMapPin, FiClock, FiDollarSign, FiStar, FiMail, FiX, FiChevronRight, FiMessageCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import NavBar from './NavBar';
import UserRating from './UserRating';
import Reviews from './Reviews';

const Marketplace = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [loggedInUsername, setLoggedInUsername] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedGig, setSelectedGig] = useState(null);
  const [showGigDetailsModal, setShowGigDetailsModal] = useState(false);
  const [interestedGigs, setInterestedGigs] = useState([]); 
  
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Tutoring',
    location: 'On Campus',
    duration: 'Short Term',
    skillsRequired: ''
  });
  
  const categories = [
    'All',
    'Tutoring',
    'Design',
    'Programming',
    'Content Writing',
    'Marketing',
    'Research',
    'Event Planning',
    'Photography',
    'Other'
  ];
  
  useEffect(() => {
    const username = localStorage.getItem('username');
    if (username) {
      setLoggedInUsername(username);
    }
  }, []);

  useEffect(() => {
    if (loggedInUsername) {
      fetchListings();
    }
  }, [loggedInUsername]);
  
  useEffect(() => {
    if (listings.length > 0) {
      filterListings();
    }
  }, [searchTerm, selectedCategory]);
  
const fetchListings = async () => {
  setLoading(true);
  try {
    console.log('Fetching listings with logged in user:', loggedInUsername);
    const response = await axios.get('http://localhost:8080/api/marketplace');
    console.log('Total listings before filtering:', response.data.length);
    
    const filteredData = response.data.filter(listing => {
      return listing.username !== loggedInUsername;
    });
    
    console.log('Filtered listings:', filteredData.length);
    setListings(filteredData);
    setFilteredListings(filteredData);
  } catch (err) {
    console.error('Error fetching marketplace listings:', err);
    setError('Failed to load marketplace listings. Please try again later.');
  } finally {
    setLoading(false);
  }
};

const filterListings = async () => {
  if (!loggedInUsername) {
    console.log('Cannot filter listings - username not set yet');
    return;
  }

  setLoading(true);
  try {
    console.log('Filtering with logged in user:', loggedInUsername);
    
    if (searchTerm) {
      const response = await axios.get(`http://localhost:8080/api/marketplace/search?term=${searchTerm}`);
      let filtered = response.data.filter(listing => listing.username !== loggedInUsername);
      
      if (selectedCategory !== 'All') {
        filtered = filtered.filter(listing => listing.category === selectedCategory);
      }
      
      setFilteredListings(filtered);
    } 
    else if (selectedCategory !== 'All') {
      const response = await axios.get(`http://localhost:8080/api/marketplace/category/${selectedCategory}`);
      const filtered = response.data.filter(listing => listing.username !== loggedInUsername);
      setFilteredListings(filtered);
    } 
    else {
      const response = await axios.get('http://localhost:8080/api/marketplace');
      const filtered = response.data.filter(listing => listing.username !== loggedInUsername);
      setFilteredListings(filtered);
    }
  } catch (error) {
    console.error('Error filtering listings:', error);
    setError('Failed to filter listings. Please try again.');
  } finally {
    setLoading(false);
  }
};

const handleSearch = (e) => {
  setSearchTerm(e.target.value);
};

const handleCategorySelect = (category) => {
  setSelectedCategory(category);
};

  const handleProfileClick = (username) => {
    navigate(`/profile/${username}`);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewListing({
      ...newListing,
      [name]: value
    });
  };
  
const handleSubmitListing = async (e) => {
  e.preventDefault();
  setLoading(true);

  try {
    // Process the skillsRequired field to handle spaces and commas
    const processedSkills = newListing.skillsRequired
      .split(/[\s,]+/) // Split by spaces or commas
      .filter(skill => skill.trim() !== '') // Remove empty entries
      .join(', '); // Join back as a comma-separated string

    const gigData = {
      ...newListing,
      skillsRequired: processedSkills, // Use the processed skills
      username: loggedInUsername,
      price: parseFloat(newListing.price),
    };

    const response = await axios.post('http://localhost:8080/api/marketplace', gigData);

    const updatedListings = [...listings, response.data];
    setListings(updatedListings);

    if (searchTerm === '' && selectedCategory === 'All') {
      setFilteredListings(updatedListings);
    } else {
      filterListings();
    }

    setNewListing({
      title: '',
      description: '',
      price: '',
      category: 'Tutoring',
      location: 'On Campus',
      duration: 'Short Term',
      skillsRequired: '',
    });
    setShowAddModal(false);
  } catch (err) {
    console.error('Error creating listing:', err);
    setError('Failed to create listing. Please try again.');
  } finally {
    setLoading(false);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  
  try {
    let date;
    
    if (typeof dateString === 'string') {
      if (dateString.includes('T')) {
        date = new Date(dateString);
      } else {
        date = new Date(dateString);
      }
    } else {
      date = new Date(dateString);
    }
    
    if (isNaN(date.getTime())) {
      console.log("Invalid date format:", dateString);
      return 'N/A';
    }
    
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  } catch (error) {
    console.error('Error formatting date:', error, dateString);
    return 'N/A';
  }
};
  
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={`full-${i}`} size={14} fill="#FBBF24" color="#FBBF24" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FiStar key="half" size={14} fill="#FBBF24" color="#FBBF24" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FiStar key={`empty-${i}`} size={14} color="#D1D5DB" />);
    }
    
    return stars;
  };

  const handleViewDetails = (gig) => {
    setSelectedGig(gig);
    setShowGigDetailsModal(true);
  };

const handleContactProvider = (gig) => {
  navigate('/messages', { 
    state: { 
      toUsername: gig.username,
      initialMessage: `Hi, I'm interested in your gig: "${gig.title}". Are you available to discuss this opportunity?`,
      createNewConversation: true,
      gigDetails: {
        id: gig.id,
        title: gig.title,
        category: gig.category,
        price: gig.price,
        description: gig.description,
        location: gig.location,
        duration: gig.duration
      }
    }
  });
  setShowGigDetailsModal(false);
};

const handleToggleInterest = async (gigId) => {
  const isCurrentlyInterested = interestedGigs.includes(gigId);
  const newIsInterested = !isCurrentlyInterested;
  
  try {
    if (newIsInterested) {
      setInterestedGigs([...interestedGigs, gigId]);
    } else {
      setInterestedGigs(interestedGigs.filter(id => id !== gigId));
    }
    
    await axios.post(
      `http://localhost:8080/api/marketplace/${gigId}/interest`,
      null,
      { 
        params: { 
          username: loggedInUsername,
          interested: newIsInterested
        }
      }
    );
  } catch (error) {
    console.error("Error updating interest status:", error);
    if (isCurrentlyInterested) {
      setInterestedGigs([...interestedGigs, gigId]);
    } else {
      setInterestedGigs(interestedGigs.filter(id => id !== gigId));
    }
  }
};


useEffect(() => {
  if (loggedInUsername) {
    fetchUserInterests();
  }
}, [loggedInUsername]);

const fetchUserInterests = async () => {
  try {
    const response = await axios.get('http://localhost:8080/api/marketplace/user-interests', {
      params: { username: loggedInUsername }
    });
    setInterestedGigs(response.data);
  } catch (error) {
    console.error("Error fetching user interests:", error);
  }
};

  return (
    <div style={styles.container}>
      <NavBar />
      
      <div style={styles.content}>
        <h1 style={styles.pageTitle}>Student Marketplace</h1>
        <p style={styles.pageDescription}>
          Find student freelancers or offer your skills and services to the university community
        </p>
        
        <div style={styles.searchContainer}>
          
          <div style={styles.searchBar}>
            <FiSearch size={20} color="#6B7280" style={styles.searchIcon} />
            <input
              type="text"
              placeholder="Search for gigs, skills, or keywords..."
              style={styles.searchInput}
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
          
          <button 
            style={styles.profileButton} 
            onClick={() => {
              navigate(`/marketplace/profile/${loggedInUsername}`);
            }}
          >
            <FiUser size={20} />
            <span>My Profile</span>
          </button>
          
          <button style={styles.addButton} onClick={() => setShowAddModal(true)}>
            <FiPlus size={20} />
            <span>Post a Gig</span>
          </button>
        </div>
        
        <div style={styles.categoriesContainer}>
          {categories.map(category => (
            <button
              key={category}
              style={{
                ...styles.categoryButton,
                backgroundColor: selectedCategory === category ? '#1E40AF' : '#F3F4F6',
                color: selectedCategory === category ? 'white' : '#4B5563',
              }}
              onClick={() => handleCategorySelect(category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        {error && <div style={styles.errorMessage}>{error}</div>}
        
        {loading && <div style={styles.loadingMessage}>Loading marketplace listings...</div>}
        
        {!loading && filteredListings.length === 0 && (
          <div style={styles.noResults}>
            <p>No marketplace listings found matching your criteria.</p>
            <button
              style={styles.resetButton}
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
            >
              Reset filters
            </button>
          </div>
        )}
        
        <div style={styles.listingsGrid}>
          {filteredListings.map(listing => (
            <div key={listing.id} style={styles.listingCard}>
              <div style={styles.listingHeader}>
                <div style={styles.categoryTag}>{listing.category}</div>
                <div style={styles.ratingContainer}>
                  {renderStars(listing.rating)}
                  <span style={styles.ratingText}>{listing.rating.toFixed(1)}</span>
                </div>
              </div>
              
              <h3 style={styles.listingTitle}>{listing.title}</h3>
              <p style={styles.listingDescription}>{listing.description}</p>
              
              <div style={styles.listingDetails}>
                <div style={styles.detailItem}>
                  <FiDollarSign size={16} color="#4B5563" />
                  <span style={styles.detailText}>${listing.price}/hour</span>
                </div>
                <div style={styles.detailItem}>
                  <FiMapPin size={16} color="#4B5563" />
                  <span style={styles.detailText}>{listing.location}</span>
                </div>
                <div style={styles.detailItem}>
                  <FiClock size={16} color="#4B5563" />
                  <span style={styles.detailText}>{listing.duration}</span>
                </div>
              </div>
              
              {listing.skillsRequired && (
                <div style={styles.skillsContainer}>
                  <div style={styles.skillsLabel}>Skills Required:</div>
                  <div style={styles.skillsTags}>
                    {listing.skillsRequired.split(',').map((skill, index) => (
                      <span key={index} style={styles.skillTag}>{skill.trim()}</span>
                    ))}
                  </div>
                </div>
              )}
              
              <div style={styles.listingFooter}>
                <div style={styles.userInfo} onClick={() => handleProfileClick(listing.username)}>
                  <img 
                    src={listing.userProfilePhoto} 
                    alt={listing.userFullName}
                    style={styles.userAvatar}
                  />
                  <div style={styles.userInfoText}>
                    <span style={styles.userName}>{listing.userFullName}</span>
                    <UserRating username={listing.username} size="small" />
                  </div>
                </div>
                <div style={styles.datePosted}>
                  Posted: {formatDate(listing.datePosted)}
                </div>
              </div>
              
              <button 
                style={styles.contactButton}
                onClick={() => handleViewDetails(listing)}
              >
                View Details
              </button>
            </div>
          ))}
        </div>
        
        {showAddModal && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Profile</h3>
                <button
                  style={styles.closeButton}
                  onClick={() => setShowAddModal(false)}
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <form onSubmit={handleSubmitListing} style={styles.form}>
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Title</label>
                  <input
                    type="text"
                    name="title"
                    value={newListing.title}
                    onChange={handleInputChange}
                    style={styles.formInput}
                    placeholder="E.g., Python Tutor, Graphic Designer"
                    required
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Description</label>
                  <textarea
                    name="description"
                    value={newListing.description}
                    onChange={handleInputChange}
                    style={styles.formTextarea}
                    placeholder="Describe your services, skills, and experience..."
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Skills Required</label>
                  <textarea
                    name="skillsRequired"
                    value={newListing.skillsRequired}
                    onChange={handleInputChange}
                    style={styles.formTextarea}
                    placeholder="List skills required for this gig (e.g., JavaScript, Photoshop, Research)"
                    rows={3}
                  />
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Category</label>
                  <select
                    name="category"
                    value={newListing.category}
                    onChange={handleInputChange}
                    style={styles.formSelect}
                    required
                  >
                    {categories.filter(c => c !== 'All').map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div style={styles.formRow}>
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Hourly Rate ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={newListing.price}
                      onChange={handleInputChange}
                      style={styles.formInput}
                      placeholder="15"
                      min="1"
                      required
                    />
                  </div>
                  
                  <div style={styles.formGroup}>
                    <label style={styles.formLabel}>Location</label>
                    <select
                      name="location"
                      value={newListing.location}
                      onChange={handleInputChange}
                      style={styles.formSelect}
                      required
                    >
                      <option value="On Campus">On Campus</option>
                      <option value="Remote">Remote</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                </div>
                
                <div style={styles.formGroup}>
                  <label style={styles.formLabel}>Duration</label>
                  <select
                    name="duration"
                    value={newListing.duration}
                    onChange={handleInputChange}
                    style={styles.formSelect}
                    required
                  >
                    <option value="Short Term">Short Term</option>
                    <option value="Long Term">Long Term</option>
                    <option value="Recurring">Recurring</option>
                    <option value="One-time">One-time</option>
                  </select>
                </div>
                
                <div style={styles.formButtons}>
                  <button
                    type="button"
                    style={styles.cancelButton}
                    onClick={() => setShowAddModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={styles.submitButton}
                    disabled={loading}
                  >
                    {loading ? 'Posting...' : 'Post Gig'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {showGigDetailsModal && selectedGig && (
          <div style={styles.modalOverlay}>
            <div style={styles.modalContent}>
              <div style={styles.modalHeader}>
                <h3 style={styles.modalTitle}>Gig Details</h3>
                <button
                  style={styles.closeButton}
                  onClick={() => setShowGigDetailsModal(false)}
                >
                  <FiX size={20} />
                </button>
              </div>
              
              <div style={styles.modalBody}>
                <div style={styles.gigDetailCategory}>
                  <span style={styles.categoryTag}>{selectedGig.category}</span>
                  <div style={styles.ratingContainer}>
                    {renderStars(selectedGig.rating)}
                    <span style={styles.ratingText}>{selectedGig.rating.toFixed(1)}</span>
                  </div>
                </div>
                
                <h2 style={styles.gigDetailTitle}>{selectedGig.title}</h2>
                
                <div style={styles.gigDetailSection}>
                  <h4 style={styles.gigDetailSectionTitle}>Description</h4>
                  <p style={styles.gigDetailDescription}>{selectedGig.description}</p>
                </div>
                
                <div style={styles.gigDetailSection}>
                  <h4 style={styles.gigDetailSectionTitle}>Details</h4>
                  <div style={styles.gigDetailInfoGrid}>
                    <div style={styles.gigDetailInfo}>
                      <FiDollarSign size={18} color="#4B5563" />
                      <div>
                        <div style={styles.gigDetailInfoLabel}>Price</div>
                        <div style={styles.gigDetailInfoValue}>${selectedGig.price}/hour</div>
                      </div>
                    </div>
                    <div style={styles.gigDetailInfo}>
                      <FiMapPin size={18} color="#4B5563" />
                      <div>
                        <div style={styles.gigDetailInfoLabel}>Location</div>
                        <div style={styles.gigDetailInfoValue}>{selectedGig.location}</div>
                      </div>
                    </div>
                    <div style={styles.gigDetailInfo}>
                      <FiClock size={18} color="#4B5563" />
                      <div>
                        <div style={styles.gigDetailInfoLabel}>Duration</div>
                        <div style={styles.gigDetailInfoValue}>{selectedGig.duration}</div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedGig.skillsRequired && (
                  <div style={styles.gigDetailSection}>
                    <h4 style={styles.gigDetailSectionTitle}>Skills Required</h4>
                    <p style={styles.gigDetailDescription}>{selectedGig.skillsRequired}</p>
                  </div>
                )}
                
                <div style={styles.gigDetailSection}>
                  <h4 style={styles.gigDetailSectionTitle}>Provider</h4>
                  <div style={styles.gigDetailProvider}>
                    <div style={styles.gigDetailProviderInfo}>
                      <img
                        src={selectedGig.userProfilePhoto || "https://randomuser.me/api/portraits/men/1.jpg"}
                        alt={selectedGig.userFullName}
                        style={styles.gigDetailProviderImage}
                      />
                      <div>
                        <div style={styles.gigDetailProviderName}>{selectedGig.userFullName}</div>
                        <div style={styles.gigDetailProviderDate}>
                          Posted: {formatDate(selectedGig.datePosted)}
                        </div>
                      </div>
                    </div>
                    <button
                      style={styles.viewProfileButton}
                      onClick={() => {
                        navigate(`/marketplace/profile/${selectedGig.username}`);
                        setShowGigDetailsModal(false);
                      }}
                    >
                      View Profile
                    </button>
                  </div>
                </div>
                
                <div style={styles.gigDetailActions}>
  {selectedGig.username !== loggedInUsername && (
    <>
      <button style={styles.contactProviderButton} onClick={() => handleContactProvider(selectedGig)}>
        <FiMessageCircle size={18} />
        <span>Contact Provider</span>
      </button>
      
      <button 
        style={{
          ...styles.interestButton,
          backgroundColor: interestedGigs.includes(selectedGig.id) ? '#EF4444' : '#10B981'
        }} 
        onClick={() => handleToggleInterest(selectedGig.id)}
      >
        {interestedGigs.includes(selectedGig.id) ? (
          <>
            <span>Delete Interest</span>
          </>
        ) : (
          <>
            <span>Add Interest</span>
          </>
        )}
      </button>
    </>
  )}
</div>
              </div>
            </div>
          </div>
        )}
        
      </div>
    </div>
  );
};





  

const styles = {
  container: {
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: '#F3F4F6',
    overflowX: 'hidden',
    position: 'relative',
  },
  content: {
    padding: '1.5rem 1rem',
    maxWidth: '1200px',
    margin: '0 auto',
    marginTop: '80px', 
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '0.5rem',
  },
  pageDescription: {
    fontSize: '1rem',
    color: '#6B7280',
    marginBottom: '2rem',
  },
  searchContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.5rem',
    gap: '1rem',
  },
  searchBar: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    backgroundColor: 'white',
    border: '1px solid #E5E7EB',
    borderRadius: '0.5rem',
    padding: '0.5rem 1rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  searchIcon: {
    marginRight: '0.5rem',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '1rem',
    color: '#111827',
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: '#1E40AF',
    color: 'white',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  categoriesContainer: {
    display: 'flex',
    gap: '0.5rem',
    flexWrap: 'wrap',
    marginBottom: '2rem',
  },
  categoryButton: {
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  },
  errorMessage: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    padding: '1rem',
    borderRadius: '0.375rem',
    marginBottom: '1.5rem',
  },
  loadingMessage: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6B7280',
    fontSize: '1rem',
  },
  noResults: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6B7280',
    fontSize: '1rem',
  },
  resetButton: {
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.5rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    marginTop: '1rem',
  },
  listingsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1.5rem',
  },
  listingCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    border: '1px solid #E5E7EB',
    padding: '1.25rem',
    display: 'flex',
    flexDirection: 'column',
  },
  listingHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  categoryTag: {
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
    fontSize: '0.75rem',
    fontWeight: '600',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
  },
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  ratingText: {
    marginLeft: '0.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4B5563',
  },
  listingTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '0.5rem',
  },
  listingDescription: {
    fontSize: '0.875rem',
    color: '#4B5563',
    marginBottom: '1rem',
    flex: 1
  },
  listingDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  detailItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  detailText: {
    fontSize: '0.875rem',
    color: '#4B5563',
  },
  listingFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #E5E7EB',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  userAvatar: {
    width: '1.75rem',
    height: '1.75rem',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  userInfoText: {
    display: 'flex',
    flexDirection: 'column',
  },
  datePosted: {
    fontSize: '0.75rem',
    color: '#6B7280',
  },
  contactButton: {
    backgroundColor: '#1E40AF',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.625rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    marginTop: 'auto',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #E5E7EB',
  },
  modalTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6B7280',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: {
    padding: '1.5rem',
  },
  formGroup: {
    marginBottom: '1.25rem',
  },
  formRow: {
    display: 'flex',
    gap: '1rem',
  },
  formLabel: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.375rem',
  },
  formInput: {
    width: '100%',
    padding: '0.625rem',
    fontSize: '0.875rem',
    border: '1px solid #D1D5DB',
    borderRadius: '0.375rem',
    color: '#111827',
  },
  formTextarea: {
    width: '100%',
    padding: '0.625rem',
    fontSize: '0.875rem',
    border: '1px solid #D1D5DB',
    borderRadius: '0.375rem',
    color: 'black',
    minHeight: '100px',
    resize: 'vertical',
    backgroundColor:'white',
  },
  formSelect: {
    width: '100%',
    padding: '0.625rem',
    fontSize: '0.875rem',
    border: '1px solid #D1D5DB',
    borderRadius: '0.375rem',
    color: '#111827',
    backgroundColor: 'white',
  },
  formButtons: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '0.75rem',
    marginTop: '1.5rem',
  },
  cancelButton: {
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  submitButton: {
    backgroundColor: '#1E40AF',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  profileButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
    border: 'none',
    borderRadius: '0.5rem',
    padding: '0.75rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  profilePanel: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '400px',
    height: '100vh',
    backgroundColor: 'white',
    boxShadow: '-4px 0 10px rgba(0, 0, 0, 0.1)',
    zIndex: 10000,
    transition: 'right 0.3s ease-in-out',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  profileHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid #E5E7EB',
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    zIndex: 1,
  },
  profileTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  profileContent: {
    padding: '1.5rem',
    flex: 1,
    overflowY: 'auto',
  },
  userInfoContainer: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '0.5rem',
  },
  profileImageContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    overflow: 'hidden',
    marginRight: '1rem',
    border: '2px solid #E5E7EB',
    flexShrink: 0,
  },
  profileImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  nameContainer: {
    flex: 1,
  },
  userName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    marginBottom: '0.5rem',
  },
  userStatsRow: {
    display: 'flex',
    gap: '1rem',
  },
  userStat: {
    display: 'flex',
    flexDirection: 'column',
  },
  userStatValue: {
    fontWeight: '600',
    color: '#1E40AF',
    fontSize: '1rem',
  },
  userStatLabel: {
    fontSize: '0.75rem',
    color: '#6B7280',
  },
  sectionContainer: {
    marginBottom: '1.5rem',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid #E5E7EB',
    paddingBottom: '0.5rem',
  },
  sectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },

  amountHighlight: {
    fontWeight: '600',
    color: '#1E40AF',
  },
  emptyState: {
    textAlign: 'center',
    padding: '1.5rem',
    color: '#6B7280',
    backgroundColor: '#F9FAFB',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
  },
  gigsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  gigCard: {
    border: '1px solid #E5E7EB',
    borderRadius: '0.375rem',
    padding: '1rem',
    backgroundColor: 'white',
  },
  gigCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.5rem',
  },
  gigCategory: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#1E40AF',
    backgroundColor: '#EFF6FF',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
  },
  statusBadge: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontWeight: '500',
  },
  gigTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '0.5rem',
  },
  gigDetails: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '0.75rem',
  },
  gigDetail: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: '#4B5563',
  },
  gigFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid #F3F4F6',
    paddingTop: '0.75rem',
    fontSize: '0.75rem',
    color: '#6B7280',
  },
  gigStats: {
    display: 'flex',
    gap: '0.75rem',
  },
  gigStat: {
    display: 'flex',
    gap: '0.25rem',
  },
  gigStatLabel: {
    fontWeight: '500',
  },
  gigDate: {
    color: '#6B7280',
  },
  completedGigItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '0.75rem',
    borderBottom: '1px solid #F3F4F6',
    backgroundColor: 'white',
    borderRadius: '0.375rem',
    border: '1px solid #E5E7EB',
  },
  completedGigInfo: {
    flex: 1,
  },
  clientInfo: {
    display: 'flex',
    flexDirection: 'column',
    fontSize: '0.75rem',
    color: '#6B7280',
  },
  completedGigStatus: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem',
  },
  completedGigAmount: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#059669',
  },
  postGigButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#1E40AF',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    marginTop: '0.5rem',
  },
  hamburgerButton: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '0.25rem',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: '0.5rem',
  },
  hamburgerLine: {
    width: '20px',
    height: '2px',
    backgroundColor: '#111827',
  },
  sectionDivider: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: '1.5rem',
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #E5E7EB',
  },
  sectionAmount: {
    fontSize: '0.875rem',
    color: '#4B5563',
  },
  amountBold: {
    fontWeight: '600',
    color: '#1E40AF',
  },
  profileLink: {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '0.5rem',
  width: 'fit-content',
  margin: '1rem auto 0.5rem',
  padding: '0.5rem',
  color: '#1E40AF',
  border: 'none',
  background: 'none',
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
  transition: 'color 0.2s ease',
  textDecoration: 'none',
  '&:hover': {
    color: '#1C3879',
    textDecoration: 'underline',
  }
},
  modalBody: {
    padding: '1.5rem',
  },
  gigDetailCategory: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  gigDetailTitle: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    marginBottom: '1.5rem',
  },
  gigDetailSection: {
    marginBottom: '1.5rem',
    paddingBottom: '1.5rem',
    borderBottom: '1px solid #E5E7EB',
  },
  gigDetailSectionTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '0.75rem',
  },
  gigDetailDescription: {
    fontSize: '0.875rem',
    color: '#4B5563',
    lineHeight: '1.5',
  },
  gigDetailInfoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '1rem',
  },
  gigDetailInfo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
  },
  gigDetailInfoLabel: {
    fontSize: '0.75rem',
    color: '#6B7280',
    marginBottom: '0.25rem',
  },
  gigDetailInfoValue: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#111827',
  },
  gigDetailProvider: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  gigDetailProviderInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  gigDetailProviderImage: {
    width: '3rem',
    height: '3rem',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '1px solid #E5E7EB',
  },
  gigDetailProviderName: {
    fontSize: '1rem',
    fontWeight: '500',
    color: '#111827',
  },
  gigDetailProviderDate: {
    fontSize: '0.75rem',
    color: '#6B7280',
  },
  viewProfileButton: {
    padding: '0.5rem 1rem',
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  gigDetailActions: {
    display: 'flex',
    justifyContent: 'center',
  },
  contactProviderButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1E40AF',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    justifyContent: 'center',
  },
  interestButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    justifyContent: 'center',
  },
  gigDetailActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    width: '100%',
  },
  
  contactProviderButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1E40AF',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
    justifyContent: 'center',
  },
  
  interestButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.75rem 1.5rem',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  
  postedByContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    marginBottom: '0.75rem',
  },
  postedByLabel: {
    fontSize: '0.75rem',
    color: '#6B7280',
  },
  postedByUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
  },
  postedByAvatar: {
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  postedByName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#111827',
  },
  acceptedUsersContainer: {
    marginTop: '0.5rem',
    marginBottom: '0.75rem',
    padding: '0.75rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '0.375rem',
    border: '1px dashed #E5E7EB',
  },
  acceptedUsersLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: '0.5rem',
  },
  acceptedUsersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  acceptedUserItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.375rem',
    cursor: 'pointer',
    borderRadius: '0.25rem',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#F3F4F6',
    }
  },
  acceptedUserAvatar: {
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  acceptedUserName: {
    fontSize: '0.8125rem',
    color: '#4B5563',
  },
  postedByContainer: {
    marginTop: '0.5rem',
    marginBottom: '0.75rem',
  },
  postedByLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: '0.375rem',
  },
  postedByUser: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    padding: '0.375rem',
    borderRadius: '0.25rem',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#F3F4F6',
    }
  },
  postedByAvatar: {
    width: '1.5rem',
    height: '1.5rem',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  postedByName: {
    fontSize: '0.8125rem',
    color: '#4B5563',
    fontWeight: '500',
  },
  skillTag: {
  backgroundColor: '#EFF6FF',
  color: '#1E40AF',
  fontSize: '0.75rem',
  fontWeight: '500',
  padding: '0.375rem 0.75rem',
  borderRadius: '0.25rem',
  display: 'inline-block',
  margin: '0.25rem',
},
skillsContainer: {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '0.5rem',
  marginTop: '0.5rem',
},
};

export default Marketplace;