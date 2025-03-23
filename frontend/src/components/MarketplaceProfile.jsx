import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { FiDollarSign, FiMapPin, FiClock, FiStar, FiChevronRight, FiEye, FiMessageSquare, FiExternalLink, FiEdit2, FiSave, FiX, FiUsers, FiCheck, FiX as FiXCircle } from 'react-icons/fi';
import NavBar from './NavBar';
import UserRating from './UserRating';
import Reviews from './Reviews';

const MarketplaceProfile = () => {
  const { username } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [postedGigs, setPostedGigs] = useState([]);
  const [completedGigs, setCompletedGigs] = useState([]);
  const [acceptedGigs, setAcceptedGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLink, setPaymentLink] = useState(null);
  const [isEditingPaymentLink, setIsEditingPaymentLink] = useState(false);
  const [newPaymentLink, setNewPaymentLink] = useState('');
  const [savingPaymentLink, setSavingPaymentLink] = useState(false);
  const currentUser = localStorage.getItem('username');
  const isOwnProfile = username === currentUser;
  
  const [stats, setStats] = useState({
    totalGigsPosted: 0,
    totalGigsCompleted: 0,
    totalEarnings: 0,
    avgRating: 0
  });

  const [interestedUsers, setInterestedUsers] = useState({});
  const [expandedGig, setExpandedGig] = useState(null);
  const [loadingInterested, setLoadingInterested] = useState({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userResponse = await axios.get(`http://localhost:8080/profile?username=${username}`);
        const userData = userResponse.data;
        
        console.log("User data fetched:", userData);
        console.log("Skills data:", userData.skills);
        
        setUserData(userData);
        
        const gigsResponse = await axios.get(`http://localhost:8080/api/marketplace/user/${username}`);
        setPostedGigs(gigsResponse.data);
        
        const acceptedGigsResponse = await axios.get(`http://localhost:8080/api/marketplace/accepted/${username}`);
        setAcceptedGigs(acceptedGigsResponse.data);
        
        // Fetch completed gigs - filter from all user gigs where status is "Completed"
        const completedGigsData = gigsResponse.data.filter(gig => gig.status === "Completed");
        setCompletedGigs(completedGigsData);
        
        // Calculate total earnings from completed gigs
        const totalEarnings = completedGigsData.reduce((sum, gig) => sum + gig.price, 0);
        
        setStats({
          totalGigsPosted: gigsResponse.data.length,
          totalGigsCompleted: completedGigsData.length, 
          totalAccepted: acceptedGigsResponse.data.length, 
          totalEarnings: totalEarnings, 
          avgRating: 4.8 // This could also be calculated from actual ratings
        });

        
        try {
          const paymentLinkResponse = await axios.get(`http://localhost:8080/api/payment-links/${username}`);
          if (paymentLinkResponse.data && paymentLinkResponse.data.paymentLink) {
            setPaymentLink(paymentLinkResponse.data.paymentLink);
          }
        } catch (err) {
        
          if (err.response && err.response.status !== 404) {
            console.error('Error fetching payment link:', err);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching marketplace profile data:', err);
        setError('Failed to load marketplace profile. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchData();
  }, [username]);

  const handleSavePaymentLink = async () => {
    if (!newPaymentLink) return;
    
    setSavingPaymentLink(true);
    try {
      await axios.post('http://localhost:8080/api/payment-links', {
        username: username,
        paymentLink: newPaymentLink
      });
      
      setPaymentLink(newPaymentLink);
      setIsEditingPaymentLink(false);
      setSavingPaymentLink(false);
    } catch (error) {
      console.error('Error saving payment link:', error);
      setSavingPaymentLink(false);
    }
  };

  const fetchInterestedUsers = async (gigId) => {
    setLoadingInterested(prev => ({ ...prev, [gigId]: true }));
    try {
      const response = await axios.get(`http://localhost:8080/api/marketplace/${gigId}/interested-users`);
      setInterestedUsers(prev => ({ 
        ...prev, 
        [gigId]: response.data 
      }));
      setLoadingInterested(prev => ({ ...prev, [gigId]: false }));
    } catch (error) {
      console.error('Error fetching interested users:', error);
      setLoadingInterested(prev => ({ ...prev, [gigId]: false }));
    }
  };

  const toggleExpandGig = (gigId) => {
    if (expandedGig === gigId) {
      setExpandedGig(null);
    } else {
      setExpandedGig(gigId);
      if (!interestedUsers[gigId]) {
        fetchInterestedUsers(gigId);
      }
    }
  };

  const handleAcceptInterest = async (gigId, interestedUsername) => {
    try {
      await axios.post(`http://localhost:8080/api/marketplace/${gigId}/accept-interest`, null, {
        params: { username: interestedUsername }
      });
      
      setInterestedUsers(prev => ({
        ...prev,
        [gigId]: prev[gigId].map(user => 
          user.username === interestedUsername 
            ? { ...user, status: 'accepted' } 
            : user
        )
      }));
    } catch (error) {
      console.error('Error accepting interest:', error);
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
          user.username === interestedUsername 
            ? { ...user, status: 'rejected' } 
            : user
        )
      }));
    } catch (error) {
      console.error('Error rejecting interest:', error);
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

  if (loading) {
    return (
      <div>
        <NavBar />
        <div style={styles.container}>
          <div style={styles.content}>
            <div style={styles.loadingMessage}>Loading marketplace profile...</div>
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
            <h1 style={styles.pageTitle}>Marketplace Profile</h1>
            <button 
              style={styles.backButton}
              onClick={() => navigate('/marketplace')}
            >
              Back to Marketplace
            </button>
          </div>
          
          <div style={styles.profileGrid}>
            <div style={styles.leftColumn}>
              <div style={styles.userCard}>
                <div style={styles.userCardHeader}>
                  <div style={styles.profileImageContainer}>
                    <img 
                      src={userData?.profilePhoto || "https://randomuser.me/api/portraits/men/1.jpg"} 
                      alt="Profile" 
                      style={styles.profileImage}
                    />
                  </div>
                  <div>
                    <h2 style={styles.userName}>{userData?.name || username}</h2>
                    <p style={styles.userUsername}>@{username}</p>
                    <p style={styles.userMajor}>{userData?.major} Student</p>
                  </div>
                </div>
                
                <div style={styles.statsGrid}>
                  <div style={styles.statBox}>
                    <span style={styles.statValue}>{stats.totalGigsPosted}</span>
                    <span style={styles.statLabel}>Gigs Posted</span>
                  </div>
                  <div style={styles.statBox}>
                    <span style={styles.statValue}>{stats.totalGigsCompleted}</span>
                    <span style={styles.statLabel}>Completed</span>
                  </div>
                  <div style={styles.statBox}>
                    <span style={styles.statValue}>₹{stats.totalEarnings.toFixed(2)}</span>
                    <span style={styles.statLabel}>Earnings</span>
                  </div>
                  <div style={styles.statBox}>
                    <UserRating username={username} size="large" />
                    <span style={styles.statLabel}>Rating</span>
                  </div>
                </div>

                {isOwnProfile && (
                  <div style={styles.profileInfoItem}>
                    <div style={styles.profileInfoIcon}>
                      <FiDollarSign size={18} color="#4B5563" />
                    </div>
                    <div style={styles.profileInfoContent}>
                      <span style={styles.profileInfoLabel}>Payment</span>
                      
                      {isEditingPaymentLink ? (
                        <div style={styles.paymentLinkEditContainer}>
                          <input
                            type="url"
                            value={newPaymentLink}
                            onChange={(e) => setNewPaymentLink(e.target.value)}
                            placeholder="https://paypal.me/yourusername"
                            style={styles.paymentLinkInput}
                            autoFocus
                          />
                          <div style={styles.paymentLinkEditButtons}>
                            <button 
                              onClick={handleSavePaymentLink}
                              disabled={savingPaymentLink}
                              style={styles.paymentLinkSaveButton}
                              title="Save"
                            >
                              <FiSave size={16} />
                            </button>
                            <button 
                              onClick={() => {
                                setIsEditingPaymentLink(false);
                                setNewPaymentLink(paymentLink || '');
                              }}
                              style={styles.paymentLinkCancelButton}
                              title="Cancel"
                            >
                              <FiX size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div style={styles.paymentLinkContainer}>
                          {paymentLink ? (
                            <a 
                              href={paymentLink} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={styles.paymentLink}
                            >
                              Payment Link <FiExternalLink size={14} />
                            </a>
                          ) : (
                            <span style={styles.noPaymentLink}>No payment link added</span>
                          )}
                          
                          <button 
                            onClick={() => {
                              setIsEditingPaymentLink(true);
                              setNewPaymentLink(paymentLink || '');
                            }}
                            style={styles.paymentLinkEditButton}
                            title="Edit payment link"
                          >
                            <FiEdit2 size={14} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {!isOwnProfile && paymentLink && (
                  <div style={styles.profileInfoItem}>
                    <div style={styles.profileInfoIcon}>
                      <FiDollarSign size={18} color="#4B5563" />
                    </div>
                    <div style={styles.profileInfoContent}>
                      <span style={styles.profileInfoLabel}>Payment</span>
                      <a 
                        href={paymentLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        style={styles.paymentLink}
                      >
                        Payment Link <FiExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                )}
                
                <button 
                  style={styles.profileButton}
                  onClick={() => navigate(`/profile/${username}`)}
                >
                  View Full Profile
                </button>
              </div>
              
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Skills & Services</h3>
                <div style={styles.skillsList}>
                  {userData && userData.skills && userData.skills.length > 0 ? (
                    userData.skills.map((skill, index) => (
                      <div key={index} style={styles.skillBadge}>{skill}</div>
                    ))
                  ) : (
                    <p style={styles.emptyMessage}>No skills listed</p>
                  )}
                </div>
              </div>
              
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Contact</h3>
                <button style={styles.contactButton}>
                  Message {userData?.name || username}
                </button>
              </div>
            </div>
            
            <div style={styles.rightColumn}>
              
              
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Gigs You Posted</h3>
                
                {postedGigs.length === 0 ? (
                  <div style={styles.emptyState}>
                    You haven't posted any gigs yet.
                  </div>
                ) : (
                  <div style={styles.gigsList}>
                    {postedGigs.map(gig => (
                      <div key={gig.id} style={styles.gigCard}>
                        <div style={styles.gigCardTop}>
                          <div style={styles.gigCategory}>{gig.category}</div>
                          <div style={{
                            ...styles.statusBadge,
                            backgroundColor: gig.status === 'Active' ? '#DCFCE7' : '#FEE2E2',
                            color: gig.status === 'Active' ? '#166534' : '#B91C1C'
                          }}>
                            {gig.status}
                          </div>
                        </div>
                        
                        <h4 style={styles.gigTitle}>{gig.title}</h4>
                        <p style={styles.gigDescription}>{gig.description}</p>
                        
                        <div style={styles.gigDetails}>
                          <div style={styles.detailItem}>
                            <FiDollarSign size={16} color="#4B5563" />
                            <span style={styles.detailText}>₹{gig.price}/hour</span>
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
                              <FiEye size={14} color="#4B5563" />
                              <span>{gig.views || 0} views</span>
                            </span>
                            <span style={styles.gigStat}>
                              <FiMessageSquare size={14} color="#4B5563" />
                              <span>{gig.responses || 0} responses</span>
                            </span>
                          </div>
                          <div style={styles.gigDate}>
                            Posted: {formatDate(gig.datePosted || gig.createdAt)}
                          </div>
                        </div>

                        {isOwnProfile && (
                          <div style={styles.interestedUsersSection}>
                            <button 
                              style={styles.interestedUsersButton}
                              onClick={() => toggleExpandGig(gig.id)}
                            >
                              <FiUsers size={16} />
                              <span>
                                {expandedGig === gig.id ? 'Hide Interested Users' : 'View Interested Users'}
                              </span>
                            </button>
                            
                            {expandedGig === gig.id && (
                              <div style={styles.interestedUsersList}>
                                {loadingInterested[gig.id] ? (
                                  <p style={styles.loadingText}>Loading interested users...</p>
                                ) : interestedUsers[gig.id]?.length > 0 ? (
                                  interestedUsers[gig.id].map(user => (
                                    <div key={user.username} style={styles.interestedUserItem}>
                                      <div style={styles.interestedUserInfo}>
                                        <img 
                                          src={user.profilePhoto || '/assets/placeholder-profile.png'} 
                                          alt={user.name} 
                                          style={styles.interestedUserAvatar}
                                        />
                                        <div style={styles.interestedUserDetails}>
                                          <span style={styles.interestedUserName}>{user.name}</span>
                                          <span style={styles.interestedUserDate}>
                                            Interested since: {formatDate(user.createdDate)}
                                          </span>
                                          <span style={{
                                            ...styles.statusBadge,
                                            backgroundColor: user.status === 'accepted' ? '#DCFCE7' : 
                                                             user.status === 'rejected' ? '#FEE2E2' : '#EFF6FF',
                                            color: user.status === 'accepted' ? '#166534' : 
                                                   user.status === 'rejected' ? '#B91C1C' : '#1E40AF'
                                          }}>
                                            {user.status === 'accepted' ? 'Accepted' : 
                                             user.status === 'rejected' ? 'Rejected' : 'Pending'}
                                          </span>
                                        </div>
                                      </div>
                                      
                                      {user.status !== 'accepted' && user.status !== 'rejected' && (
                                        <div style={styles.interestedUserActions}>
                                          <button 
                                            style={styles.acceptButton}
                                            onClick={() => handleAcceptInterest(gig.id, user.username)}
                                          >
                                            <FiCheck size={16} />
                                          </button>
                                          <button 
                                            style={styles.rejectButton}
                                            onClick={() => handleRejectInterest(gig.id, user.username)}
                                          >
                                            <FiXCircle size={16} />
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  ))
                                ) : (
                                  <p style={styles.emptyMessage}>No users have shown interest in this gig yet.</p>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={styles.showAllLinkContainer}>
                  <button 
                    style={styles.showAllLink}
                    onClick={() => navigate(`/marketplace/user-gigs/${username}`)}
                  >
                    Show all gigs you posted
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>
              
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Completed Gigs</h3>
                
                {completedGigs.length === 0 ? (
                  <div style={styles.emptyState}>
                    No completed projects yet.
                  </div>
                ) : (
                  <div style={styles.completedProjectsList}>
                    {completedGigs.map(gig => (
                      <div key={gig.id} style={styles.completedProject}>
                        <div style={styles.completedProjectLeft}>
                          <h4 style={styles.completedProjectTitle}>{gig.title}</h4>
                          <div style={styles.clientInfo}>
                            <span>Provider: {gig.userFullName || gig.username}</span>
                            <span>Date: {formatDate(gig.acceptedDate || gig.createdAt)}</span>
                          </div>
                        </div>
                        <div style={styles.completedProjectRight}>
                          <div style={{
                            ...styles.statusBadge,
                            backgroundColor: '#DCFCE7',
                            color: '#166534'
                          }}>
                            {gig.status}
                          </div>
                          <div style={styles.completedAmount}>₹{gig.price}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Gigs Accepted</h3>
                
                {acceptedGigs.length === 0 ? (
                  <div style={styles.emptyState}>
                    No accepted gigs at the moment.
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
                            <span style={styles.detailText}>₹{gig.price}/hour</span>
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
                          Contact Provider
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                
                <div style={styles.showAllLinkContainer}>
                  <button 
                    style={styles.showAllLink}
                    onClick={() => navigate(`/marketplace/accepted-gigs/${username}`)}
                  >
                    Show all accepted gigs
                    <FiChevronRight size={16} />
                  </button>
                </div>
              </div>

              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>Reviews</h3>
                <Reviews username={username} isOwnProfile={isOwnProfile} />
              </div>

            </div>
          </div>
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
  profileGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '1.5rem',
  },
  leftColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  rightColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  userCard: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E5E7EB',
  },
  userCardHeader: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  profileImageContainer: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    overflow: 'hidden',
    border: '2px solid #E5E7EB',
  },
  profileImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  userName: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.25rem 0',
  },
  userUsername: {
    fontSize: '0.875rem',
    color: '#6B7280',
    margin: '0 0 0.25rem 0',
  },
  userMajor: {
    fontSize: '0.875rem',
    color: '#4B5563',
    margin: 0,
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '1rem',
    marginBottom: '1.5rem',
  },
  statBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: '0.375rem',
    padding: '1rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statValue: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1E40AF',
    marginBottom: '0.25rem',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: '#6B7280',
  },
  ratingDisplay: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  ratingText: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4B5563',
    marginLeft: '0.25rem',
  },
  profileButton: {
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
  section: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E5E7EB',
  },
  sectionTitle: {
    fontSize: '1.125rem',
    fontWeight: '600',
    color: '#111827',
    marginTop: 0,
    marginBottom: '1rem',
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #E5E7EB',
  },
  skillsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  skillBadge: {
    backgroundColor: '#EFF6FF',
    color: '#1E40AF',
    fontSize: '0.75rem',
    fontWeight: '500',
    padding: '0.375rem 0.75rem',
    borderRadius: '0.25rem',
  },
  contactButton: {
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
  emptyMessage: {
    color: '#6B7280',
    fontSize: '0.875rem',
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
    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
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
  ratingContainer: {
    display: 'flex',
    alignItems: 'center',
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
  completedProjectsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  completedProject: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '0.375rem',
    border: '1px solid #E5E7EB',
  },
  completedProjectLeft: {
    flex: 1,
  },
  completedProjectTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 0.5rem 0',
  },
  clientInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    fontSize: '0.75rem',
    color: '#6B7280',
  },
  completedProjectRight: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '0.5rem',
  },
  statusBadge: {
    fontSize: '0.75rem',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
    fontWeight: '500',
  },
  completedAmount: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#059669',
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
  showAllLinkContainer: {
    textAlign: 'center',
    marginTop: '1rem',
  },
  showAllLink: {
    backgroundColor: 'transparent',
    color: '#1E40AF',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  showAllLinkContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginTop: '1rem',
    paddingTop: '0.75rem',
    borderTop: '1px solid #E5E7EB',
  },
  showAllLink: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    color: '#1E40AF',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#F3F4F6',
    }
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
  skillsContainer: {
    marginBottom: '1rem',
  },
  skillsLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: '#4B5563',
    marginBottom: '0.375rem',
  },
  skillsTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  profileInfoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
    marginBottom: '1rem',
  },
  profileInfoIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '2rem',
    height: '2rem',
    borderRadius: '50%',
    backgroundColor: '#F3F4F6',
  },
  profileInfoContent: {
    display: 'flex',
    flexDirection: 'column',
  },
  profileInfoLabel: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#4B5563',
  },
  paymentLink: {
    fontSize: '0.875rem',
    color: '#1E40AF',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
  },
  paymentLinkEditContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  paymentLinkInput: {
    flex: 1,
    padding: '0.5rem',
    borderRadius: '0.375rem',
    border: '1px solid #E5E7EB',
    fontSize: '0.875rem',
  },
  paymentLinkEditButtons: {
    display: 'flex',
    gap: '0.25rem',
  },
  paymentLinkSaveButton: {
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.5rem',
    cursor: 'pointer',
  },
  paymentLinkCancelButton: {
    backgroundColor: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.5rem',
    cursor: 'pointer',
  },
  paymentLinkContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  noPaymentLink: {
    fontSize: '0.875rem',
    color: '#6B7280',
  },
  paymentLinkEditButton: {
    backgroundColor: 'transparent',
    color: '#1E40AF',
    border: 'none',
    cursor: 'pointer',
  },
  interestedUsersSection: {
    marginTop: '1rem',
    borderTop: '1px solid #E5E7EB',
    paddingTop: '1rem',
  },
  interestedUsersButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    background: 'none',
    border: 'none',
    color: '#1E40AF',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.25rem',
    transition: 'background-color 0.2s ease',
  },
  interestedUsersList: {
    marginTop: '0.75rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    backgroundColor: '#F9FAFB',
    padding: '0.75rem',
    borderRadius: '0.375rem',
  },
  interestedUserItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.5rem',
    backgroundColor: 'white',
    borderRadius: '0.25rem',
    border: '1px solid #E5E7EB',
  },
  interestedUserInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  interestedUserAvatar: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    objectFit: 'cover',
  },
  interestedUserDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  interestedUserName: {
    fontSize: '0.875rem',
    fontWeight: '600',
    color: '#111827',
  },
  interestedUserDate: {
    fontSize: '0.75rem',
    color: '#6B7280',
  },
  interestedUserActions: {
    display: 'flex',
    gap: '0.5rem',
  },
  acceptButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#10B981',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '2rem',
    height: '2rem',
    cursor: 'pointer',
  },
  rejectButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EF4444',
    color: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '2rem',
    height: '2rem',
    cursor: 'pointer',
  },
  loadingText: {
    fontSize: '0.875rem',
    color: '#6B7280',
    textAlign: 'center',
  }
};

export default MarketplaceProfile;