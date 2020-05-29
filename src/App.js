import React, { useState, useEffect } from "react";
import "./App.css";
import ReactHtmlParser from "react-html-parser";
import Timer from "./components/Timer";
import sentences from "./configs/sentences";

function splitPara(paraText) {
  var paragraph = paraText.split(" ");
  paraText = "";
  var counter = 0;
  paragraph.forEach((word, index) => {
    paraText += `<span id='${counter}'>` + word + `</span>`;
    paraText += `<span id='${counter + 1}'>` + `&nbsp;` + `</span>`;
    counter += 2;
  });
  paraText = "<p>" + paraText + "</p>";
  return ReactHtmlParser(paraText);
}

function getNumberOfWords(string) {
  return string.split(" ").length;
}

function getRandomNumber(ll, ul) {
  return Math.floor(Math.random() * ul + ll);
}

function calculateSpeed(misspelledWords, totalNumberOfWords, time) {
  console.log(misspelledWords, totalNumberOfWords, time);
  return Math.round(
    parseInt(parseInt(totalNumberOfWords) - parseInt(misspelledWords)) /
      (time / 60)
  );
}

function calculateAccuracy(misspelledWords, totalNumberOfWords) {
  console.log(misspelledWords, totalNumberOfWords);
  return Math.round(
    ((parseInt(totalNumberOfWords) - parseInt(misspelledWords)) /
      parseInt(totalNumberOfWords)) *
      100
  );
}

export default function App() {
  const [para, ChangePara] = useState(
    sentences[getRandomNumber(0, sentences.length)]
  );
  const [typedText, changeTypedText] = useState("");
  const [actualText, changeActualText] = useState(splitPara(para));
  const [cursor, changeCursor] = useState(0);
  const [keyCode, changeKeyCode] = useState(0);
  const [wordIndex, changeWordIndex] = useState(0);
  const [typing, startedTyping] = useState(false);
  const [endedTyping, endTyping] = useState(false);
  const [timeSpent, updateTimeSpent] = useState(0);
  const [misspelledWords, addMisspelledWords] = useState([]);
  const [totalNumberOfWords, changeTotalNumberOfWords] = useState(
    getNumberOfWords(para)
  );
  const [typingSpeed, updateTypingSpeed] = useState(0);
  const [accuracy, updateAccuracy] = useState(0);

  function traceKey(event) {
    changeKeyCode(event.keyCode);
  }

  function clearInput() {
    changeTypedText("");
  }

  useEffect(() => {
    if (typing || endedTyping) {
      console.log("Typing has ended");
      updateTypingSpeed(
        calculateSpeed(misspelledWords.length, totalNumberOfWords, timeSpent)
      );
      updateAccuracy(
        calculateAccuracy(misspelledWords.length, totalNumberOfWords)
      );
    }
  });

  function traceChange(event) {
    var text = event.target.value;
    var actualText = para.split(" ");
    var currentWord = actualText[cursor];

    if (cursor < actualText.length && text !== " ") {
      document.getElementById(wordIndex).style.backgroundColor = "#E2E2E2";
      if (wordIndex > 1) {
        document.getElementById(wordIndex - 2).style.backgroundColor = "white";
      }
      startedTyping(true);
      endTyping(false);
      if (keyCode == 32) {
        console.log(text);
        if (text.trim() == currentWord.substring(0, text.length)) {
          document.getElementById(wordIndex).style.color = "green";
        } else {
          document.getElementById(wordIndex).style.color = "red";
          addMisspelledWords([...misspelledWords, currentWord]);
        }
        changeWordIndex((wordIndex) => wordIndex + 2);
        clearInput();
        console.log("cursor" + cursor);
        changeCursor(cursor + 1);
      } else {
        console.log("current Word = " + currentWord);
        if (text !== currentWord.substring(0, text.length)) {
          console.log("WRONG");
          document.getElementById(wordIndex).style.color = "red";
        } else {
          document.getElementById(wordIndex).style.color = "green";
        }
        changeTypedText(text);
      }
    }

    if (cursor == actualText.length - 1) {
      startedTyping((typing) => false);
      endTyping(true);
    }
  }

  return (
    <div className="App">
      {actualText}
      <input
        id="type-box"
        type="text"
        value={typedText}
        onChange={traceChange}
        onKeyDown={traceKey}
      />
      <br></br>
      <br></br>
      Timer: &nbsp;
      {typing ? (
        <Timer
          startTimer={typing}
          callback={(spentTime) => {
            updateTimeSpent(spentTime);
            console.log("Time spent = " + spentTime);
          }}
        />
      ) : (
        <>{timeSpent}</>
      )}
      <p>Speed: {typingSpeed} &nbsp; wpm</p>
      <p>Accuracy: {accuracy}%</p>
    </div>
  );
}
