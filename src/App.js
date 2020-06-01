import React, { useState, useEffect } from "react";
import ReactHtmlParser from "react-html-parser";
import Timer from "./components/Timer";
import sentences from "./configs/sentences";
import { Button, Form } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.css";
import "./App.css";
import ReactSpeedometer from "react-d3-speedometer";
import ReactLoading from "react-loading";

function splitPara(paraText) {
  var paragraph = paraText.split(" ");
  paraText = "";
  var counter = 0;
  paragraph.forEach((word, index) => {
    paraText +=
      `<span id='${counter}' class='spans' style="color:black">` +
      word +
      `</span>`;
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
  const [toRefreshPara, changeToRefreshPara] = useState(false);
  const [toRenderText, changeToRenderText] = useState(false);

  const colors = ["#F7CB2C", "#55CC6B", "#E07362"];

  function traceKey(event) {
    changeKeyCode(event.keyCode);
  }

  function clearInput() {
    changeTypedText("");
  }

  // for loader and rendering actualText
  useEffect(() => {
    const time = setTimeout(() => {
      changeToRenderText(true);
    }, 2000);
    return () => clearTimeout(time);
  }, [toRenderText]);

  // for refresh-btn
  useEffect(() => {
    // resetting all the values
    if (toRefreshPara && !simplified) {
      (async () => {
        await changeNumber(getRandomNumber(0, sentences.length));
        await changePara(sentences[randomSentenceNumber]);
        await changeActualText(splitPara(sentences[randomSentenceNumber]));
        await changeTotalNumberOfWords(getNumberOfWords(para));
        await changeToRefreshPara(false);
        await updateTypingSpeed(0);
        await updateAccuracy(0);
        await startedTyping(false);
        await endTyping(false);
        await changeCursor(0);
        await addMisspelledWords([]);
        await updateTimeSpent(0);
        await changeWordIndex(0);
        await changeSimplified(false);
        await changeKeyCode(0);
        await changeToRenderText(false);
      })();
    }
  }, [randomSentenceNumber, toRefreshPara, simplified]);

  // for calculation of speed and accuracy
  useEffect(() => {
    console.log("Use EFFECT");
    if (typing) {
      console.log(misspelledWords);
      updateTypingSpeed(
        calculateSpeed(misspelledWords.length, totalNumberOfWords, timeSpent)
      );
    }
    updateAccuracy(
      calculateAccuracy(misspelledWords.length, totalNumberOfWords)
    );
  }, [typing, misspelledWords, totalNumberOfWords, timeSpent]);

  // main function for tracking the user's typing
  function traceChange(event) {
    var text = event.target.value;
    var actualText = para.split(" ");
    var currentWord = actualText[cursor];

    if (cursor < actualText.length && text !== " " && !toRefreshPara) {
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

  // removes delimeters and capitalisation
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

  function refreshPara() {
    if (simplified) {
      changeSimplified(false);
    }
    if (!toRefreshPara) {
      changeToRefreshPara(true);
    } else {
      changeToRefreshPara(false);
    }
  }

  function renderLoader() {
    return (
      <ReactLoading
        type={"bars"}
        color={"#FF6666"}
        height={50}
        width={30}
        className={"loader"}
      />
    );
  }

  function renderText() {
    return toRenderText ? actualText : renderLoader();
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
        {renderText()}
        <Form.Control
          id="type-box"
          type="text"
          value={typedText}
          onChange={traceChange}
          onKeyDown={traceKey}
        />
        <Button
          variant="outline-success"
          className="refreshPara"
          onClick={refreshPara}
        >
          <i className="fa fa-refresh"></i>{" "}
        </Button>{" "}
        <Button
          variant="outline-primary"
          className="simplify"
          onClick={simplifyPara}
        >
          {simplified ? "Simplified" : "Simplify"}
        </Button>{" "}
      </div>

      <div className="speedometers">
        <span className="typingSpeed">
          <ReactSpeedometer
            minValue={0}
            maxValue={220}
            segments={3}
            customSegmentStops={[0, 20, 60, 220]}
            segmentColors={colors}
            width={350}
            ringWidth={25}
            value={
              typingSpeed == Infinity || typingSpeed > 220 ? 0 : typingSpeed
            }
          />
        </span>
        <span className="accuracy">
          <ReactSpeedometer
            minValue={0}
            maxValue={100}
            segments={1}
            width={350}
            ringWidth={25}
            value={typingSpeed == 0 && accuracy == 100 ? "0" : accuracy}
            segmentColors={["#6B83E0"]}
            needleColor={"#E07362"}
            paddingVertical={5}
          />
        </span>
      </div>
    </>
  );
}
