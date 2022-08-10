import { JsonDB } from "node-json-db";
import { Config } from "node-json-db/dist/lib/JsonDBConfig";

var db = new JsonDB(new Config("./db/guessInfo.json", true, false, "/"));

export default async function handler(req, res) {
  const { user } = req.query;

  let score = 0;
  try {
    score = await db.getData(`/scores/${user}`);
  } catch (e) {
    await db.push(`/scores/${user}`, 0);
  }

  res.status(200).json({ score });
}
