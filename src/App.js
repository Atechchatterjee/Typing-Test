import React, { useState, useEffect } from "react";
import ReactHtmlParser from "react-html-parser";
import Timer from "./components/Timer";
import sentences from "./configs/sentences";
import { Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import ReactSpeedometer from "react-d3-speedometer";

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
  return Math.round(
    parseInt(parseInt(totalNumberOfWords) - parseInt(misspelledWords)) /
      (time / 60)
  );
}

function calculateAccuracy(misspelledWords, totalNumberOfWords) {
  return Math.round(
    ((parseInt(totalNumberOfWords) - parseInt(misspelledWords)) /
      parseInt(totalNumberOfWords)) *
      100
  );
}

function formatTimer(time) {
  var minutes = Math.floor(time / 60).toString();
  var seconds = (time % 60).toString();
  minutes = minutes < 10 ? "0" + minutes : minutes;
  seconds = seconds < 10 ? "0" + seconds : seconds;
  return minutes + ":" + seconds;
}

export default function App() {
  const delimeters = `,./|!~''""%$:;#*(){}[]?+@&-_’`;
  const [randomSentenceNumber, changeNumber] = useState(
    getRandomNumber(0, sentences.length)
  );
  const [para, changePara] = useState(sentences[randomSentenceNumber]);
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
  const [simplified, changeSimplified] = useState(false);
  const [currentColor, changeCurrentColor] = useState("");

  const colors = ["#F7CB2C", "#48C92E", "#F26030"];

  function traceKey(event) {
    changeKeyCode(event.keyCode);
  }

  function clearInput() {
    changeTypedText("");
  }

  useEffect(() => {
    if (typing) {
      console.log(misspelledWords);
      updateTypingSpeed(
        calculateSpeed(misspelledWords.length, totalNumberOfWords, timeSpent)
      );
    }
    updateAccuracy(
      calculateAccuracy(misspelledWords.length, totalNumberOfWords)
    );
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
      if (!endedTyping) {
        startedTyping(true);
      }
      endTyping(false);
      if (keyCode == 32) {
        // hit whitespace
        if (cursor == actualText.length - 1) {
          startedTyping((typing) => false);
          endTyping(true);
        }
        if (text.trim() == currentWord.substring(0, text.length)) {
          document.getElementById(wordIndex).style.color = "green";
        } else {
          document.getElementById(wordIndex).style.color = "red";
          addMisspelledWords([...misspelledWords, currentWord]);
          console.log("WRONG : " + currentWord);
        }
        changeWordIndex((wordIndex) => wordIndex + 2);
        clearInput();
        changeCursor(cursor + 1);
      } else {
        // checking while typing
        if (text !== currentWord.substring(0, text.length)) {
          document.getElementById(wordIndex).style.color = "red";
        } else {
          document.getElementById(wordIndex).style.color = "green";
        }
        changeTypedText(text);
      }
    }
  }

  function simplifyPara() {
    var simplifiedPara = "";
    if (!simplified) {
      for (var i = 0; i < para.length; i++)
        if (delimeters.indexOf(para.charAt(i)) == -1)
          simplifiedPara += para.charAt(i).toLowerCase();

      changePara(simplifiedPara);
      changeActualText(splitPara(simplifiedPara));
      changeSimplified(true);
    } else {
      changePara(sentences[randomSentenceNumber]);
      changeActualText(splitPara(sentences[randomSentenceNumber]));
      changeSimplified(false);
    }
  }

  return (
    <>
      <span className="Timer">
        {typing ? (
          <Timer
            startTimer={typing}
            callback={(spentTime) => {
              updateTimeSpent(spentTime);
              console.log("Time spent = " + spentTime);
            }}
          />
        ) : (
          <>{timeSpent == 0 ? "00:00" : formatTimer(timeSpent)}</>
        )}
      </span>
      <div className="type-area">
        {actualText}
        <Form.Control
          id="type-box"
          type="text"
          value={typedText}
          onChange={traceChange}
          onKeyDown={traceKey}
        />
        <Button
          variant="outline-primary"
          className="simplify"
          onClick={simplifyPara}
        >
          {simplified ? "Simplified" : "Simplify"}
        </Button>{" "}
      </div>
      <br></br>
      <br></br>
      <div className="speedometers">
        <ReactSpeedometer
          minValue={0}
          maxValue={220}
          segments={3}
          customSegmentStops={[0, 20, 60, 220]}
          segmentColors={colors}
          width={350}
          ringWidth={25}
          value={typingSpeed == Infinity || typingSpeed > 220 ? 0 : typingSpeed}
          paddingHorizontal={250}
        />
        <span className="accuracy">
          <ReactSpeedometer
            minValue={0}
            maxValue={100}
            segments={1}
            width={350}
            ringWidth={25}
            value={accuracy}
            paddingVertical={5}
          />
        </span>
      </div>
    </>
  );
}
