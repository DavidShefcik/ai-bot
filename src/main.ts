import { Client, GatewayIntentBits } from "discord.js";
import { Configuration, OpenAIApi } from "openai";
import * as dotenv from "dotenv";
import * as process from "process";
import { AxiosError } from "axios";

dotenv.config();

const bot = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageTyping,
  ],
});
const openAIConfig = new Configuration({
  apiKey: process.env.OPEN_AI_TOKEN,
});
const openAI = new OpenAIApi(openAIConfig);

bot.on("messageCreate", async (message) => {
  const messageContentsWithSingleSpace = message.content
    .replace(/\s+/g, " ")
    .split(" ");

  if (
    messageContentsWithSingleSpace.length < 2 ||
    messageContentsWithSingleSpace[0] !== `<@${bot.user?.id}>`
  ) {
    return;
  }

  messageContentsWithSingleSpace.shift();

  const joinedContent = messageContentsWithSingleSpace.join(" ");
  const prompt = `Respond to this as if you were "Walter White" from the show "Breaking Bad": "${joinedContent}"`;

  await message.channel.sendTyping();

  try {
    const completion = await openAI.createCompletion(
      {
        model: "text-davinci-003",
        prompt,
        temperature: 0.5,
        max_tokens: 100,
        presence_penalty: 0.5,
        frequency_penalty: 0.8,
        n: 1,
      },
      {
        timeout: 10000,
      }
    );

    const response = completion.data.choices[0].text;

    if (response) {
      await message.reply(response);
    }
  } catch (error) {
    const errorAsAxiosError = error as AxiosError;

    console.error(errorAsAxiosError.response?.data);

    await message.reply("Failed to send request to Open AI!");
  }
});

(async () => {
  try {
    await bot.login(process.env.DISCORD_TOKEN);
    console.log("Bot Started");
  } catch (error) {
    console.error(error);

    process.exit(1);
  }
})();
