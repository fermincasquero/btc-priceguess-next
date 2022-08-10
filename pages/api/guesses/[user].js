import Axios from "axios";
import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";

var db = new JsonDB(new Config("./db/guessInfo.json", true, false, "/"));

export default async function handler(req, res) {
  const { user } = req.query;

  if (req.method === "POST") {
    const { btcPrice, time, guess } = req.body;
    await db.push(`/guesses/${user}[]`, {
      user,
      previous: btcPrice,
      guess,
      time,
      status: 1,
    }); // Save pending guess on db

    // Waits a minute.
    setTimeout(async () => {
      const {
        data: { price },
      } = await Axios.get(
        "https://api.binance.com/api/v3/avgPrice?symbol=BTCUSDT"
      ); // Gets new btc price
      const result =
        (price > btcPrice && guess === "up") ||
        (price < btcPrice && guess === "down");
      await db.push(`/guesses/${user}[-1]`, {
        user,
        previous: btcPrice,
        next: price,
        guess,
        result,
        time,
        status: 0,
      }); // Save resolved guess on db

      //Updates score
      let score = 0;
      try {
        score = await db.getData(`/scores/${user}`);
      } catch (e) {}

      await db.push(`/scores/${user}`, score + result ? 1 : -1);

      res.status(200).json({
        next: price,
        result,
      });
    }, 60000);
  } else if (req.method === "GET") {
    let guesses = [];
    try {
      guesses = await db.getData(`/guesses/${user}`);
    } catch (e) {}

    res.status(200).json(guesses);
  }
}
