import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiStar } from 'react-icons/fi';

const UserRating = ({ username, size = 'medium' }) => {
  const [rating, setRating] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRating = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/reviews/user/${username}`);
        if (response.data && response.data.stats) {
          setRating(response.data.stats.avgRating || 0);
          setReviewCount(response.data.stats.reviewCount || 0);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error fetching user rating:', error);
        setLoading(false);
      }
    };

    if (username) {
      fetchRating();
    }
  }, [username]);

  const renderStars = () => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const starSize = size === 'small' ? 12 : size === 'large' ? 20 : 16;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<FiStar key={`full-${i}`} size={starSize} fill="#FBBF24" color="#FBBF24" />);
    }
    
    if (hasHalfStar) {
      stars.push(<FiStar key="half" size={starSize} fill="#FBBF24" color="#FBBF24" style={{ clipPath: 'inset(0 50% 0 0)' }} />);
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FiStar key={`empty-${i}`} size={starSize} color="#D1D5DB" />);
    }
    
    return stars;
  };

  if (loading) {
    return <div style={styles.loading[size]}>Loading...</div>;
  }

  if (reviewCount === 0) {
    return <div style={styles.noReviews[size]}>No reviews yet</div>;
  }

  return (
    <div style={styles.container[size]}>
      <div style={styles.stars}>{renderStars()}</div>
      <span style={styles.count[size]}>({reviewCount})</span>
    </div>
  );
};

const styles = {
  container: {
    small: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.25rem',
    },
    medium: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    large: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
  },
  stars: {
    display: 'flex',
    alignItems: 'center',
  },
  count: {
    small: {
      fontSize: '0.75rem',
      color: '#6B7280',
    },
    medium: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    large: {
      fontSize: '1rem',
      color: '#6B7280',
    },
  },
  loading: {
    small: {
      fontSize: '0.75rem',
      color: '#6B7280',
    },
    medium: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    large: {
      fontSize: '1rem',
      color: '#6B7280',
    },
  },
  noReviews: {
    small: {
      fontSize: '0.75rem',
      color: '#6B7280',
    },
    medium: {
      fontSize: '0.875rem',
      color: '#6B7280',
    },
    large: {
      fontSize: '1rem',
      color: '#6B7280',
    },
  },
};

export default UserRating;