import { createClient } from "redis";

const client = await createClient()
  .on("error", (err) => console.log("Redis Client Error", err))
  .connect();


client.on("end", () => {
  console.log("Redis connection closed");
});

process.on("SIGINT", () => {
  client.quit();
});

export default client;
