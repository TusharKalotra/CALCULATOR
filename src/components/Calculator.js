import React, { useState, useEffect, useCallback } from "react";
import Display from "./Display";
import Buttons from "./Buttons";
import "./styles/Calculator.css";
import { evaluate, round } from "mathjs";

function Calculator() {
  const [input, setInput] = useState("");
  const [answer, setAnswer] = useState("");

  const updateInput = useCallback(
    (val) => {
      let str = input + val;
      if (str.length > 14) return;

      if (answer !== "") {
        setInput(answer + val);
        setAnswer("");
      } else setInput(str);
    },
    [input, answer]
  );

  const backspace = useCallback(() => {
    if (answer !== "") {
      setInput(answer.toString().slice(0, -1));
      setAnswer("");
    } else setInput((prev) => prev.slice(0, -1));
  }, [answer]);

  const calculateAns = useCallback(() => {
    if (input === "") return;
    let result = 0;
    let finalexpression = input;
    finalexpression = finalexpression.replaceAll("x", "*");
    finalexpression = finalexpression.replaceAll("÷", "/");

    let noSqrt = input.match(/√[0-9]+/gi);

    if (noSqrt !== null) {
      let evalSqrt = input;
      for (let i = 0; i < noSqrt.length; i++) {
        evalSqrt = evalSqrt.replace(
          noSqrt[i],
          `sqrt(${noSqrt[i].substring(1)})`
        );
      }
      finalexpression = evalSqrt;
    }

    try {
      if (!checkBracketBalanced(finalexpression)) {
        const errorMessage = { message: "Brackets are not balanced!" };
        throw errorMessage;
      }
      result = evaluate(finalexpression);
    } catch (error) {
      result =
        error.message === "Brackets are not balanced!"
          ? "Brackets are not balanced!"
          : "Invalid Input!!";
    }
    isNaN(result) ? setAnswer(result) : setAnswer(round(result, 3));
  }, [input]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;
      if (answer === "Invalid Input!!") return;

      if (
        (key >= "0" && key <= "9") ||
        key === "." ||
        key === "(" ||
        key === ")"
      ) {
        updateInput(key);
      } else if (key === "+" || key === "-" || key === "*" || key === "/") {
        updateInput(` ${key} `);
      } else if (key === "Enter") {
        calculateAns();
      } else if (key === "Backspace") {
        backspace();
      } else if (key === "Escape") {
        clearInput();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [input, answer, backspace, calculateAns, updateInput]);

  const inputHandler = (event) => {
    let val = event.target.innerText;

    if (val === "x2") val = "^2";
    else if (val === "x3") val = "^3";
    else if (val === "3√") val = "^(1÷3)";
    else if (val === "log") val = "log(";

    updateInput(val);
  };

  const clearInput = () => {
    setInput("");
    setAnswer("");
  };

  const checkBracketBalanced = (expr) => {
    let stack = [];
    for (let i = 0; i < expr.length; i++) {
      let x = expr[i];
      if (x === "(") {
        stack.push(x);
        continue;
      }

      if (x === ")") {
        if (stack.length === 0) return false;
        else stack.pop();
      }
    }
    return stack.length === 0;
  };

  return (
    <>
      <div className="container">
        <div className="main">
          <Display input={input} setInput={setInput} answer={answer} />
          <Buttons
            inputHandler={inputHandler}
            clearInput={clearInput}
            backspace={backspace}
            calculateAns={calculateAns}
          />
        </div>
      </div>
    </>
  );
}

export default Calculator;
