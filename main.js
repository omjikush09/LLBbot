import TelegramBot from "node-telegram-bot-api";
import * as dotenv from "dotenv";
import { chain } from "./index.js";
import {createClient} from "redis"
dotenv.config();

const client= createClient({url:process.env.REDIS_URL_STORAGE})
await client.connect();
client.on("error", (err) => {
  console.error("Redis error:", err);
});
const token = process.env.TELEGRAM_BOT_KEY;
const bot = new TelegramBot(token, { polling: true });

let history = [];

bot.onText(/\/start (.+)/, async (msg, match) => {
  // 'msg' is the received Message from Telegram
  // 'match' is the result of executing the regexp above on the text content
  // of the message

  const chatId = msg.chat.id;
  const resp = match[1]; // the captured "whatever"
  console.log(chatId);
  if (resp.length === 0) {
    bot.sendMessage(chatId, "//start :-User to start new session");
    try {
      await client.del(String(chatId));
    } catch (error) {
      console.log("start delete error");
      console.log(error);
    }
  } else {
    //   unsupportedType(bot, resp, chatId);
    const res = await chain.call({ question: resp, chat_history: [] });
    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, res.text);
    await client.set(String(chatId), JSON.stringify([resp + res.text]), {
      EX: 900000,
    }); //15min
  }
});


bot.on("message", async(msg) => {
  const chatId = msg.chat.id;
  const message=msg.text
  console.log( chatId);




if(typeof msg.text !== "string"){
  
  bot.sendMessage(chatId, "Message Type not supported");
}else{

  const pattern = /\/start/;
  let isMatched= pattern.test(message)
  console.log('====================================');
  console.log(isMatched);
  console.log('====================================');
  if(isMatched){
    bot.sendMessage(chatId, "//start :-Use to start new session \n Starting new session");
    try {
      await client.del(String(chatId));
    } catch (error) {
      console.log("start delete error");
      console.log(error);
    }
  }else{
    bot.sendMessage(chatId, `Received your message. Sending response`);
    try {
      history = JSON.parse(await client.get(String(chatId)));
    } catch (error) {
      console.error(error);
    }
    console.log("here");
    if (history === undefined || history === null) {
      const res = await chain.call({ question: message, chat_history: [] });
      // send back the matched "whatever" to the chat
      bot.sendMessage(chatId, res.text);
      console.log("here 2");
      await client.set(String(chatId), JSON.stringify([msg.text + res.text]), {
        EX: 900000,
      }); //15min
    } else {
      console.log("message" + message);
      console.log("history" + history);
      const res = await chain.call({
        question: message,
        chat_history: history,
      });
      // send back the matched "whatever" to the chat
      console.log("response of llm  " + JSON.stringify(res));
      bot.sendMessage(chatId, res.text);
      await client.set(
        String(chatId),
        JSON.stringify([...history, msg.text + res.text])
      );
    }
  }
  
  

}
console.log(typeof msg.text === "string");
});



