import React, { useEffect, useState } from 'react';
import '../global_old.css';

const GuestList = () => {
  const [guests, setGuests] = useState([]);
  const apiUrl = process.env.REACT_APP_API_URL || '';

  useEffect(() => {
    const fetchGuests = async () => {
      const response = await fetch(`${apiUrl}/api/guests`);
      const data = await response.json();
      setGuests(data);
    };

    fetchGuests();
  }, []);

  return (
    <div>
      <h2>Guest List</h2>
      <ul className="list">
        {guests.map(guest => (
          <li className="list-item" key={guest.id}>
            <div className="guest-details">
              {guest.photo && <img className="guest-image" src={`/uploads/${guest.photo}`} alt={guest.name} />}
              <div>
                <strong>{guest.name}</strong> - {guest.message} (Menu Choice: {guest.menu_choice})
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default GuestList;
