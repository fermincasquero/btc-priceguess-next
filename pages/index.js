import Head from "next/head";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import styles from "../styles/Home.module.css";
import Axios from "axios";

export default function Home() {
  const [user, setUser] = useState("");
  const [input, setInput] = useState("");

  const [btcPrice, setBtcPrice] = useState(0);
  const [score, setScore] = useState(0);

  const [guesses, setGuesses] = useState([]);
  const [status, setStatus] = useState(false); // false for resolved, true for pending

  // Get current BTC price by every 5 seconds.
  useEffect(() => {
    const id = setInterval(() => {
      Axios.get("https://api.binance.com/api/v3/avgPrice?symbol=BTCUSDT")
        .then(({ data }) => {
          setBtcPrice(parseFloat(data.price).toFixed(3));
        })
        .catch((e) => console.log(e));
    }, 5000);

    return () => clearInterval(id);
  }, []);

  //Get Current Score and guesses
  useEffect(() => {
    if (!user) return;
    Axios.get(`/api/scores/${user}`).then(({ data: { score } }) => {
      setScore(parseInt(score));
    });
    Axios.get(`/api/guesses/${user}`).then(({ data }) => {
      setGuesses(data);
      setStatus(
        !!data.reduce((acc, { status }) => (acc = acc + parseInt(status)), 0)
      );
    });
  }, [user]);

  const confirmUser = (e) => {
    e.preventDefault();
    setUser(input);
  };

  //Guess function
  const handleGuess = async (e) => {
    const time = new Date().toISOString();
    setGuesses((guesses) => [
      ...guesses,
      { time, previous: btcPrice, status: 1, guess: e.target.value },
    ]);
    setStatus(1);

    try {
      const {
        data: { next, result },
      } = await Axios.post(`/api/guesses/${user}`, {
        btcPrice,
        time,
        guess: e.target.value,
      });
      setStatus(0); // Convert status from pending to resolved

      setScore((score) => (score + result ? 1 : -1)); // Update score on the outcome.

      setGuesses((guesses) =>
        guesses.map((guess, idx) => {
          if (idx === guesses.length - 1)
            return { ...guess, status: 0, result, next };
          return guess;
        })
      );
    } catch (e) {
      console.log(e);
    }
  };

  //Get guessing history rows
  const guessRows = useMemo(() => {
    return [...guesses]
      .reverse()
      .map(({ time, previous, next, guess, result, status }) => (
        <tr>
          <td className="border  border-slate-800">{time}</td>
          <td className="border  border-slate-800">{previous}</td>
          <td className="border  border-slate-800">{next}</td>
          <td className="border  border-slate-800">{guess}</td>
          <td className="border  border-slate-800">
            {result ? "Correct" : "False"}
          </td>
          <td className="border  border-slate-800">
            {status ? "Pending" : "Resolved"}
          </td>
        </tr>
      ));
  }, [guesses]);

  return (
    <div className={styles.container + " flex justify-center flex-row mt-4"}>
      <div className="w-1/2 mt-16">
        {!user && (
          <form
            onSubmit={confirmUser}
            className="w-full flex flex-row justify-center items-center"
          >
            <input
              className="flex border border-black flex-1"
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <button className="border border-black" type="submit">
              Enter
            </button>
          </form>
        )}
        {!!user && (
          <div className="w-full flex flex-col justify-center items-center">
            <h1 className="text-3xl">Hello, {user}!</h1>
            <h2 className="text-2xl mt-3">
              Your score is now {score}. Come and guess to get more score.
            </h2>

            <h4 className="text-2xl mt-12">Current BTC price : ${btcPrice}</h4>
            <p className="text-sm text-gray-500">
              This price updates every 5 seconds.
            </p>

            <div className="mt-4 w-full flex flex-row justify-evenly">
              <button
                onClick={handleGuess}
                disabled={status}
                value="up"
                className="border border-green-600 disabled:border-slate-700 hover:bg-green-600 hover:text-white px-4 py-1 flex-1"
              >
                Up
              </button>
              <button
                onClick={handleGuess}
                disabled={status}
                value="down"
                className="border border-red-600 disabled:border-slate-700 hover:bg-red-600 hover:text-white px-4 py-1 flex-1"
              >
                Down
              </button>
            </div>

            <div className="w-full mt-8">
              {!!guesses.length && (
                <table className="w-full table-auto border-collapse border-black border">
                  <thead>
                    <tr>
                      <td className="border  border-slate-800">Time</td>
                      <td className="border  border-slate-800">
                        Previous Price
                      </td>
                      <td className="border  border-slate-800">Next Price</td>
                      <td className="border  border-slate-800">Guess</td>
                      <td className="border  border-slate-800">Result</td>
                      <td className="border  border-slate-800">Status</td>
                    </tr>
                  </thead>

                  {guessRows}
                </table>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
