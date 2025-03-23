import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { FiStar, FiArrowLeft } from 'react-icons/fi';
import NavBar from './NavBar';
import WriteReview from './WriteReview';

const CompletedGigsPage = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const [completedGigs, setCompletedGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedGig, setSelectedGig] = useState(null);
  
  const loggedInUsername = localStorage.getItem('username');
  const isOwnProfile = username === loggedInUsername;

  useEffect(() => {
    const fetchCompletedGigs = async () => {
      setLoading(true);
      try {
        // Get all gigs this user was involved in
        const response = await axios.get(`http://localhost:8080/api/marketplace/user/${username}/completed`);
        setCompletedGigs(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching completed gigs:', err);
        setError('Failed to load completed gigs. Please try again later.');
        setLoading(false);
      }
    };
    
    fetchCompletedGigs();
  }, [username]);

  const handleReviewGig = (gig) => {
    setSelectedGig(gig);
    setShowReviewModal(true);
  };

  const handleReviewSubmitted = () => {
    setShowReviewModal(false);
    // Optionally refresh the completed gigs list
    // fetchCompletedGigs();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    } catch (error) {
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

  return (
    <div>
      <NavBar />
      <div style={styles.container}>
        <div style={styles.content}>
          <div style={styles.header}>
            <h1 style={styles.pageTitle}>
              {isOwnProfile ? 'Your Completed Gigs' : `${username}'s Completed Gigs`}
            </h1>
            <button 
              style={styles.backButton}
              onClick={() => navigate(`/marketplace/profile/${username}`)}
            >
              <FiArrowLeft size={16} />
              <span>Back to Profile</span>
            </button>
          </div>
          
          {loading ? (
            <div style={styles.loadingMessage}>Loading completed gigs...</div>
          ) : error ? (
            <div style={styles.errorMessage}>{error}</div>
          ) : completedGigs.length === 0 ? (
            <div style={styles.emptyState}>
              {isOwnProfile 
                ? "You don't have any completed gigs yet." 
                : `${username} doesn't have any completed gigs yet.`}
            </div>
          ) : (
            <div style={styles.gigsList}>
              {completedGigs.map(gig => (
                <div key={gig.id} style={styles.gigCard}>
                  <div style={styles.gigCardTop}>
                    <div style={styles.gigCategory}>{gig.category}</div>
                    <div style={{
                      ...styles.statusBadge,
                      backgroundColor: '#DCFCE7',
                      color: '#166534'
                    }}>
                      Completed
                    </div>
                  </div>
                  
                  <h4 style={styles.gigTitle}>{gig.title}</h4>
                  <p style={styles.gigDescription}>{gig.description}</p>
                  
                  <div style={styles.gigDetails}>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Price:</span>
                      <span style={styles.detailValue}>${gig.price}/hour</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>Completed on:</span>
                      <span style={styles.detailValue}>{formatDate(gig.completedDate || gig.updatedAt)}</span>
                    </div>
                    <div style={styles.detailItem}>
                      <span style={styles.detailLabel}>{isOwnProfile ? 'Worked with:' : 'Posted by:'}</span>
                      <span style={styles.detailValue}>
                        {isOwnProfile ? gig.acceptedUsername : gig.userFullName}
                      </span>
                    </div>
                  </div>
                  
                  <div style={styles.gigCardActions}>
                    {gig.canReview && (
                      <button 
                        style={styles.reviewButton}
                        onClick={() => handleReviewGig(gig)}
                      >
                        Write a Review
                      </button>
                    )}
                    <button 
                      style={styles.viewDetailsButton}
                      onClick={() => navigate(`/marketplace/${gig.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showReviewModal && selectedGig && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <WriteReview 
              gigId={selectedGig.id}
              revieweeUsername={isOwnProfile ? selectedGig.acceptedUsername : selectedGig.username}
              onReviewSubmitted={handleReviewSubmitted}
              onClose={() => setShowReviewModal(false)}
            />
          </div>
        </div>
      )}
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
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#111827',
    margin: 0,
  },
  backButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
    border: '1px solid #E5E7EB',
    borderRadius: '0.375rem',
    padding: '0.625rem 1.25rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
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
  statusBadge: {
    fontSize: '0.75rem',
    fontWeight: '500',
    padding: '0.25rem 0.5rem',
    borderRadius: '0.25rem',
  },
  gigTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: '#111827',
    marginBottom: '0.5rem',
  },
  gigDescription: {
    fontSize: '0.875rem',
    color: '#4B5563',
    marginBottom: '1rem',
  },
  gigDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    marginBottom: '1.25rem',
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.875rem',
  },
  detailLabel: {
    color: '#6B7280',
    fontWeight: '500',
  },
  detailValue: {
    color: '#111827',
  },
  gigCardActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: 'auto',
  },
  reviewButton: {
    flex: 1,
    backgroundColor: '#1E40AF',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    padding: '0.625rem',
    fontSize: '0.875rem',
    fontWeight: '600',
    cursor: 'pointer',
  },
  viewDetailsButton: {
    flex: 1,
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
    border: '1px solid #E5E7EB',
    borderRadius: '0.375rem',
    padding: '0.625rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '90%',
    maxWidth: '600px',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
};

export default CompletedGigsPage;