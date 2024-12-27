import React, { useState, useEffect } from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
// import { width } from '@fortawesome/free-solid-svg-icons/fa0';

const apiUrl = process.env.REACT_APP_API_URL || '';

const Admin = () => {
  const [users, setUsers] = useState([]);
  const [nameSurnames, setNameSurnames] = useState([]);
  const [formResponses, setFormResponses] = useState([]);
  const [comments, setComments] = useState([]);
  const [newNameSurname, setNewNameSurname] = useState('');
  const [editingMessage, setEditingMessage] = useState({});
  const [newUser, setNewUser] = useState({ username: '', password: '' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/users`);
        const data = await response.json();
        if (response.ok) {
          setUsers(data.filter(user => user.role !== 'admin'));
        } else {
          console.error('Error fetching users:', data.error);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    const fetchNameSurnames = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/namesurnames`);
        const data = await response.json();
        if (response.ok) {
          setNameSurnames(data);
        } else {
          console.error('Error fetching name_surnames:', data.error);
        }
      } catch (error) {
        console.error('Error fetching name_surnames:', error);
      }
    };

    fetchNameSurnames();
  }, []);

  useEffect(() => {
    const fetchFormResponses = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/form_responses`);
        const data = await response.json();
        if (response.ok) {
          setFormResponses(data);
        } else {
          console.error('Error fetching form responses:', data.error);
        }
      } catch (error) {
        console.error('Error fetching form responses:', error);
      }
    };

    fetchFormResponses();
  }, []);

  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/comments`);
        const data = await response.json();
        if (response.ok) {
          setComments(data);
        } else {
          console.error('Error fetching comments:', data.error);
        }
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, []);


  const handleAddNameSurname = async (username) => {
    if (newNameSurname.trim() === '') return;
    try {
      const response = await fetch(`${apiUrl}/api/namesurnames`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_username: username, name_surname: newNameSurname }),
      });
      
      if (response.ok) {
        const newNameSurnameObj = await response.json();
        // Ensure the returned object includes the user_username field.
        setNameSurnames((prev) => [...prev, { ...newNameSurnameObj, user_username: username }]);
        setNewNameSurname('');
      } else {
        console.error('Error adding name_surname:', response.error);
      }
    } catch (error) {
      console.error('Error adding name_surname:', error);
    }
  };
  

  const handleDeleteNameSurname = async (name_guest) => {
    if (window.confirm(`Are you sure you want to delete guest ${name_guest}?`)) {
      try {
        const response = await fetch(`${apiUrl}/api/namesurnames/${name_guest}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setNameSurnames((prev) => prev.filter((ns) => ns.name_surname !== name_guest));
        } else {
          console.error('Error deleting guest:', response.error);
        }
      } catch (error) {
        console.error('Error deleting guest:', error);
      }
    }
  };

  const handleEditMessage = (username, message) => {
    setEditingMessage((prev) => ({ ...prev, [username]: message }));
  };

  const handleUpdateUser = async (username) => {
    try {
      const response = await fetch(`${apiUrl}/api/users/${username}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: editingMessage[username] }),
      });
      if (response.ok) {
        setUsers((prev) =>
          prev.map((user) =>
            user.username === username ? { ...user, message: editingMessage[username] } : user
          )
        );
        setEditingMessage((prev) => ({ ...prev, [username]: '' }));
      } else {
        console.error('Error updating user:', response.error);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const handleAddUser = async () => {
    if (newUser.username.trim() === '' || newUser.password.trim() === '') return;
    try {
      const response = await fetch(`${apiUrl}/api/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });
      if (response.ok) {
        const newUserObj = await response.json();
        setUsers((prev) => [...prev, { username: newUserObj.username, message: '' }]);
        setNewUser({ username: '', password: '' });
      } else {
        console.error('Error adding user:', response.error);
      }
    } catch (error) {
      console.error('Error adding user:', error);
    }
  };

  const handleDeleteUser = async (username) => {
    if (window.confirm(`Are you sure you want to delete user ${username}?`)) {
      try {
        const response = await fetch(`${apiUrl}/api/users/${username}`, {
          method: 'DELETE',
        });
        if (response.ok) {
          setUsers((prev) => prev.filter((user) => user.username !== username));
        } else {
          console.error('Error deleting user:', response.error);
        }
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
  };

  const groupedResponses = formResponses.reduce((acc, response) => {
    if (!acc[response.user_username]) {
      acc[response.user_username] = {};
    }
    if (!acc[response.user_username][response.name_surname]) {
      acc[response.user_username][response.name_surname] = [];
    }
    acc[response.user_username][response.name_surname].push(response);
    return acc;
  }, {});

  const groupedComments = comments.reduce((acc, comment) => {
    if (!acc[comment.user_username]) {
      acc[comment.user_username] = [];
    }
    acc[comment.user_username].push(comment.comment);
    return acc;
  }, {});

  return (
    <div className="admin-container">
      
      <div className="admin-panel" >
        <h2>Admin Panel</h2>

        <div class="table-of-contents">
          <ul>
            <li style={{padding: '10px'}}><a href="#section-manage-users" style={{textDecoration: 'none'}}>Manage Users</a></li>
            <li style={{padding: '10px'}}><a href="#section-add-user" style={{textDecoration: 'none'}}>Add new user</a></li>
            <li style={{padding: '10px'}}><a href="#section-fulfilled-forms" style={{textDecoration: 'none'}}>Fulfilled forms</a></li>
            <li style={{padding: '10px'}}><a href="#section-recieved-comments" style={{textDecoration: 'none'}}>Recieved comments</a></li>
          </ul>
        </div>
      </div>

      <div className="admin-panel">
        <h3 id="section-manage-users">Manage Users</h3>
        <ul>
          {users.map((user) => (
            <li key={user.username}>
              <div>
                <strong>{user.username}</strong>
                <button onClick={() => handleDeleteUser(user.username)} className='trash-icon-user'>
                  <FontAwesomeIcon icon={faTrash} />
                </button>
                <div className='admin-panel-users-container'>

                  <div className='admin-panel-users-options'>
                    <div style={{display: 'flex'}}>
                      <p style={{ marginRight: '10px' }}>Message: </p>
                      <p style={{ fontFamily: 'Arial, sans-serif' }}>{user.message}</p>
                    </div>
                    <textarea
                      // value={editingMessage[user.username] || user.message}
                      onChange={(e) => handleEditMessage(user.username, e.target.value)}
                      placeholder="Enter Message for User"
                    />
                    <button onClick={() => handleUpdateUser(user.username)}>Update message</button>
                  </div>

                  <div className='admin-panel-users-options'>
                    <input
                      type="text"
                      value={newNameSurname}
                      onChange={(e) => setNewNameSurname(e.target.value)}
                      placeholder="New guest"
                      style={{marginBottom: '2px', marginTop: '4px'}}
                    />
                    <button onClick={() => handleAddNameSurname(user.username)}>Add guest</button>
                  </div>

                  <div>
                    <ul>
                      {nameSurnames
                        .filter((ns) => ns.user_username === user.username)
                        .map((ns) => (
                          <li key={ns.id}>
                            {ns.name_surname}
                            <button onClick={() => handleDeleteNameSurname(ns.name_surname)} className='trash-icon-guest'>
                              <FontAwesomeIcon icon={faTrash} />
                            </button>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-panel add-user">
        <h3 id="section-add-user" style={{marginBottom: '25px', whiteSpace: 'nowrap'}}>Add New User</h3>
        <input
          type="text"
          placeholder="Username"
          value={newUser.username}
          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          style={{width: '20%', minWidth: '150px'}}
        />
        <input
          type="text"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          style={{width: '20%', minWidth: '150px'}}
        />
        <button onClick={handleAddUser} style={{margin: '0 auto'}}>Add User</button>
      </div>
    
      {/* <div className="admin-panel">
        <h3 id="section-fulfilled-forms">Fulfilled forms</h3>
        <ul>
          {formResponses.map((response) => (
            <li key={response.name_surname + response.user_username}>
              <div>
                <strong>User: {response.user_username}</strong>
                <p>Name Surname: {response.name_surname}</p>
                <p>Accepted: {response.accepted ? 'Yes' : 'No'}</p>
                {response.accepted && (
                  <>
                    <p>Menu Option: {response.menu_option}</p>
                    <p>Allergies: {response.allergies}</p>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div> */}
      <div className="admin-panel">
        <h3 id="section-fulfilled-forms">Fulfilled forms</h3>
        <ul>
          {Object.entries(groupedResponses).map(([username, nameGroups]) => (
            <li key={username}>
              <strong style={{marginBottom:'20px', display: 'block'}}>{username}</strong>
              {Object.entries(nameGroups).map(([nameSurname, responses]) => (
                <div key={nameSurname}>
                  <h4 style={{marginLeft:'1rem', marginTop:'1rem', marginBottom: '0.7rem', display: 'block'}}>{nameSurname}</h4>
                  <ul>
                    {responses.map((response) => (
                      <li key={response.name_surname + response.user_username}
                          style={{width:'80%', margin: '0 auto'}}>
                        <p style={{margin: '5px'}}>
                          Accepted:  
                          {response.accepted === null ? 'Not responded' : response.accepted ? ' Accepted' : ' Declined'}
                        </p>
                        {response.accepted && (
                          <>
                            <p style={{margin: '5px'}}>Menu Option: {response.menu_option}</p>
                            <p style={{margin: '5px'}}>Allergies: {response.allergies}</p>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </li>
          ))}
        </ul>
      </div>
      

      {/* <div className="admin-panel">
        <h3 id="section-recieved-comments">Recieved comments</h3>
        <ul>
          {comments.map((comment) => (
            <li key={comment.user_username + comment.comment}>
              <div>
                <strong>User: {comment.user_username}</strong>
                <p>{comment.comment}</p>
              </div>
            </li>
          ))}
        </ul>
      </div> */}

      <div className="admin-panel">
        <h3 id="section-recieved-comments">Received comments</h3>
        <ul>
          {Object.entries(groupedComments).map(([username, userComments]) => (
            <li key={username}>
              <div>
                <strong style={{marginBottom:'20px', display: 'block'}}>{username}</strong>
                <ul style={{width:'80%', margin: '0 auto'}}>
                  {userComments.map((userComment, index) => (
                    <li key={index}>{userComment}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ul>
      </div>
      
    </div>
  );
};

export default Admin;
