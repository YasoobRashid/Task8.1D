import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { db, storage } from './firebase';
import { collection, addDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import FindQuestions from './FindQuestion';
import './App.css';

function Home() {
  const [postType, setPostType] = useState('question');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [abstract, setAbstract] = useState('');
  const [image, setImage] = useState(null);
  const [isPosting, setIsPosting] = useState(false);

  const handleImageUpload = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsPosting(true);

    let imageUrl = '';
    if (image) {
      const storageRef = ref(storage, `images/${image.name}`);
      const uploadTask = uploadBytesResumable(storageRef, image);

      await uploadTask;
      imageUrl = await getDownloadURL(storageRef);
    }

    try {
      await addDoc(collection(db, 'posts'), {
        postType,
        title,
        description,
        tags,
        abstract,
        imageUrl,
        createdAt: new Date(),
      });
      alert('Post submitted!');
    } catch (error) {
      console.error('Error adding document: ', error);
    } finally {
      setIsPosting(false);
      setTitle('');
      setDescription('');
      setTags('');
      setAbstract('');
      setImage(null);
    }
  };

  return (
    <div className="App">
      <h1>Create a New Post</h1>
      <form onSubmit={handleSubmit}>
        <div className="post-type">
          <label>Select Post Type: </label>
          <div className="post-type-options">
            <input
              type="radio"
              value="question"
              checked={postType === 'question'}
              onChange={() => setPostType('question')}
            />
            <label>Question</label>
            <input
              type="radio"
              value="article"
              checked={postType === 'article'}
              onChange={() => setPostType('article')}
            />
            <label>Article</label>
          </div>
        </div>

        <div className="form-group">
          <label>Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        {postType === 'article' && (
          <>
            <div className="form-group">
              <label>Abstract</label>
              <textarea
                value={abstract}
                onChange={(e) => setAbstract(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label>Image</label>
              <input type="file" onChange={handleImageUpload} />
            </div>
          </>
        )}

        <div className="form-group">
          <label>Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label>Tags</label>
          <input
            type="text"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={isPosting}>
          {isPosting ? 'Posting...' : 'Post'}
        </button>
      </form>
    </div>
  );
}

function App() {
  return (
    <Router>
      <nav className="navbar">
        <div className="navbar-brand">My Post App</div>
        <div className="nav-links">
          <Link className="nav-item" to="/">Home</Link>
          <Link className="nav-item" to="/find-questions">Find Questions</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/find-questions" element={<FindQuestions />} />
      </Routes>
    </Router>
  );
}

export default App;
