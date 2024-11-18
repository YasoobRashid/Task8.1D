import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

function FindQuestions() {
  const [questions, setQuestions] = useState([]);
  const [titleFilter, setTitleFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [expandedQuestionId, setExpandedQuestionId] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const questionsOnly = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((post) => post.postType === 'question');
        setQuestions(questionsOnly);
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

  // Filter by title, date, and tag
  const filteredQuestions = questions.filter(q => {
    const matchesTitle = q.title.toLowerCase().includes(titleFilter.toLowerCase());
    const matchesDate = dateFilter ? new Date(q.createdAt?.toDate()).toDateString() === new Date(dateFilter).toDateString() : true;
    const matchesTag = q.tags.toLowerCase().includes(tagFilter.toLowerCase());
    
    return matchesTitle && matchesDate && matchesTag;
  });

  return (
    <div>
      <h1>Find Questions</h1>
      
      <div className="filters">
        <input
          type="text"
          placeholder="Filter by title"
          value={titleFilter}
          onChange={(e) => setTitleFilter(e.target.value)}
        />
        
        <input
          type="date"
          placeholder="Filter by date"
          value={dateFilter}
          onChange={(e) => setDateFilter(e.target.value)}
        />

        <input
          type="text"
          placeholder="Filter by tag"
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
        />
      </div>

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
