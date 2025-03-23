import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FiDollarSign, FiMapPin, FiClock, FiArrowLeft, FiMessageSquare } from 'react-icons/fi';
import NavBar from './NavBar';

const AcceptedGigsPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [acceptedGigs, setAcceptedGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [completionStatus, setCompletionStatus] = useState({});
  const [selectedGig, setSelectedGig] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const loggedInUsername = localStorage.getItem('username');
  const isOwnProfile = username === loggedInUsername;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await axios.get(`http://localhost:8080/profile?username=${username}`);
        setUserData(userResponse.data);
        
        const acceptedGigsResponse = await axios.get(`http://localhost:8080/api/marketplace/accepted/${username}`);
        // Filter out completed gigs from the initial data
        const activeGigs = acceptedGigsResponse.data.filter(gig => gig.status !== 'Completed');
        setAcceptedGigs(activeGigs);
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching accepted gigs:', err);
        setError('Failed to load accepted gigs. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [username]);

  useEffect(() => {
    if (acceptedGigs.length > 0) {
      fetchCompletionStatus();
    }
  }, [acceptedGigs]);

  const fetchCompletionStatus = async () => {
    try {
      const statuses = {};
      for (const gig of acceptedGigs) {
        const response = await axios.get(`http://localhost:8080/api/marketplace/${gig.id}`);
        statuses[gig.id] = {
          providerConfirmed: response.data.providerConfirmedCompletion,
          workerConfirmed: response.data.workerConfirmedCompletion
        };
      }
      setCompletionStatus(statuses);
    } catch (error) {
      console.error("Error fetching completion statuses:", error);
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

  const handleViewMarketplaceProfile = () => {
    navigate(`/marketplace/profile/${username}`);
  };

  const handlePaySecurityDeposit = (gigId, username, price) => {
    const depositAmount = price * 0.2;
    
    if (window.confirm(`Pay a security deposit of $${depositAmount.toFixed(2)} to ${username}?`)) {
      alert(`This would redirect to payment for $${depositAmount.toFixed(2)}`);
      
    }
  };

  const handleMarkGigCompleted = async (gigId) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/marketplace/${gigId}/confirm-completion`, 
        null, 
        {
          params: { 
            username: loggedInUsername,
            role: 'worker'
          }
        }
      );
      
      // Update local completion status
      setCompletionStatus(prev => ({
        ...prev,
        [gigId]: {
          providerConfirmed: response.data.providerConfirmedCompletion,
          workerConfirmed: response.data.workerConfirmedCompletion
        }
      }));
      
      // Fix for review prompt after gig completion
      if (response.data.providerConfirmedCompletion && response.data.workerConfirmedCompletion) {
        // Gig is now completed
        setAcceptedGigs(prevGigs => prevGigs.filter(g => g.id !== gigId));
        
        // Show review prompt
        if (window.confirm('Gig has been marked as completed! Would you like to leave a review?')) {
          // Instead of navigating to a separate page, open the review modal here
          setSelectedGig(gig);
          setShowReviewModal(true);
        } else {
          alert('You can always leave a review later from your completed gigs page.');
        }
      } else {
        alert('Your completion confirmation has been recorded. Waiting for the other party to confirm.');
      }
    } catch (error) {
      console.error("Error marking gig as completed:", error);
      alert("Failed to mark gig as completed. Please try again: " + error.message);
    }
  };

  if (loading) {
    return (
      <div>
        <NavBar />
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.loadingMessage}>Loading accepted gigs...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <NavBar />
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.errorMessage}>{error}</div>
            <button 
              style={styles.backButton}
              onClick={() => navigate('/marketplace')}
            >
              Back to Marketplace
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavBar />
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>
              {isOwnProfile ? 'Your Accepted Gigs' : `${userData?.name || username}'s Accepted Gigs`}
            </h1>
            <div style={styles.headerButtons}>
              <button 
                style={styles.viewProfileButton}
                onClick={handleViewMarketplaceProfile}
              >
                View Marketplace Profile
              </button>
              <button 
                style={styles.backButton}
                onClick={() => navigate('/marketplace')}
              >
                <FiArrowLeft size={16} />
                <span>Back to Marketplace</span>
              </button>
            </div>
          </div>
          
          {acceptedGigs.length === 0 ? (
            <div style={styles.emptyState}>
              {isOwnProfile 
                ? "You don't have any active accepted gigs." 
                : `${userData?.name || username} doesn't have any active accepted gigs.`}
            </div>
          ) : (
            <div style={styles.gigsList}>
              {acceptedGigs.map(gig => (
                <div key={gig.id} style={styles.gigCard}>
                  <div style={styles.gigCardTop}>
                    <div style={styles.gigCategory}>{gig.category}</div>
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: '#DCFCE7',
                      color: '#166534'
                    }}>
                      Accepted
                    </div>
                  </div>
                  
                  <h4 style={styles.gigTitle}>{gig.title}</h4>
                  <p style={styles.gigDescription}>{gig.description}</p>
                  
                  <div style={styles.gigDetails}>
                    <div style={styles.detailItem}>
                      <FiDollarSign size={16} color="#4B5563" />
                      <span style={styles.detailText}>${gig.price}/hour</span>
                    </div>
                    <div style={styles.detailItem}>
                      <FiMapPin size={16} color="#4B5563" />
                      <span style={styles.detailText}>{gig.location}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <FiClock size={16} color="#4B5563" />
                      <span style={styles.detailText}>{gig.duration}</span>
                    </div>
                  </div>

                  {gig.skillsRequired && (
                    <div style={styles.sidebarSkillsContainer}>
                      <div style={styles.sidebarSkillsLabel}>Skills:</div>
                      <div style={styles.sidebarSkillsTags}>
                        {gig.skillsRequired.split(',').map((skill, index) => (
                          <span key={index} style={styles.sidebarSkillTag}>{skill.trim()}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div style={styles.gigFooter}>
                    <div style={styles.gigStats}>
                      <span style={styles.gigStat}>
                        Posted by: {gig.userFullName || gig.username}
                      </span>
                    </div>
                    <div style={styles.gigDate}>
                      Accepted: {formatDate(gig.acceptedDate || gig.createdAt)}
                    </div>
                  </div>
                  
                  <div style={styles.gigActionButtons}>
                    <button 
                      style={styles.contactButton}
                      onClick={() => navigate('/messages', { 
                        state: { 
                          toUsername: gig.username,
                          initialMessage: `Hi, I'm messaging about the gig "${gig.title}" that I was accepted for.`,
                          createNewConversation: true
                        }
                      })}
                    >
                      <FiMessageSquare size={16} />
                      <span style={styles.buttonText}>Contact Provider</span>
                    </button>
                    
                    <div style={styles.completionSection}>
                      <div style={styles.completionStatus}>
                        {completionStatus[gig.id]?.providerConfirmed && (
                          <div style={styles.completionNotice}>
                            Provider has confirmed completion
                          </div>
                        )}
                      </div>
                      <button 
                        style={{
                          ...styles.completeGigButton,
                          opacity: completionStatus[gig.id]?.workerConfirmed ? 0.7 : 1,
                          cursor: completionStatus[gig.id]?.workerConfirmed ? 'not-allowed' : 'pointer'
                        }}
                        onClick={() => handleMarkGigCompleted(gig.id)}
                        disabled={completionStatus[gig.id]?.workerConfirmed}
                      >
                        {completionStatus[gig.id]?.workerConfirmed 
                          ? 'Waiting for provider' 
                          : 'Mark as Completed'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100%',
    minHeight: '100vh',
    backgroundColor: '#F3F4F6',
    overflowX: 'hidden',
  },
  content: {
    padding: '1.5rem 1rem',
    maxWidth: '1200px',
    margin: '0 auto',
    marginTop: '80px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
  },
  headerButtons: {
    display: 'flex',
    gap: '0.75rem',
  },
  pageTitle: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  backButton: {
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
    border: '1px solid #E5E7EB',
    borderRadius: '0.375rem',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  viewProfileButton: {
    backgroundColor: '#1E40AF',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  emptyState: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6B7280',
    backgroundColor: '#F9FAFB',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
  },
  gigsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))',
    gap: '1.5rem',
  },
  gigCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    border: '1px solid #E5E7EB',
    padding: '1.25rem',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
  },
  gigCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  gigCategory: {
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
    fontSize: '0.75rem',
    fontWeight: '600',
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
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '0.5rem',
    margin: 0,
  },
  gigDescription: {
    fontSize: '0.875rem',
    color: '#4B5563',
    marginBottom: '1rem',
    marginTop: '0.5rem',
  },
  gigDetails: {
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
  gigFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #E5E7EB',
  },
  gigStats: {
    display: 'flex',
    gap: '1rem',
  },
  gigStat: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: '#6B7280',
  },
  gigDate: {
    fontSize: '0.75rem',
    color: '#6B7280',
  },
  loadingMessage: {
    textAlign: 'center',
    padding: '2rem',
    color: '#6B7280',
    fontSize: '1rem',
  },
  errorMessage: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    padding: '1rem',
    borderRadius: '0.375rem',
    marginBottom: '1.5rem',
  },
  contactButton: {
    backgroundColor: '#1E40AF',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.625rem 1rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    width: 'auto',  // Changed from flex: 1
  },
  buttonText: {
    whiteSpace: 'nowrap',
  },
  sidebarSkillsContainer: {
    marginTop: '0.5rem',
    marginBottom: '0.75rem',
  },
  sidebarSkillsLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: '0.375rem',
  },
  sidebarSkillsTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.25rem',
  },
  sidebarSkillTag: {
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
    fontSize: '0.7rem',
    fontWeight: '500',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    display: 'inline-block',
  },
  gigActionButtons: {
    display: 'flex',
    flexDirection: 'row',
    gap: '0.75rem',
    marginTop: '1rem',
    width: '100%',
    flexWrap: 'nowrap', 
  },

  completeGigButton: {
    backgroundColor: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    flex: '1 1 0', 
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    whiteSpace: 'nowrap', 
    textOverflow: 'ellipsis', 
    overflow: 'hidden', 
    opacity: (props) => (props.disabled ? 0.7 : 1),
    cursor: (props) => (props.disabled ? 'not-allowed' : 'pointer'),
  },
  completionSection: {
    marginLeft: 'auto', // This pushes it to the right
    marginTop: '0',     // Changed from 1rem
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    borderTop: 'none',  // Removed the border
    paddingTop: '0',    // Changed from 1rem
  },
  completionStatus: {
    fontSize: '0.875rem',
    color: '#4B5563',
    marginBottom: '0.5rem',
  },
  completionNotice: {
    color: '#059669',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
};

export default AcceptedGigsPage;