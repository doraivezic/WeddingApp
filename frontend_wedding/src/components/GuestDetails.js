import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { NotificationContext } from '../contexts/NotificationContext';
import {LanguageContext} from "../contexts/LanguageContext";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWhatsapp } from '@fortawesome/free-brands-svg-icons'; // Import WhatsApp icon

const apiUrl = process.env.REACT_APP_API_URL || '';

const GuestDetails = () => {
  const { userUsername } = useContext(AuthContext);
  const { language } = useContext(LanguageContext);
  const [responses, setResponses] = useState([]);
  // const [nameSurnames, setNameSurnames] = useState([]);
  const [comment, setComment] = useState('');
  const [showCommentSection, setShowCommentSection] = useState(false);
  const [userMessage, setUserMessage] = useState('');
  const { showNotification } = useContext(NotificationContext);

  const UserMessage = ({ message }) => {
    const [displayedText, setDisplayedText] = useState('');

    useEffect(() => {
      if (!message) {
        setDisplayedText(''); // Reset if message is undefined or null
        return;
      }

      let index = 0;
      const characters = message.split(''); // Split the message into characters
      const interval = setInterval(() => {
        if (index < characters.length-1) {
          setDisplayedText((prev) => prev + characters[index]);
          index++;
        } else {
          clearInterval(interval);
        }
      }, 50); // Adjust the speed of typing here

      return () => clearInterval(interval);
    }, [message]);

    return (
      <p className="user-message">
        {displayedText.split('\n').map((line, i) => (
          <span key={i}>{line}<br />
          </span>
        ))}
      </p>
    );
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/users/${userUsername}`);
        const data = await response.json();
        if (response.ok) {
          setUserMessage(data.message);
          // console.log('Ispisujem message')  //Called many times, cannot remove it
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
        // First fetch name surnames
        const nameSurnameResponse = await fetch(`${apiUrl}/api/name_surnames/${userUsername}`);
        const nameSurnameData = await nameSurnameResponse.json();
        
        // Then fetch form responses
        const formResponse = await fetch(`${apiUrl}/api/form_responses/${userUsername}`);
        const formData = await formResponse.json();

        if (nameSurnameResponse.ok) {
          // Create initial responses from name surnames
          const initialResponses = nameSurnameData.map(ns => ({
            name_surname: ns.name_surname,
            user_username: userUsername,
            accepted: null,
            menu_option: '',
            allergies: '',
            comment: ''
          }));

          // If form responses exist, merge them with initial responses
          if (formResponse.ok) {
            const updatedResponses = initialResponses.map(initial => {
              const existingResponse = formData.find(r => r.name_surname === initial.name_surname);
              return existingResponse ? { ...initial, ...existingResponse } : initial;
            });
            setResponses(updatedResponses);
            
            const hasAccepted = updatedResponses.some(response => response.accepted);
            setShowCommentSection(hasAccepted);
          } else {
            setResponses(initialResponses);
          }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchNameSurnamesAndInitializeResponses();
  }, [userUsername]);

  useEffect(() => {
    const fetchFormResponses = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/form_responses/${userUsername}`);
        const data = await response.json();
        if (response.ok) {
          setResponses(prevResponses => {
            // Merge existing responses with fetched responses
            const updatedResponses = prevResponses.map(prev => {
              const existingResponse = data.find(r => r.name_surname === prev.name_surname);
              // return existingResponse || prev;
              return existingResponse ? { ...prev, ...existingResponse } : prev;
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
      fetch(`${apiUrl}/api/form_responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...response, user_username: userUsername }),
      })
    );

    Promise.all(promises)
    .then(results => {
      const jsonPromises = results.map(result =>
        result.ok ? null : result.json() // Parse JSON only for failed requests
      );

      return Promise.all(jsonPromises).then(errors => ({
        results,
        errors,
      }));
    })
    .then(({ results, errors }) => {
      if (results.every(result => result.ok)) {
        showNotification('success','Changes updated successfully!');
        const hasAccepted = responses.some(response => response.accepted);
        setShowCommentSection(hasAccepted);
      } else {
        const errorMessages = errors
          .filter(error => error) // Filter out null values (successful responses)
          .map(error => error.error || 'Unknown error'); // Extract error message
        showNotification('error', `Unable to update changes:\n${errorMessages[0]}`);
      }
    })
    .catch(err => {
      console.error('Unexpected error:', err);
      showNotification('error', 'An unexpected error occurred.');
    });
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch(`${apiUrl}/api/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_username: userUsername, comment }),
    });

    if (response.ok) {
      showNotification('success', 'Comment submitted successfully!');
      setComment('');
    } else {
      showNotification('error', 'Error submitting comment');
    }
  };

  const handleResponseChange = (index, field, value) => {
    const newResponses = [...responses];
    newResponses[index][field] = value;
    setResponses(newResponses);
  };

  // const getToggleState = (response) => {
  //   if (response.accepted === null) {
  //     return { label: language === 'en' ? 'Accept invitation' : 'Potvrdi dolazak', color: 'gray', checked: false };
  //   } else if (response.accepted === false) {
  //     return { label: 'Declined', color: 'red', checked: false };
  //   } else {
  //     return { label: language === 'en' ? 'Accepted' : 'Dolazim', color: 'green', checked: true };
  //   }
  // };

  // const handleToggleChange = (index, newValue) => {
  //   handleResponseChange(index, 'accepted', newValue);
  // };

  return (
      <>
        <div className="background-image" style={{minWidth: '300px', position: 'relative'}}>
          <div className="hero-text">
            <h1>Dora & Marin</h1>
            <p style={{fontSize: '1.1rem', fontFamily: 'Raleway', color: 'rgb(100, 95, 92)'}}>01.03.2025.</p>
            <div style={{width: 'fit-content', margin: '0 auto', fontSize: '1rem'}}>
              {/* {userMessage &&
                <p className='user-message'>
                  {userMessage}
                </p>
              } */}
              {/*{userMessage &&*/}
              {/*    <UserMessage message={userMessage}/>*/}
              {/*}*/}
              {/* {userMessage}*/}
            </div>
          </div>
          <div className="separator" style={{minWidth: '300px'}}></div>
        </div>

        <div className="quote-container" style={{minWidth: '300px'}}>
          <div className="quote-text">
          <p className="drop-effect">
            U Tvoje ruke stavljamo sve na dar,<br/>
            sve svoje dane, ljubavi i planove.<br/>
            Nova obitelj tu nastaje pred Tobom.<br/>
            Ti čuvaj, vodi je!<br/>
          </p>

          </div>
        </div>


        <table className="event-table">

          <tr>
            <td className="event-content">
              <h3 className='table-event-name'>{language === 'en' ? 'Gathering' : 'Okupljanje'}</h3>
              <div className="time-line left-time-line">
                <div className="time">12:00</div>
                <div className="line"></div>
              </div>
              <p className='table-location-exact'>
                Marina Punat
                <p style={{fontWeight: '100', marginBottom: '0', marginTop: '4px'}}>Punat, Krk</p>
              </p>
              <a href="https://www.google.com/maps/search/?api=1&query=Mairna,Punat,d.o.o.,+Krk"
                 target="_blank" rel="noreferrer" style={{textDecoration: 'none'}}>
                <button style={{width: '7rem'}}>{language === 'en' ? 'Show on map' : 'Prikaži na karti'}</button>
              </a>
            </td>
            <td className="icon" style={{paddingLeft: '10px'}}>
              <img src='/cocktail-icon.svg' alt="Cocktail"/>
            </td>
          </tr>

          <tr>
            <td className="icon" style={{paddingLeft: '10px'}}>
              <img src='/boat-icon.svg' alt="Boat"/>
            </td>
            <td className="event-content">
              <h3 className='table-event-name'>{language === 'en' ? 'Boat ride' : 'Vožnja brodom'}</h3>
              <div className="time-line right-time-line">
                <div className="line"></div>
                <div className="time">12:30</div>
              </div>
              <p className='table-location-exact'>
                Marina Punat
                <p style={{fontWeight: '100', marginBottom: '0', marginTop: '4px'}}>Punat, Krk</p>
              </p>
              <a href="https://www.google.com/maps/search/?api=1&query=Mairna,Punat,d.o.o.,+Krk"
                 target="_blank" rel="noreferrer" style={{textDecoration: 'none'}}>
                <button style={{width: '7rem'}}>{language === 'en' ? 'Show on map' : 'Prikaži na karti'}</button>
              </a>
            </td>
          </tr>

          <tr>
            <td className="event-content">
              <h3 className='table-event-name'>{language === 'en' ? 'Church Wedding' : 'Vjenčanje'}</h3>
              <div className="time-line left-time-line">
                <div className="time">13:00</div>
                <div className="line"></div>
              </div>
              <p className='table-location-exact'>
                Crkva navještenja Marijina
                <p style={{fontWeight: '100', marginBottom: '0', marginTop: '4px'}}>Otok Košljun</p>
              </p>
              <a href="https://www.google.com/maps/search/?api=1&query=Franjevacki,samostan,Navjestenja,Marijina,+Krk"
                 target="_blank" rel="noreferrer" style={{textDecoration: 'none'}}>
                <button style={{width: '7rem'}}>{language === 'en' ? 'Show on map' : 'Prikaži na karti'}</button>
              </a>
            </td>
            <td className="icon" style={{paddingRight: '10px'}}>
              <img src='/ring-icon.svg' alt="Rings" style={{transform: 'rotate(-45deg)'}}/>
            </td>
          </tr>

          <tr>
            <td className="icon" style={{paddingLeft: '10px'}}>
              <img src='/restaurant-icon.svg' alt="Dinner"/>
            </td>
            <td className="event-content">
              <h3 className='table-event-name'>{language === 'en' ? 'Dinner' : 'Svečana večera'}</h3>
              <div className="time-line right-time-line">
                <div className="line"></div>
                <div className="time">15:00</div>
              </div>
              <p className='table-location-exact'>
                Restoran Marina
                <p style={{fontWeight: '100', marginBottom: '0', marginTop: '4px'}}>Punat, Krk</p>
              </p>
              <a href="https://www.google.com/maps/search/?api=1&query=Restoran+Marina,+Punat" target="_blank"
                 rel="noreferrer" style={{textDecoration: 'none'}}>
                <button style={{width: '7rem'}}>{language === 'en' ? 'Show on map' : 'Prikaži na karti'}</button>
              </a>
            </td>
          </tr>

        </table>

        {/*
      <div className="timeline">

        <div className="event left">
          <div className="time">15:30</div>
          <div className="icon"><img src='/cocktail-icon.png' alt="Cocktail" /></div>
          <div className="event-content">
            <h3 style={{fontSize: '2em', transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap'}}>Okupljanje</h3>
            <p>Villa Lipa, Jesenice</p>
            <button>Vidi kartu</button>
          </div>
        </div>

        <div className="event left">
          <div className="event-content">
            <h3 style={{fontSize: '2em', whiteSpace: 'nowrap'}}>Okupljanje</h3>
            <p>Villa Lipa, Jesenice</p>
            <button>Vidi kartu</button>
          </div>
          <div className="icon"><img src='/cocktail-icon.png' alt="Cocktail" /></div>
          <div className="time">15:30</div>
        </div>
        
        <div className="event right">
          <div className="time">17:00</div>
          <div className="icon"><img src='/ring-icon.png' alt="Rings" /></div>
          <div className="event-content">
            <h3 style={{fontSize: '2em', transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap'}}>Obred vjenčanja</h3>
            <p>Crkva sv. Roka, Jesenice</p>
            <button>Vidi kartu</button>
          </div>
        </div>
        
        <div className="event left">
          <div className="time">18:30</div>
          <div className="icon"><img src='/restaurant-icon.png' alt="Dinner" /></div>
          <div className="event-content">
            <h3 style={{fontSize: '2em', transform: 'translate(-50%, -50%)', whiteSpace: 'nowrap'}}>Svečana večera</h3>
            <p>Konoba Bajso, Jesenice</p>
            <button>Vidi kartu</button>
          </div>
        </div>
                              
      </div> */}

        <div className="content-container" style={{marginTop: '80px'}}>
          <h3>{language === 'en' ? 'Dress code' : 'Dress code'}</h3>
          <div className="dress-code-container">
            <div className="dress-code-emoji-container">
              <span role="img" aria-label="suit">💃</span>
              <span role="img" aria-label="suit">🕺</span>
            </div>
            <p className="dress-code-text">
              {language === 'en' ? (
                <>
                  If possible, we kindly ask you to wear colorful attire!<br/>
                  Let's avoid dark colors and celebrate with vibrant hues<br/>
                  (But don't worry if you can't - we're just happy to have you there! ❤️)
                </>
              ) : (
                <>
                  Ako ste u mogućnosti, pozivamo vas da nosite boje!<br/>
                  Izbjegavajmo tamno i proslavimo u veselim tonovima<br/>
                  (Ali bez brige ako ne možete - najvažnije nam je da ste s nama! ❤️)
                </>
              )}
            </p>
          </div>
        </div>

        <div className="content-container" style={{maxWidth: '900px'}}>
          <h3>{language === 'en' ? 'Menu' : 'Meni'}</h3>
          <div className="menu-container">

            <div className="menu-item" >
              <h4>{language === 'en' ? 'Fish Menu' : 'Riblji  Meni'}</h4>
              <div className="fish-menu" >
                <p>Koktel od škampi, kuglica od brancina, dimljena tuna, domaći kruh</p>
                <p>•</p>
                <p> Krem juha od celera, jabuke i tartufa</p>
                <p>•</p>
                <p>File bijele ribe u škartocu sa povrćem i pave krumpirom</p>
                <p>•</p>
                <p>Šurlice sa kozicama</p>
              </div>
            </div>

            <div className="menu-item">
              <h4>{language === 'en' ? 'Meat Menu' : 'Mesni  Meni'}</h4>
              <div className="meat-menu" >
                <p>Rolica od skute i pršuta, krčka kobasicam vege tartar, selekcija sireva, pikantna salsa, domaći kruh</p>
                <p>•</p>
                <p>Krem juha od celera, jabuke i tartufa</p>
                <p>•</p>
                <p>Sporo pečena teletina sa demiglas umakom i pave krumpitom</p>
                <p>•</p>
                <p>Šurlice s gulašom</p>
              </div>
            </div>
          </div>

        </div>


        <div className="content-container">
          <h3>{language === 'en' ? 'Accept invitation' : 'Potvrdite dolazak'}</h3>
          <p className='confirm-arrival'>
            {language === 'en' ? (
                <>PLEASE CONFIRM YOUR ARRIVAL UNTIL <b>31.01.2025.</b></>
            ) : (
                <>MOLIMO POTVRDITE SVOJ DOLAZAK DO <b>31.01.2025.</b></>
            )}
          </p>
          <p className='confirm-arrival' style={{color: "gray", fontSize: '12px'}}>
            {language === 'en' ? (
                <>** THE INVITE IS FOR ADULTS ONLY (12+) **</>
            ) : (
                <>** POZIVNICA VRIJEDI SAMO ZA ODRASLE (12+) **</>
            )}
          </p>

          {responses.length > 0 && responses.map((response, index) => {

            return (
                <form key={index} onSubmit={handleUpdateChanges} className='guests-forms-container'>

                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingTop: '10px',
                    paddingBottom: '5px'
                  }}>
                    <label className='guests-forms-name'>{response.name_surname}</label>

                    <script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
                    <div className="tri-state-toggle">

                      <button
                          type="button"
                          className={`tri-state-toggle-button ${response.accepted === true ? 'active' : ''} tri-state-toggle-button-accepted`}
                          onClick={() => handleResponseChange(index, 'accepted', true)}
                      >
                        {language === 'en' ? 'ACCEPTED' : 'DOLAZIM'}
                      </button>

                      <button
                          type="button"
                          className={`tri-state-toggle-button ${response.accepted === null ? 'active' : ''} tri-state-toggle-button-noresponse`}
                          onClick={() => handleResponseChange(index, 'accepted', null)}
                      >
                        {language === 'en' ? (<>NO<br/>RESPONSE</>) : (<>BEZ<br/>ODGOVORA</>)}
                      </button>

                      <button
                          type="button"
                          className={`tri-state-toggle-button ${response.accepted === false ? 'active' : ''} tri-state-toggle-button-declined`}
                          onClick={() => handleResponseChange(index, 'accepted', false)}
                      >
                        {language === 'en' ? 'DECLINED' : (<>NE<br/>DOLAZIM</>)}
                      </button>

                    </div>

                  </div>

                  {/* Rest of the form, once the guest accepts the invite */}
                  <div className={`transition-container ${response.accepted === true ? 'show' : ''}`} style={{ margin: '0 auto'}} >
                    <label className='guest-input-menu' style={{marginTop: '20px'}}>
                      {language === 'en' ? 'MENU OPTION:' : 'ODABIR MENIJA:'}
                      <select className='select-line'
                          value={response.menu_option}
                          onChange={(e) =>
                              handleResponseChange(index, 'menu_option', e.target.value)
                          }
                          required
                          style={{
                            color: '#333333',
                            fontFamily: 'Manrope'
                          }}
                      >
                        <option value="" disabled selected>{language === 'en' ? 'Select...' : 'Odaberi...'}</option>
                        <option value="fish">{language === 'en' ? 'Fish' : 'Riblji'}</option>
                        <option value="meat">{language === 'en' ? 'Meat' : 'Mesni'}</option>
                      </select>
                    </label>

                    <label className='guest-input-menu' style={{marginBottom: '20px'}}>
                      {language === 'en' ? 'ALLERGIES:' : 'ALERGIJE:'}
                      <input
                          className='select-line'
                          // type="text"
                          value={response.allergies}
                          value={response.allergies}
                          onChange={(e) =>
                              handleResponseChange(index, 'allergies', e.target.value)
                          }
                          style={{
                            color: '#333333',
                            marginBottom: '0px',
                            fontFamily: 'Manrope'
                          }}
                      />
                    </label>
                  </div>

                </form>
            )
          })}
          {responses.length > 0 && (
              <button onClick={handleUpdateChanges} className='update-changes-button'>
                {language === 'en' ? 'Update Changes' : 'Pohrani promjene'}
              </button>
          )}
          {showCommentSection && (
              <form className='leave-message' onSubmit={handleCommentSubmit} style={{marginTop: '100px', marginBottom: '0'}}>
                <div>
                  <label style={{fontFamily: 'Hurricane', fontWeight: '400', fontSize: '30px'}}>
                    {language === 'en' ? 'Leave us a message' : 'Ostavite nam poruku'}
                    <textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                    />
                  </label>
                </div>
                <button type="submit">
                  {language === 'en' ? 'Send' : 'Pošalji'}
                </button>
              </form>
          )}
        </div>


        <footer className="footer">
          <div className="footer-content">
            <h4>{language === 'en' ? 'Contact Information' : 'Kontakt'}</h4>
            <div className="contact-container">
              <div className="contact-item">
                <p>Dora Ivezić</p>
                <p>+385 91 170 8074</p>
                <a href="https://wa.me/385911708074" target="_blank" rel="noopener noreferrer"
                   className="whatsapp-icon">
                  <FontAwesomeIcon icon={faWhatsapp} size="2x"/>
                </a>
              </div>
              <div className="contact-item">
                <p>Marin Mrakovčić</p>
                <p>+385 95 392 6794</p>
                <a href="https://wa.me/385953926794" target="_blank" rel="noopener noreferrer"
                   className="whatsapp-icon">
                  <FontAwesomeIcon icon={faWhatsapp} size="2x"/>
                </a>
              </div>
            </div>
          </div>
        </footer>
      </>
  );
};

export default GuestDetails;
