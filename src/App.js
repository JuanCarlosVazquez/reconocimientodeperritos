
import React, { useState, useRef, useReducer } from "react";
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from "@tensorflow-models/mobilenet";
import './App.css';

const machine = {
  initial: "initial",
  states: {
    initial: { on: { next: "loadingModel" } },
    loadingModel: { on: { next: "modelReady" } },
    modelReady: { on: { next: "imageReady" } },
    imageReady: { on: { next: "identifying" }, showImage: true },
    identifying: { on: { next: "complete" } },
    complete: { on: { next: "modelReady" }, showImage: true, showResults: true }
  }
};

const reducer = (state, event) => machine.states[state].on[event] || machine.initial;

const formatResult = ({className, probability }) => (
  <li >
      { `${className}: %${ (probability * 100).toFixed(2)  }` }
  </li>

);



function App() {

  const [statito, dispatch] = useReducer(reducer, machine.initial);
  const [model, setModel] = useState(null);
  const [results, setResults] = useState([]);
  const imageRef = useRef();
  const inputRef = useRef();
  const [imageURL, setImageURL] = useState(null);

  const next = () => dispatch('next');


  const identify = async () => {
    next();
    const clasificationresults = await model.classify(imageRef.current);
    setResults(clasificationresults);
    next();
  };
  const reset = async () => {
    setResults([]);
    setImageURL(null);
    next();
  };
  const loadModel = async () => {
    next();
    const model = await mobilenet.load();
    setModel(model);
    next();
  };
   
  //const upload = () => inputRef.current.click();
  const actionButton = {
    initial: { action: loadModel, text: "Load Model" },
    loadingModel: { text: "Loading Model..." },
    modelReady: {  text: "Upload Image", action: () => inputRef.current.click() },
    imageReady: { text: "Identify Breed", action: identify },
    identifying: { text: "Identifying..." },
    complete: { text: "Reset", action: reset },
  };

  
  const { showImage = false, showResults = false } = machine.states[statito];

  const handleUpload = event => {
    const { files } = event.target;
    if (files.length > 0) {
      const url = URL.createObjectURL(event.target.files[0]);
      setImageURL(url);
      next();
    }
  };

  
  return (
    <div >



      {showImage && <img src={imageURL} alt="upload-preview" ref={imageRef} />}   
      {showResults &&<ul>
        {results.map(formatResult)}

      </ul>}


      <input
            type="file"
            accept="image/*"
            capture="camera"
            onChange={handleUpload}
            ref={inputRef}
      />

      <button onClick={ actionButton[statito].action}> 
            {actionButton[statito].text}    
      </button>


    </div>
  );
}

export default App;
