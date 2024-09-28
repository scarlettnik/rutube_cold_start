import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
const interestsList = [
  'Спорт',
  'Музыка',
  'Искусство',
  'Технологии',
  'Путешествия',
  'Кулинария',
  'Чтение',
  'Фотография',
  'Наука',
  'Фильмы',
];

const PreInterests = ({ onClose }) => {
  const [selectedInterests, setSelectedInterests] = useState([]);

  useEffect(() => {
    const savedInterests = Cookies.get('interests');
    if (savedInterests) {
      console.log('Сохраненные интересы:', JSON.parse(savedInterests));
    }
  }, []);

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) => {
      const isSelected = prev.includes(interest);
      const newInterests = isSelected
        ? prev.filter((i) => i !== interest)
        : [...prev, interest];
      console.log('Текущие интересы:', newInterests);
      return newInterests;
    });
  };

  const saveInterests = () => {
    Cookies.set('interests', JSON.stringify(selectedInterests), { expires: 7 });
    console.log('sssssss')
    onClose();

  };

  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>Выберите ваши интересы</h1>
      <ul style={{ listStyleType: 'none', padding: 0 }}>
        {interestsList.map((interest) => (
          <li key={interest}>
            <button
              onClick={() => toggleInterest(interest)}
              style={{
                padding: '10px 20px',
                margin: '5px',
                backgroundColor: selectedInterests.includes(interest) ? 'lightblue' : 'lightgray',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
            >
              {interest}
            </button>
          </li>
        ))}
      </ul>
      <button onClick={saveInterests} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Сохранить интересы
      </button>
    </div>
  );
};

export default PreInterests;