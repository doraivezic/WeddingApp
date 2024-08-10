import React, { useState, useEffect } from 'react';

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
        const response = await fetch('/api/users');
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
        const response = await fetch('/api/namesurnames');
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
        const response = await fetch('/api/form_responses');
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
        const response = await fetch('/api/comments');
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
      const response = await fetch('/api/namesurnames', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_username: username, name_surname: newNameSurname }),
      });
      if (response.ok) {
        const newNameSurnameObj = await response.json();
        setNameSurnames((prev) => [...prev, newNameSurnameObj]);
        setNewNameSurname('');
      } else {
        console.error('Error adding name_surname:', response.error);
      }
    } catch (error) {
      console.error('Error adding name_surname:', error);
    }
  };

  const handleDeleteNameSurname = async (id) => {
    try {
      const response = await fetch(`/api/namesurnames/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setNameSurnames((prev) => prev.filter((ns) => ns.id !== id));
      } else {
        console.error('Error deleting name_surname:', response.error);
      }
    } catch (error) {
      console.error('Error deleting name_surname:', error);
    }
  };

  const handleEditMessage = (username, message) => {
    setEditingMessage((prev) => ({ ...prev, [username]: message }));
  };

  const handleUpdateUser = async (username) => {
    try {
      const response = await fetch(`/api/users/${username}`, {
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
      const response = await fetch('/api/users', {
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
        const response = await fetch(`/api/users/${username}`, {
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

  return (
    <div className="admin-container">
      <div className="admin-panel">
        <h2>Admin Panel</h2>
        <h3>Manage Users</h3>
        <ul>
          {users.map((user) => (
            <li key={user.username}>
              <div>
                <strong>{user.username}</strong>
                <div>
                  <p>Message: {user.message}</p>
                  <textarea
                    value={editingMessage[user.username] || user.message}
                    onChange={(e) => handleEditMessage(user.username, e.target.value)}
                    placeholder="Update Message"
                  />
                  <button onClick={() => handleUpdateUser(user.username)}>Enter</button>
                  <button onClick={() => handleDeleteUser(user.username)}>Remove User</button>
                  <div>
                    <input
                      type="text"
                      value={newNameSurname}
                      onChange={(e) => setNewNameSurname(e.target.value)}
                      placeholder="Name Surname"
                    />
                    <button onClick={() => handleAddNameSurname(user.username)}>Add Name Surname</button>
                    <ul>
                      {nameSurnames
                        .filter((ns) => ns.user_username === user.username)
                        .map((ns) => (
                          <li key={ns.id}>
                            {ns.name_surname}
                            <button onClick={() => handleDeleteNameSurname(ns.id)}>Remove</button>
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
        <div>
          <h3>Add New User</h3>
          <input
            type="text"
            placeholder="Username"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
          />
          <button onClick={handleAddUser}>Add User</button>
        </div>
      </div>
      <div className="admin-panel">
        <h3>Form Responses</h3>
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
        <h3>Comments</h3>
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
      </div>
    </div>
  );
};

export default Admin;
