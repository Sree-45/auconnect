import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiStar, FiX, FiSend } from 'react-icons/fi';

const WriteReview = ({ gigId, revieweeUsername, onReviewSubmitted, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [communicationRating, setCommunicationRating] = useState(0);
  const [qualityRating, setQualityRating] = useState(0);
  const [valueRating, setValueRating] = useState(0);
  const [reliabilityRating, setReliabilityRating] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [canReview, setCanReview] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);

  const loggedInUsername = localStorage.getItem('username');

  useEffect(() => {
    const checkCanReview = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/reviews/can-review`, {
          params: { 
            gigId, 
            username: loggedInUsername 
          }
        });
        setCanReview(response.data.canReview);
      } catch (error) {
        console.error('Error checking review eligibility:', error);
        setError('Could not verify if you can review this gig.');
      }
    };

    checkCanReview();
  }, [gigId, loggedInUsername]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (rating === 0) {
      setError('Please select a rating before submitting.');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const reviewData = {
        reviewerUsername: loggedInUsername,
        revieweeUsername,
        rating,
        comment,
        communicationRating,
        qualityRating,
        valueRating,
        reliabilityRating,
        isWorkerReview: false // Set based on the role
      };
      
      await axios.post(`http://localhost:8080/api/reviews/gig/${gigId}`, reviewData);
      
      setLoading(false);
      onReviewSubmitted();
    } catch (error) {
      console.error('Error submitting review:', error);
      setLoading(false);
      setError(error.response?.data || 'Failed to submit review. Please try again.');
    }
  };

  const renderStarInput = (value, onChange) => {
    return (
      <div style={styles.starsContainer}
           onMouseLeave={() => setHoverRating(0)}>
        {[1, 2, 3, 4, 5].map(star => (
          <FiStar 
            key={star}
            size={24} 
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverRating(star)}
            style={styles.star}
            fill={(hoverRating || value) >= star ? "#FBBF24" : "none"}
            color={(hoverRating || value) >= star ? "#FBBF24" : "#D1D5DB"}
          />
        ))}
      </div>
    );
  };

  if (!canReview) {
    return (
      <div style={styles.container}>
        <div style={styles.header}>
          <h3 style={styles.title}>Write a Review</h3>
          <button style={styles.closeButton} onClick={onClose}>
            <FiX size={20} />
          </button>
        </div>
        <div style={styles.notEligible}>
          You are not eligible to review this gig. Reviews can only be submitted:
          <ul style={styles.eligibilityList}>
            <li>After the gig is completed</li>
            <li>Once per user per gig</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h3 style={styles.title}>Write a Review</h3>
        <button style={styles.closeButton} onClick={onClose}>
          <FiX size={20} />
        </button>
      </div>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>Overall Rating</label>
          {renderStarInput(rating, setRating)}
        </div>
        
        <div style={styles.categoriesContainer}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Communication</label>
            {renderStarInput(communicationRating, setCommunicationRating)}
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Quality of Work</label>
            {renderStarInput(qualityRating, setQualityRating)}
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Value for Money</label>
            {renderStarInput(valueRating, setValueRating)}
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Reliability</label>
            {renderStarInput(reliabilityRating, setReliabilityRating)}
          </div>
        </div>
        
        <div style={styles.formGroup}>
          <label style={styles.label}>Comment</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details of your experience working with this person..."
            style={styles.textarea}
            rows={4}
            required
          />
        </div>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <div style={styles.formActions}>
          <button type="button" style={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" style={styles.submitButton} disabled={loading}>
            {loading ? 'Submitting...' : 'Submit Review'}
            {!loading && <FiSend size={16} style={{ marginLeft: '0.5rem' }} />}
          </button>
        </div>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    maxWidth: '600px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.5rem',
    borderBottom: '1px solid #E5E7EB',
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
  },
  closeButton: {
    background: 'none',
    border: 'none',
    color: '#6B7280',
    cursor: 'pointer',
    padding: '0.5rem',
    borderRadius: '0.375rem',
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
  label: {
    display: 'block',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#374151',
    marginBottom: '0.5rem',
  },
  starsContainer: {
    display: 'flex',
    gap: '0.5rem',
  },
  star: {
    cursor: 'pointer',
    transition: 'transform 0.1s ease-in-out',
    ':hover': {
      transform: 'scale(1.1)',
    },
  },
  categoriesContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
    gap: '1rem',
    backgroundColor: '#F9FAFB',
    padding: '1rem',
    borderRadius: '0.5rem',
    marginBottom: '1.25rem',
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    border: '1px solid #D1D5DB',
    fontSize: '0.875rem',
    resize: 'vertical',
  },
  error: {
    color: '#B91C1C',
    backgroundColor: '#FEE2E2',
    padding: '0.75rem',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    marginBottom: '1rem',
  },
  formActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '1rem',
  },
  cancelButton: {
    padding: '0.625rem 1.25rem',
    backgroundColor: '#F3F4F6',
    color: '#4B5563',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
  },
  submitButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.625rem 1.25rem',
    backgroundColor: '#1E40AF',
    color: 'white',
    border: 'none',
    borderRadius: '0.375rem',
    fontSize: '0.875rem',
    fontWeight: '500',
    cursor: 'pointer',
    ':disabled': {
      opacity: 0.7,
      cursor: 'not-allowed',
    },
  },
  notEligible: {
    padding: '1.5rem',
    color: '#6B7280',
    fontSize: '0.875rem',
    lineHeight: '1.5',
  },
  eligibilityList: {
    marginTop: '0.5rem',
    paddingLeft: '1.5rem',
  },
};

export default WriteReview;