import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';

const GuestForm = () => {
  const { userRole, userUsername } = useContext(AuthContext);
  const [responses, setResponses] = useState([]);
  const [comment, setComment] = useState('');
  const [showCommentSection, setShowCommentSection] = useState(false);

  useEffect(() => {
    const fetchFormResponses = async () => {
      const response = await fetch(`/api/form_responses/${userUsername}`);
      const data = await response.json();
      console.log(data); // Verify data in frontend
      if (response.ok) {
        setResponses(data);
      } else {
        console.error('Error fetching form responses:', data.error);
      }
    };

    fetchFormResponses();
  }, [userUsername]);

  const handleUpdateChanges = async (e) => {
    e.preventDefault();
    const promises = responses.map(response =>
      fetch('/api/form_responses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...response, user_username: userUsername }),
      })
    );

    Promise.all(promises).then(results => {
      if (results.every(result => result.ok)) {
        alert('Changes updated successfully!');
        setShowCommentSection(true);
      } else {
        alert('Error updating changes');
      }
    });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch('/api/comments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_username: userUsername, comment }),
    });

    if (response.ok) {
      alert('Comment submitted successfully!');
      setComment('');
    } else {
      alert('Error submitting comment');
    }
  };

  const handleResponseChange = (index, field, value) => {
    const newResponses = [...responses];
    newResponses[index][field] = value;
    setResponses(newResponses);
  };

  if (userRole !== 'guest') {
    return <div>Access Denied</div>;
  }

  return (
    <div>
      {responses.map((response, index) => (
        <form key={index} onSubmit={handleUpdateChanges}>
          <div>
            <label>
              Name Surname:
              <input type="text" value={response.name_surname} disabled />
            </label>
          </div>
          <div>
            <label>
              Accept Invitation:
              <input
                type="checkbox"
                checked={response.accepted}
                onChange={(e) =>
                  handleResponseChange(index, 'accepted', e.target.checked)
                }
              />
            </label>
          </div>
          {response.accepted && (
            <>
              <div>
                <label>
                  Menu Option:
                  <select
                    value={response.menu_option}
                    onChange={(e) =>
                      handleResponseChange(index, 'menu_option', e.target.value)
                    }
                  >
                    <option value="">Select...</option>
                    <option value="vegetarian">Vegetarian</option>
                    <option value="non-vegetarian">Non-Vegetarian</option>
                    <option value="vegan">Vegan</option>
                  </select>
                </label>
              </div>
              <div>
                <label>
                  Allergies:
                  <input
                    type="text"
                    value={response.allergies}
                    onChange={(e) =>
                      handleResponseChange(index, 'allergies', e.target.value)
                    }
                  />
                </label>
              </div>
            </>
          )}
        </form>
      ))}
      {responses.length > 0 && (
        <button onClick={handleUpdateChanges}>Update Changes</button>
      )}
      {showCommentSection && (
        <form onSubmit={handleCommentSubmit}>
          <div>
            <label>
              Comment/Message:
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              />
            </label>
          </div>
          <button type="submit">Send Message</button>
        </form>
      )}
    </div>
  );
};

export default GuestForm;
