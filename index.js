import {createClient,createCluster} from "redis"
import { OpenAI } from "langchain/llms/openai";
import { ConversationalRetrievalQAChain } from "langchain/chains";
import { RedisVectorStore } from "langchain/vectorstores/redis";
import { OpenAIEmbeddings } from "langchain/embeddings/openai";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import * as fs from "fs";
import * as dotenv from "dotenv"; 
dotenv.config();

const client=createClient({url:process.env.REDIS_URL})
console.log("Connecting to DB")
await client.connect();
    console.log("starting")
  /* Initialize the LLM to use to answer the question */
  
  const model = new OpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
  });
 
  /* Load in the file we want to do question answering over */
  const text = fs.readFileSync(
    "output.txt",
    "utf8"
  );
  /* Split the text into chunks */
  const textSplitter = new RecursiveCharacterTextSplitter({ chunkSize: 1000 });
  const docs = await textSplitter.createDocuments([text]);
  /* Create the vectorstore */

  const vectorStore = await RedisVectorStore.fromDocuments(docs, new OpenAIEmbeddings(),{redisClient:client,indexName:"docs"});
  /* Create the chain */
 
  /* Ask it a question */
 

 export const chain = ConversationalRetrievalQAChain.fromLLM(
   model,
   vectorStore.asRetriever(1)
 );


  // const resA = await model.call(
  //   "What would be a good company name a company that makes colorful socks?"
  // );
  // console.log({ resA });
 const question =
   "What do you know about Madhya Pradesh East Nimar Harsud 2021-22 April";
export  const res = await chain.call({ question, chat_history: [] });
 console.log(res);
 /* Ask it a follow up question */
 const chatHistory = question + res.text;
 const followUpRes = await chain.call({
   question: "Was that nice?",
   chat_history: chatHistory,
 });
 console.log(followUpRes);