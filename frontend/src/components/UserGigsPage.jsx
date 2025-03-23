import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FiDollarSign, FiMapPin, FiClock, FiStar, FiEye, FiMessageSquare, FiArrowLeft, FiHeart, FiChevronDown, FiChevronUp, FiUser } from 'react-icons/fi';
import NavBar from './NavBar';

const UserGigsPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const loggedInUsername = localStorage.getItem('username');
  const isOwnProfile = username === loggedInUsername;
  const [interestedGigs, setInterestedGigs] = useState([]);
  const [expandedGigs, setExpandedGigs] = useState({});
  const [interestedUsers, setInterestedUsers] = useState({});
  const [completionStatus, setCompletionStatus] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await axios.get(`http://localhost:8080/profile?username=${username}`);
        setUserData(userResponse.data);
        
        const gigsResponse = await axios.get(`http://localhost:8080/api/marketplace/user/${username}`);
        
        const gigsWithInterestCounts = await Promise.all(
          gigsResponse.data.map(async (gig) => {
            try {
              const interestedUsersResponse = await axios.get(`http://localhost:8080/api/marketplace/${gig.id}/interested-users`);
              
              setInterestedUsers(prev => ({
                ...prev,
                [gig.id]: interestedUsersResponse.data
              }));
              
              return {
                ...gig,
                interestCount: interestedUsersResponse.data.length
              };
            } catch (err) {
              console.error(`Error fetching interest count for gig ${gig.id}:`, err);
              return {
                ...gig,
                interestCount: 0
              };
            }
          })
        );
        
        setGigs(gigsWithInterestCounts);
        
        if (loggedInUsername) {
          const interestsResponse = await axios.get('http://localhost:8080/api/marketplace/user-interests', {
            params: { username: loggedInUsername }
          });
          setInterestedGigs(interestsResponse.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching user gigs:', err);
        setError('Failed to load gigs. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [username, loggedInUsername]);

  const toggleGigExpansion = (gigId) => {
    setExpandedGigs(prev => ({
      ...prev,
      [gigId]: !prev[gigId]
    }));
  };

  const handleToggleInterest = async (gigId) => {
    if (!loggedInUsername) {
      navigate('/login', { state: { from: `/marketplace/user-gigs/${username}` } });
      return;
    }
    
    const isCurrentlyInterested = interestedGigs.includes(gigId);
    const newIsInterested = !isCurrentlyInterested;
    
    try {
      if (newIsInterested) {
        setInterestedGigs([...interestedGigs, gigId]);
      } else {
        setInterestedGigs(interestedGigs.filter(id => id !== gigId));
      }
      
      setGigs(gigs.map(gig => {
        if (gig.id === gigId) {
          return {
            ...gig,
            interestCount: gig.interestCount + (newIsInterested ? 1 : -1)
          };
        }
        return gig;
      }));
      
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
      
      const interestedUsersResponse = await axios.get(`http://localhost:8080/api/marketplace/${gigId}/interested-users`);
      setInterestedUsers(prev => ({
        ...prev,
        [gigId]: interestedUsersResponse.data
      }));
      
    } catch (error) {
      console.error("Error updating interest status:", error);
      if (isCurrentlyInterested) {
        setInterestedGigs([...interestedGigs, gigId]);
      } else {
        setInterestedGigs(interestedGigs.filter(id => id !== gigId));
      }
      
      setGigs(gigs.map(gig => {
        if (gig.id === gigId) {
          return {
            ...gig,
            interestCount: gig.interestCount + (newIsInterested ? -1 : 1)
          };
        }
        return gig;
      }));
    }
  };

  const navigateToUserProfile = (interestedUsername) => {
    navigate(`/marketplace/profile/${interestedUsername}`);
  };

  const handleAcceptInterest = async (gigId, acceptedUsername) => {
    try {
      await axios.post(`http://localhost:8080/api/marketplace/${gigId}/accept-interest`, null, {
        params: { username: acceptedUsername }
      });
      
      const interestedUsersList = interestedUsers[gigId] || [];
      
      const usersToReject = interestedUsersList.filter(user => 
        user.username !== acceptedUsername && user.status !== 'rejected'
      );
      
      await Promise.all(
        usersToReject.map(user => 
          axios.post(`http://localhost:8080/api/marketplace/${gigId}/reject-interest`, null, {
            params: { username: user.username }
          })
        )
      );
      
      setInterestedUsers(prev => ({
        ...prev,
        [gigId]: prev[gigId].map(user => 
          user.username === acceptedUsername 
            ? { ...user, status: 'accepted' } 
            : { ...user, status: 'rejected' }
        )
      }));
      
      alert(`You've accepted ${acceptedUsername}'s interest in your gig. All other interests have been automatically rejected.`);
    } catch (error) {
      console.error("Error updating interests:", error);
      alert("Failed to process interests. Please try again.");
    }
  };

  const handleRejectInterest = async (gigId, interestedUsername) => {
    try {
      await axios.post(`http://localhost:8080/api/marketplace/${gigId}/reject-interest`, null, {
        params: { username: interestedUsername }
      });
      
      setInterestedUsers(prev => ({
        ...prev,
        [gigId]: prev[gigId].map(user => 
          user.username === interestedUsername ? { ...user, status: 'rejected' } : user
        )
      }));
      
      alert(`You've rejected ${interestedUsername}'s interest in your gig.`);
    } catch (error) {
      console.error("Error rejecting interest:", error);
      alert("Failed to reject interest. Please try again.");
    }
  };

  const handleContactAccepted = (gigId, username, gigTitle) => {
    navigate('/messages', { 
      state: { 
        toUsername: username,
        initialMessage: `Hi, I'd like to discuss the gig "${gigTitle}" that I accepted you for.`,
        createNewConversation: true
      }
    });
  };

  const handlePaySecurityDeposit = (gigId, username, price) => {
    const depositAmount = price * 0.2;
    
    if (window.confirm(`Pay a security deposit of $${depositAmount.toFixed(2)} to ${username}?`)) {
      alert(`This would redirect to payment for $${depositAmount.toFixed(2)}`);
      
    }
  };

  const handleMarkGigCompleted = async (gigId) => {
    try {
      // Change this line to match your backend endpoint
      const response = await axios.post(
        `http://localhost:8080/api/marketplace/${gigId}/confirm-completion`, 
        null, 
        {
          params: { 
            username: loggedInUsername,
            role: 'provider'
          }
        }
      );
      
      // Update the completion status state
      setCompletionStatus(prev => ({
        ...prev,
        [gigId]: {
          providerConfirmed: true,
          workerConfirmed: response.data.workerConfirmedCompletion
        }
      }));
      
      // Update the status in the UI based on the response
      if (response.data.providerConfirmedCompletion && response.data.workerConfirmedCompletion) {
        setGigs(gigs.map(gig => 
          gig.id === gigId ? { ...gig, status: 'Completed' } : gig
        ));
        alert('Gig has been marked as completed!');
      } else {
        alert('Your completion confirmation has been recorded. Waiting for the worker to confirm.');
      }
    } catch (error) {
      console.error("Error marking gig as completed:", error);
      alert("Failed to mark gig as completed. Please try again.");
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

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={`full-${i}`} size={16} fill="#FBBF24" color="#FBBF24" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FiStar key="half" size={16} fill="#FBBF24" color="#FBBF24" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FiStar key={`empty-${i}`} size={16} color="#D1D5DB" />);
    }
    
    return stars;
  };

  const formatImageUrl = (url) => {
    if (!url) return '';
    
    url = url.trim();
    
    if (url.includes(' ')) {
      const baseUrlPart = url.substring(0, url.lastIndexOf('/') + 1);
      const filenamePart = url.substring(url.lastIndexOf('/') + 1);
      const encodedFilename = encodeURIComponent(filenamePart);
      url = baseUrlPart + encodedFilename;
    }
    
    if (url.startsWith('http')) return url;
    
    if (url.startsWith('/')) return `http://localhost:8080${url}`;
    
    return `http://localhost:8080/${url}`;
  };

  const handleViewMarketplaceProfile = () => {
    navigate(`/marketplace/profile/${username}`);
  };

  if (loading) {
    return (
      <div>
        <NavBar />
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.loadingMessage}>Loading gigs...</div>
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
              {isOwnProfile ? 'Your Posted Gigs' : `${userData?.name || username}'s Gigs`}
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
          
          {gigs.length === 0 ? (
            <div style={styles.emptyState}>
              {isOwnProfile ? "You haven't posted any gigs yet." : "This user hasn't posted any gigs yet."}
            </div>
          ) : (
            <div style={styles.gigsList}>
              {gigs.map(gig => (
                <div key={gig.id} style={styles.gigCard}>
                  <div style={styles.gigCardHeader}>
                    <div style={styles.gigCardHeaderLeft}>
                      <div style={styles.gigCategory}>{gig.category}</div>
                      <div style={{
                        ...styles.statusBadge,
                        backgroundColor: gig.status === 'Active' ? '#DCFCE7' : '#FEE2E2',
                        color: gig.status === 'Active' ? '#166534' : '#B91C1C'
                      }}>
                        {gig.status}
                      </div>
                    </div>
                    <div style={styles.gigDate}>
                      Posted: {formatDate(gig.datePosted || gig.createdAt)}
                    </div>
                  </div>
                  
                  <div style={styles.gigCardContent}>
                    <h4 style={styles.gigTitle}>{gig.title}</h4>
                    <p style={styles.gigDescription}>{gig.description}</p>
                    
                    <div style={styles.gigDetailsContainer}>
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
                    
                    <div style={styles.gigStatsContainer}>
                      <div style={styles.gigStat}>
                        <FiEye size={14} color="#4B5563" />
                        <span>{gig.views || 0} views</span>
                      </div>
                      <div style={styles.gigStat}>
                        <FiMessageSquare size={14} color="#4B5563" />
                        <span>{gig.responses || 0} responses</span>
                      </div>
                      <div 
                        style={{...styles.gigStat, cursor: 'pointer'}}
                        onClick={() => toggleGigExpansion(gig.id)}
                      >
                        <FiHeart 
                          size={14} 
                          color="#4B5563" 
                          fill={interestedGigs.includes(gig.id) ? "#EF4444" : "none"}
                        />
                        <span>{gig.interestCount || 0} interests</span>
                        {gig.interestCount > 0 && (
                          expandedGigs[gig.id] ? 
                            <FiChevronUp size={14} color="#4B5563" /> : 
                            <FiChevronDown size={14} color="#4B5563" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {expandedGigs[gig.id] && interestedUsers[gig.id] && interestedUsers[gig.id].length > 0 && (
                    <div style={styles.interestedUsersSectionUpdated}>
                      {interestedUsers[gig.id].some(user => user.status === 'accepted') ? (
                        <div style={styles.acceptedUserContainerUpdated}>
                          <h5 style={styles.sectionTitle}>Accepted User</h5>
                          {interestedUsers[gig.id]
                            .filter(user => user.status === 'accepted')
                            .map(user => (
                              <div key={user.username} style={styles.userCardContainer}>
                                <div 
                                  style={styles.acceptedUserCardUpdated}
                                  onClick={() => navigateToUserProfile(user.username)}
                                >
                                  <div style={styles.userAvatarContainer}>
                                    {user.profilePhoto ? (
                                      <img 
                                        src={formatImageUrl(user.profilePhoto)} 
                                        alt={user.name} 
                                        style={styles.userAvatar}
                                      />
                                    ) : (
                                      <div style={styles.userAvatarPlaceholder}>
                                        <FiUser size={16} color="#6B7280" />
                                      </div>
                                    )}
                                  </div>
                                  <div style={styles.userInfo}>
                                    <div style={styles.userName}>{user.name}</div>
                                    <div style={styles.userUsername}>@{user.username}</div>
                                  </div>
                                  <div style={styles.acceptedStatus}>Accepted</div>
                                </div>
                                
                                <div style={styles.userActionsContainer}>
                                  <button 
                                    style={styles.actionButtonPrimary}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleContactAccepted(gig.id, user.username, gig.title);
                                    }}
                                  >
                                    Contact Provider
                                  </button>
                                  
                                  <button 
                                    style={styles.actionButtonSuccess}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePaySecurityDeposit(gig.id, user.username, gig.price);
                                    }}
                                  >
                                    Pay Security Deposit
                                  </button>

                                  <button 
                                    style={styles.actionButtonPurple}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleMarkGigCompleted(gig.id);
                                    }}
                                  >
                                    {completionStatus[gig.id]?.providerConfirmed 
                                      ? 'Waiting for worker' 
                                      : 'Mark as Completed'}
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <div style={styles.interestedUsersContainerUpdated}>
                          <h5 style={styles.sectionTitle}>Interested Users</h5>
                          <div style={styles.usersList}>
                            {interestedUsers[gig.id].map(user => (
                              <div 
                                key={user.username} 
                                style={{
                                  ...styles.interestedUserCardUpdated,
                                  opacity: user.status === 'rejected' ? 0.6 : 1
                                }}
                                onClick={() => navigateToUserProfile(user.username)}
                              >
                                <div style={styles.userAvatarContainer}>
                                  {user.profilePhoto ? (
                                    <img 
                                      src={formatImageUrl(user.profilePhoto)} 
                                      alt={user.name} 
                                      style={styles.userAvatar}
                                    />
                                  ) : (
                                    <div style={styles.userAvatarPlaceholder}>
                                      <FiUser size={16} color="#6B7280" />
                                    </div>
                                  )}
                                </div>
                                <div style={styles.userInfo}>
                                  <div style={styles.userName}>{user.name}</div>
                                  <div style={styles.userUsername}>@{user.username}</div>
                                </div>
                                <div style={styles.userCreatedDate}>
                                  {formatDate(user.createdDate)}
                                </div>
                                {isOwnProfile && user.status !== 'rejected' && (
                                  <div style={styles.userActionButtons}>
                                    <button 
                                      style={styles.acceptButton}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleAcceptInterest(gig.id, user.username);
                                      }}
                                    >
                                      Accept
                                    </button>
                                    <button 
                                      style={styles.rejectButton}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRejectInterest(gig.id, user.username);
                                      }}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                                {user.status === 'rejected' && (
                                  <div style={styles.rejectedStatus}>Rejected</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div style={styles.gigCardActions}>
                    {!isOwnProfile && (
                      <>
                        {interestedUsers[gig.id]?.some(user => 
                          user.username === loggedInUsername && user.status === 'accepted'
                        ) ? (
                          <button 
                            style={styles.actionButtonFull}
                            onClick={() => handleMarkGigCompleted(gig.id)}
                          >
                            Mark as Completed
                          </button>
                        ) : (
                          <button 
                            style={{
                              ...styles.interestButtonUpdated,
                              backgroundColor: interestedGigs.includes(gig.id) ? '#FEE2E2' : '#F3F4F6',
                              color: interestedGigs.includes(gig.id) ? '#B91C1C' : '#4B5563',
                            }}
                            onClick={() => handleToggleInterest(gig.id)}
                          >
                            <FiHeart 
                              size={16} 
                              fill={interestedGigs.includes(gig.id) ? "#EF4444" : "none"}
                            />
                            {interestedGigs.includes(gig.id) ? 'Remove Interest' : 'Add Interest'}
                          </button>
                        )}
                      </>
                    )}
                    
                    {isOwnProfile && gig.status === 'Active' && (
                      <button 
                        style={styles.actionButtonFull}
                        onClick={() => navigate(`/marketplace/edit-gig/${gig.id}`)}
                      >
                        Edit Gig
                      </button>
                    )}
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
  gigActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  editButton: {
    backgroundColor: '#1E40AF',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  interestButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    border: '1px solid #E5E7EB',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
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
  interestedUsersSection: {
    marginTop: '0.5rem',
    marginBottom: '1rem',
    borderTop: '1px dashed #E5E7EB',
    paddingTop: '1rem',
  },
  interestedUsersTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 0,
    marginBottom: '0.75rem',
  },
  interestedUsersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  interestedUserCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    backgroundColor: '#F9FAFB',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#F3F4F6',
    }
  },
  interestedUserAvatar: {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestedUserImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  interestedUserPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  interestedUserInfo: {
    marginLeft: '0.75rem',
    flex: 1,
  },
  interestedUserName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#111827',
  },
  interestedUserUsername: {
    fontSize: '0.75rem',
    color: '#6B7280',
  },
  interestedUserDate: {
    fontSize: '0.75rem',
    color: '#6B7280',
    marginLeft: 'auto',
  },
  interestedUserActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  acceptButton: {
    backgroundColor: '#DCFCE7',
    color: '#166534',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  rejectButton: {
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.5rem 0.75rem',
    fontSize: '0.75rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  acceptedUserTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 0,
    marginBottom: '0.75rem',
  },
  acceptedUserList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  acceptedUserCard: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    backgroundColor: '#DCFCE7',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#D1FAE5',
    }
  },
  acceptedStatus: {
    fontSize: '0.75rem',
    color: '#166534',
    marginLeft: 'auto',
  },
  rejectedStatus: {
    fontSize: '0.75rem',
    color: '#B91C1C',
    marginLeft: 'auto',
  },
  acceptedUserActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.75rem',
    width: '100%',
  },
  contactAcceptedButton: {
    backgroundColor: '#1E40AF',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.625rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paySecurityButton: {
    backgroundColor: '#047857',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.625rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptedUserContainer: {
    marginTop: '0.5rem',
    marginBottom: '1rem',
    borderTop: '1px dashed #E5E7EB',
    paddingTop: '1rem',
  },
acceptedUserContainer: {
  borderRadius: '0.5rem',
  padding: '1rem',
  backgroundColor: '#F0FDF4',
  border: '1px solid #D1FAE5',
  marginBottom: '1rem',
},
completeGigButton: {
  backgroundColor: '#4F46E5',
  color: 'white',
  border: 'none',
  borderRadius: '0.375rem',
  padding: '0.625rem',
  fontSize: '0.875rem',
  fontWeight: '500',
  cursor: 'pointer',
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
},
  gigCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '0.75rem',
  },
  gigCardHeaderLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  gigCardContent: {
    flex: 1,
  },
  gigDetailsContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1rem',
  },
  gigStatsContainer: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  interestedUsersSectionUpdated: {
    marginTop: '0.5rem',
    marginBottom: '1rem',
    borderTop: '1px dashed #E5E7EB',
    paddingTop: '1rem',
  },
  acceptedUserContainerUpdated: {
    borderRadius: '0.5rem',
    padding: '1rem',
    backgroundColor: '#F0FDF4',
    border: '1px solid #D1FAE5',
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4B5563',
    marginTop: 0,
    marginBottom: '0.75rem',
  },
  userCardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  acceptedUserCardUpdated: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    backgroundColor: '#DCFCE7',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#D1FAE5',
    }
  },
  userAvatarContainer: {
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    overflow: 'hidden',
    backgroundColor: '#E5E7EB',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  userAvatar: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  userAvatarPlaceholder: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    backgroundColor: '#E5E7EB',
  },
  userInfo: {
    marginLeft: '0.75rem',
    flex: 1,
  },
  userName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#111827',
  },
  userUsername: {
    fontSize: '0.75rem',
    color: '#6B7280',
  },
  acceptedStatus: {
    fontSize: '0.75rem',
    color: '#166534',
    marginLeft: 'auto',
  },
  userActionsContainer: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.75rem',
    width: '100%',
  },
  actionButtonPrimary: {
    backgroundColor: '#1E40AF',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.625rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonSuccess: {
    backgroundColor: '#047857',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.625rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionButtonPurple: {
    backgroundColor: '#4F46E5',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.625rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  interestedUsersContainerUpdated: {
    marginTop: '0.5rem',
    marginBottom: '1rem',
    borderTop: '1px dashed #E5E7EB',
    paddingTop: '1rem',
  },
  usersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  interestedUserCardUpdated: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.5rem',
    borderRadius: '0.375rem',
    backgroundColor: '#F9FAFB',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#F3F4F6',
    }
  },
  userCreatedDate: {
    fontSize: '0.75rem',
    color: '#6B7280',
    marginLeft: 'auto',
  },
  userActionButtons: {
    display: 'flex',
    gap: '0.5rem',
  },
  rejectedStatus: {
    fontSize: '0.75rem',
    color: '#B91C1C',
    marginLeft: 'auto',
  },
  gigCardActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  actionButtonFull: {
    backgroundColor: '#1E40AF',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    width: '100%',
  },
  interestButtonUpdated: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    border: '1px solid #E5E7EB',
    borderRadius: '0.375rem',
    padding: '0.75rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    width: '100%',
  },
};

export default UserGigsPage;