import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [classrooms, setClassrooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClassrooms = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/classrooms');
        setClassrooms(response.data);
      } catch (error) {
        console.error("Feil ved henting av klasserom:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClassrooms();
  }, []);

  if (loading) {
    return <div>Laster inn klasserom...</div>;
  }

  return (
    <div>
      <h1>Klasseromoversikt</h1>
      <ul>
        {classrooms.map(classroom => (
          <li key={classroom.id}>
            {classroom.name}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;