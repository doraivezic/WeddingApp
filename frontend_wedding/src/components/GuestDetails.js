import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import {LanguageContext} from "../contexts/LanguageContext";

const GuestDetails = () => {
  const { userUsername } = useContext(AuthContext);
  const { language, toggleLanguage } = useContext(LanguageContext);
  const [responses, setResponses] = useState([]);
  const [nameSurnames, setNameSurnames] = useState([]);
  const [comment, setComment] = useState('');
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [userMessage, setUserMessage] = useState('');

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`/api/users/${userUsername}`);
        const data = await response.json();
        if (response.ok) {
          setUserMessage(data.message);
        } else {
          console.error('Error fetching user details:', data.error);
        }
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    };

    fetchUserDetails();
  }, [userUsername]);

  useEffect(() => {
    const fetchNameSurnamesAndInitializeResponses = async () => {
      try {
        const nameSurnameResponse = await fetch(`/api/name_surnames/${userUsername}`);
        const nameSurnameData = await nameSurnameResponse.json();
        if (nameSurnameResponse.ok) {
          setNameSurnames(nameSurnameData);
          const initialResponses = nameSurnameData.map(ns => ({
            name_surname: ns.name_surname,
            user_username: userUsername,
            accepted: false,
            menu_option: '',
            allergies: '',
            comment: ''
          }));
          setResponses(initialResponses);
        } else {
          console.error('Error fetching name surnames:', nameSurnameData.error);
        }
      } catch (error) {
        console.error('Error fetching name surnames:', error);
      }
    };

    fetchNameSurnamesAndInitializeResponses();
  }, [userUsername]);

  useEffect(() => {
    const fetchFormResponses = async () => {
      try {
        const response = await fetch(`/api/form_responses/${userUsername}`);
        const data = await response.json();
        if (response.ok) {
          setResponses(prevResponses => {
            // Merge existing responses with fetched responses
            const updatedResponses = prevResponses.map(prev => {
              const existingResponse = data.find(r => r.name_surname === prev.name_surname);
              return existingResponse || prev;
            });
            return updatedResponses;
          });
          const hasAccepted = data.some(response => response.accepted);
          setShowCommentSection(hasAccepted);
        } else {
          console.error('Error fetching form responses:', data.error);
        }
      } catch (error) {
        console.error('Error fetching form responses:', error);
      }
    };

    fetchFormResponses();
  }, [userUsername]);

  useEffect(() => {
    const hasAccepted = responses.some(response => response.accepted);
    setShowCommentSection(hasAccepted);
  }, [responses]);

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
        const hasAccepted = responses.some(response => response.accepted);
        setShowCommentSection(hasAccepted);
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

  return (
    <>
      <div className="background-image">
        <div className="background-text">
          <h2>Wedding Details</h2>
          <p>Welcome to our wedding! Please fill out the form for each guest.</p>
          {userMessage && <p><strong>Message from Admin:</strong> {userMessage}</p>}
        </div>
      </div>
      <div className="container">
        {responses.length === 0 && nameSurnames.map((ns, index) => (
            <form key={index} onSubmit={handleUpdateChanges}>
              <div>
                <label>
                  Name Surname:
                  <input type="text" value={ns.name_surname} disabled/>
                </label>
              </div>
              <div>
                <label>
                  Accept Invitation:
                  <input
                      type="checkbox"
                      checked={responses[index]?.accepted || false}
                      onChange={(e) =>
                          handleResponseChange(index, 'accepted', e.target.checked)
                      }
                  />
                </label>
              </div>
              {responses[index]?.accepted && (
                  <>
                    <div>
                      <label>
                        Menu Option:
                        <select
                            value={responses[index]?.menu_option || ''}
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
                            value={responses[index]?.allergies || ''}
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
        {responses.length > 0 && responses.map((response, index) => (
            <form key={index} onSubmit={handleUpdateChanges}>
              <div>
                <label>
                  Name Surname:
                  <input type="text" value={response.name_surname} disabled/>
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
    </>
  );
};

export default GuestDetails;
