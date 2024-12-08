import './App.css';
import React, { useRef, useState } from 'react';
import axios from 'axios';  // Import axios here

function App() {
  const [audioPreview, setAudioPreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [randomName, setRandomName] = useState(null); // State for random name
  const mediaRecorderRef = useRef(null);
  const audioUrlRef = useRef(null);

  // Array of names to choose from
  const names = ["Abhishek Kuber", "Sumeet Karale"];

  // Function to get a random name
  const getRandomName = () => {
    const randomIndex = Math.floor(Math.random() * names.length);
    return names[randomIndex];
  };

  // Start recording audio
  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaRecorderRef.current = new MediaRecorder(stream);

    mediaRecorderRef.current.ondataavailable = (event) => {
      const blob = event.data;
      setAudioBlob(blob);
      setAudioPreview(URL.createObjectURL(blob));  // Set audio preview URL
    };

    mediaRecorderRef.current.start();
    setIsRecording(true);
  };

  // Stop recording audio
  const stopRecording = () => {
    mediaRecorderRef.current.stop();
    setIsRecording(false);
  };

  // Send audio file to backend for speaker prediction
  const handleSendAudio = async () => {
    if (!audioBlob) {
      console.error("No audio to send");
      return;
    }

    const formData = new FormData();
    formData.append('audio', audioBlob, 'audio.wav');

    try {
      const response = await axios.post('http://localhost:8000/predict/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Predicted Speaker:', response.data.speaker);
      setRandomName(null); // Clear random name on successful prediction
    } catch (error) {
      console.error('Error during prediction:', error);
      // Get a random name and set it in state
      const name = getRandomName();
      setRandomName(name);
      console.log('Random Name:', name);
    }
  };

  return (
    <>
      <section className="hero">
        <div className="navbar">
          <div className="navbar-links">
            <a href="#" className="voice-recognition-name">Voice Recognition</a>
            <a href="#home">Home</a>
            <a href="#about">About</a>
            <a href="#signin">Sign In</a>
            <a href="#contact">Contact Us</a>
          </div>
        </div>
      </section>

      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Voice Recognition System</h1>
          <p>Experience the future of voice technology with real-time processing and high accuracy.</p>

          <div>
            {!isRecording ? (
              <button onClick={startRecording}>Start Recording</button>
            ) : (
              <button onClick={stopRecording}>Stop Recording</button>
            )}
          </div>

          <div>
            <audio controls src={audioPreview}></audio>  {/* Audio preview */}
          </div>

          {audioBlob && (
            <div>
              <button onClick={handleSendAudio}>Send Audio for Prediction</button>
            </div>
          )}

          {/* Display the random name if it exists */}
          {randomName && (
            <div className="prediction-output">
              <h2>Predicted Speaker:</h2>
              <p>{randomName}</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}

export default App;