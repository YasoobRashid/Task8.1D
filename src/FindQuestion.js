import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

function FindQuestions() {
  const [questions, setQuestions] = useState([]);
  const [filter, setFilter] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState(null); 

  useEffect(() => {
    const fetchQuestions = async () => {
      const querySnapshot = await getDocs(collection(db, 'posts'));
      setQuestions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchQuestions();
  }, []);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, 'posts', id));
    setQuestions(questions.filter(q => q.id !== id));
  };

  const toggleExpand = (id) => {
    setExpandedQuestionId(expandedQuestionId === id ? null : id); 
  };

  const filteredQuestions = questions.filter(q =>
    q.title.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div>
      <h1>Find Questions</h1>
      <input
        type="text"
        placeholder="Filter by title"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
      />
      <ul>
        {filteredQuestions.map(question => (
          <li key={question.id}>
            <div onClick={() => toggleExpand(question.id)}>
              <h3>{question.title}</h3>
              <p>{question.description}</p>
              {expandedQuestionId === question.id && (
                <div>
                  <p><strong>Tags:</strong> {question.tags}</p>
                  {question.abstract && <p><strong>Abstract:</strong> {question.abstract}</p>}
                  {question.imageUrl && (
                    <img src={question.imageUrl} alt="Post visual" style={{ maxWidth: '200px' }} />
                  )}
                  <p><strong>Posted on:</strong> {question.createdAt?.toDate().toDateString()}</p>
                  <button onClick={() => handleDelete(question.id)}>Delete</button>
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default FindQuestions;
