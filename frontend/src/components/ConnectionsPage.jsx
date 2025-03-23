import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NavBar from './NavBar';
import { UserPlus, UserCheck, UserX, Users } from 'lucide-react';

const ConnectionsPage = () => {
  const navigate = useNavigate();
  const { username: profileUsername } = useParams(); 
  const loggedInUsername = localStorage.getItem('username');
  
  const displayUsername = profileUsername || loggedInUsername;
  
  const isOwnProfile = displayUsername === loggedInUsername;
  
  const [connections, setConnections] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  useEffect(() => {
    fetchConnections();
    
    if (isOwnProfile) {
      fetchPendingRequests();
    }
    
    fetchProfileData();
  }, [displayUsername, isOwnProfile]);

  const fetchProfileData = async () => {
    try {
      const response = await fetch(`http://localhost:8080/profile?username=${displayUsername}`);
      if (response.ok) {
        const data = await response.json();
        setProfileData(data);
      }
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/connections/user/${displayUsername}`);
      if (response.ok) {
        const data = await response.json();
        setConnections(data);
      }
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch(`http://localhost:8080/api/connections/requests?username=${loggedInUsername}`);
      if (response.ok) {
        const data = await response.json();
        setPendingRequests(data);
      }
    } catch (error) {
      console.error('Error fetching pending requests:', error);
    }
  };

  const handleRemoveConnection = async (username) => {
    try {
      const response = await fetch(`http://localhost:8080/api/connections/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromUsername: loggedInUsername,
          toUsername: username
        })
      });
      
      if (response.ok) {
        setConnections(connections.filter(conn => conn.username !== username));
      }
    } catch (error) {
      console.error('Error removing connection:', error);
    }
  };

  const handleConnectionResponse = async (username, action) => {
    try {
      const response = await fetch(`http://localhost:8080/api/connections/${action}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fromUsername: username,
          toUsername: loggedInUsername
        })
      });
      
      if (response.ok) {
        setPendingRequests(pendingRequests.filter(req => req.username !== username));
        
        if (action === 'accept') {
          fetchConnections();
        }
      }
    } catch (error) {
      console.error(`Error ${action} connection request:`, error);
    }
  };

  return (
    <div style={styles.container}>
      <NavBar />
      
      <div style={styles.content}>
        <h1 style={styles.pageTitle}>
          {isOwnProfile ? 'Your Connections' : `${profileData?.firstName || displayUsername}'s Connections`}
        </h1>
        
        <div style={styles.statsSection}>
          <div style={styles.statBox}>
            <h2 style={styles.statTitle}>Total Connections</h2>
            <p style={styles.statValue}>{connections.length}</p>
          </div>
          {isOwnProfile && (
            <div style={styles.statBox}>
              <h2 style={styles.statTitle}>Pending Requests</h2>
              <p style={styles.statValue}>{pendingRequests.length}</p>
            </div>
          )}
        </div>

        {isOwnProfile && pendingRequests.length > 0 && (
          <div style={styles.section}>
            <h2 style={styles.sectionTitle}>Pending Connection Requests</h2>
            <div style={styles.connectionsList}>
              {pendingRequests.map((request) => (
                <div key={request.username} style={styles.connectionCard}>
                  <div style={styles.connectionInfo} onClick={() => navigate(`/profile/${request.username}`)}>
                    <img 
                      src={request.profilePhoto || '/assets/placeholder-profile.png'} 
                      alt={request.firstName} 
                      style={styles.profileImage} 
                    />
                    <div style={styles.connectionDetails}>
                      <h3 style={styles.connectionName}>{request.firstName} {request.lastName}</h3>
                      <p style={styles.connectionUsername}>@{request.username}</p>
                    </div>
                  </div>
                  <div style={styles.actionButtons}>
                    <button 
                      style={styles.acceptButton}
                      onClick={() => handleConnectionResponse(request.username, 'accept')}
                    >
                      <UserCheck size={16} />
                    </button>
                    <button 
                      style={styles.rejectButton}
                      onClick={() => handleConnectionResponse(request.username, 'reject')}
                    >
                      <UserX size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            {isOwnProfile ? 'Your Connections' : `${profileData?.firstName || displayUsername}'s Connections`}
          </h2>
          {loading ? (
            <div style={styles.loading}>Loading connections...</div>
          ) : connections.length > 0 ? (
            <div style={styles.connectionsList}>
              {connections.map((connection) => (
                <div key={connection.username} style={styles.connectionCard}>
                  <div style={styles.connectionInfo}>
                    <img 
                      src={connection.profilePhoto || '/assets/placeholder-profile.png'} 
                      alt={connection.firstName} 
                      style={{...styles.profileImage, cursor: 'pointer'}} 
                      onClick={() => navigate(`/profile/${connection.username}`)}
                    />
                    <div style={styles.connectionDetails}>
                      <h3 
                        style={{...styles.connectionName, cursor: 'pointer'}}
                        onClick={() => navigate(`/profile/${connection.username}`)}
                      >
                        {connection.firstName} {connection.lastName}
                      </h3>
                      <p 
                        style={{...styles.connectionUsername, cursor: 'pointer'}}
                        onClick={() => navigate(`/profile/${connection.username}`)}
                      >
                        @{connection.username}
                      </p>
                    </div>
                  </div>
                  {isOwnProfile && (
                    <button 
                      style={styles.removeButton}
                      onClick={() => handleRemoveConnection(connection.username)}
                    >
                      <UserX size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div style={styles.noConnections}>
              {isOwnProfile 
                ? "You don't have any connections yet." 
                : `${profileData?.firstName || displayUsername} doesn't have any connections yet.`}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    width: '100vw',
    minHeight: '100vh',
    backgroundColor: '#F3F4F6',
  },
  content: {
    width: '95%', 
    margin: '0 auto',
    padding: '1.5rem 1rem', 
  },
  pageTitle: {
    fontSize: '1.5rem', 
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '1rem', 
    textAlign: 'center',
  },
  statsSection: {
    display: 'flex',
    justifyContent: 'center',
    gap: '1.5rem', 
    marginBottom: '1.5rem', 
  },
  statBox: {
    backgroundColor: 'white',
    padding: '1rem', 
    borderRadius: '0.5rem',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
    width: '180px',
    textAlign: 'center',
  },
  statTitle: {
    fontSize: '0.875rem', 
    fontWeight: '500',
    color: '#6B7280',
    marginBottom: '0.375rem', 
  },
  statValue: {
    fontSize: '1.5rem', 
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: '0.5rem',
    padding: '1.25rem', 
    marginBottom: '1.5rem', 
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
  sectionTitle: {
    fontSize: '1rem', 
    fontWeight: '600',
    color: '#111827',
    marginBottom: '1rem', 
    paddingBottom: '0.5rem',
    borderBottom: '1px solid #E5E7EB',
  },
  connectionsList: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', 
    gap: '0.75rem', 
  },
  connectionCard: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '0.75rem', 
    borderRadius: '0.5rem',
    backgroundColor: '#F9FAFB',
    border: '1px solid #E5E7EB',
    transition: 'transform 0.2s',
  },
  connectionInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem', 
    cursor: 'pointer',
    flexGrow: 1,
  },
  profileImage: {
    width: '40px', 
    height: '40px', 
    borderRadius: '50%',
    objectFit: 'cover',
  },
  connectionDetails: {
    display: 'flex',
    flexDirection: 'column',
  },
  connectionName: {
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#111827',
    margin: 0,
  },
  connectionUsername: {
    fontSize: '0.75rem',
    color: '#6B7280',
    margin: 0,
  },
  removeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem', 
    padding: '0.375rem 0.75rem', 
    backgroundColor: '#FEE2E2',
    color: '#EF4444',
    border: 'none',
    borderRadius: '0.375rem',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '0.75rem', 
  },
  actionButtons: {
    display: 'flex',
    gap: '0.375rem', 
  },
  acceptButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem', 
    padding: '0.375rem 0.75rem', 
    backgroundColor: '#DCFCE7',
    color: '#10B981',
    border: 'none',
    borderRadius: '0.375rem',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '0.75rem', 
  },
  rejectButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.375rem', 
    padding: '0.375rem 0.75rem', 
    backgroundColor: '#FEE2E2',
    color: '#EF4444',
    border: 'none',
    borderRadius: '0.375rem',
    fontWeight: '500',
    cursor: 'pointer',
    fontSize: '0.75rem', 
  },
  loading: {
    textAlign: 'center',
    padding: '1.5rem 0', 
    color: '#6B7280',
    fontSize: '0.875rem', 
  },
  noConnections: {
    textAlign: 'center',
    padding: '1.5rem 0', 
    color: '#6B7280',
    fontSize: '0.875rem', 
  },
};

export default ConnectionsPage;