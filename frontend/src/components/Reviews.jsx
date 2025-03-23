import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiStar, FiUser, FiCalendar } from 'react-icons/fi';

const Reviews = ({ username }) => {
  const [reviews, setReviews] = useState([]);
  const [stats, setStats] = useState({ avgRating: 0, reviewCount: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchReviews = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/reviews/user/${username}`);
        setReviews(response.data.reviews);
        setStats(response.data.stats);
      } catch (err) {
        console.error('Error fetching reviews:', err);
        setError('Failed to load reviews. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [username]);

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

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return <div style={styles.loading}>Loading reviews...</div>;
  }

  if (error) {
    return <div style={styles.error}>{error}</div>;
  }

  if (reviews.length === 0) {
    return <div style={styles.emptyState}>No reviews yet</div>;
  }

  return (
    <div style={styles.container}>
      <div style={styles.summaryContainer}>
        <div style={styles.averageRating}>
          <span style={styles.ratingNumber}>{stats.avgRating.toFixed(1)}</span>
          <div style={styles.starsContainer}>{renderStars(stats.avgRating)}</div>
        </div>
        <div style={styles.reviewCount}>{stats.reviewCount} {stats.reviewCount === 1 ? 'review' : 'reviews'}</div>
      </div>

      <div style={styles.reviewList}>
        {reviews.map((review) => (
          <div key={review.id} style={styles.reviewCard}>
            <div style={styles.reviewHeader}>
              <div style={styles.reviewerInfo}>
                <div style={styles.reviewerAvatar}>
                  <FiUser size={20} color="#6B7280" />
                </div>
                <div>
                  <div style={styles.reviewerName}>{review.reviewerUsername}</div>
                  <div style={styles.reviewDate}>
                    <FiCalendar size={12} />
                    <span>{formatDate(review.createdAt)}</span>
                  </div>
                </div>
              </div>
              <div style={styles.ratingDisplay}>
                {renderStars(review.rating)}
              </div>
            </div>
            
            <p style={styles.reviewText}>{review.comment}</p>
            
            {(review.communicationRating || review.qualityRating || review.valueRating || review.reliabilityRating) && (
              <div style={styles.detailRatings}>
                {review.communicationRating > 0 && (
                  <div style={styles.detailRating}>
                    <span style={styles.detailRatingLabel}>Communication:</span>
                    <span style={styles.detailRatingValue}>{review.communicationRating}/5</span>
                  </div>
                )}
                {review.qualityRating > 0 && (
                  <div style={styles.detailRating}>
                    <span style={styles.detailRatingLabel}>Quality:</span>
                    <span style={styles.detailRatingValue}>{review.qualityRating}/5</span>
                  </div>
                )}
                {review.valueRating > 0 && (
                  <div style={styles.detailRating}>
                    <span style={styles.detailRatingLabel}>Value:</span>
                    <span style={styles.detailRatingValue}>{review.valueRating}/5</span>
                  </div>
                )}
                {review.reliabilityRating > 0 && (
                  <div style={styles.detailRating}>
                    <span style={styles.detailRatingLabel}>Reliability:</span>
                    <span style={styles.detailRatingValue}>{review.reliabilityRating}/5</span>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '1rem 0',
  },
  summaryContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    padding: '1rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '0.5rem',
  },
  averageRating: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  ratingNumber: {
    fontSize: '2rem',
    fontWeight: '700',
    color: '#111827',
  },
  starsContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  reviewCount: {
    fontSize: '0.875rem',
    color: '#6B7280',
    marginLeft: 'auto',
  },
  reviewList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  reviewCard: {
    padding: '1rem',
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    border: '1px solid #E5E7EB',
    boxShadow: '0 1px 2px rgba(0, 0, 0, 0.05)',
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '0.75rem',
  },
  reviewerInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  reviewerAvatar: {
    width: '2.5rem',
    height: '2.5rem',
    borderRadius: '50%',
    backgroundColor: '#F3F4F6',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#111827',
  },
  reviewDate: {
    fontSize: '0.75rem',
    color: '#6B7280',
    display: 'flex',
    alignItems: 'center',
    gap: '0.25rem',
    marginTop: '0.25rem',
  },
  ratingDisplay: {
    display: 'flex',
    alignItems: 'center',
  },
  reviewText: {
    fontSize: '0.875rem',
    lineHeight: '1.5',
    color: '#4B5563',
    marginBottom: '0.75rem',
  },
  detailRatings: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '0.5rem',
    padding: '0.75rem',
    backgroundColor: '#F9FAFB',
    borderRadius: '0.375rem',
  },
  detailRating: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.75rem',
  },
  detailRatingLabel: {
    color: '#6B7280',
  },
  detailRatingValue: {
    fontWeight: '500',
    color: '#111827',
  },
  loading: {
    padding: '2rem',
    textAlign: 'center',
    color: '#6B7280',
  },
  error: {
    padding: '1rem',
    backgroundColor: '#FEE2E2',
    color: '#B91C1C',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
  },
  emptyState: {
    padding: '2rem',
    textAlign: 'center',
    color: '#6B7280',
    backgroundColor: '#F9FAFB',
    borderRadius: '0.5rem',
    fontSize: '0.875rem',
  },
};

export default Reviews;