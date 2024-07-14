# Chatbot Arena

## Introduction

The Chatbot Arena for Traditional Chinese is an initiative by Yan-Ting Lin and NTU MiuLab, based on the LMSYS open-source research project. This platform is designed to evaluate the performance of large language models (LLMs) in Traditional Chinese. We have developed an open testing platform where users can label and compare data from conversations with LLMs, assess the quality of interactions, and provide feedback. This approach enables the collection of performance data in real-world scenarios, facilitating the enhancement of LLM capabilities.

## Methods

### chat

Users can engage in conversations with a variety of models randomly, without initially knowing which model they are interacting with. For each message sent, two responses from different models are generated and displayed. After conversing with the models for a sufficient duration, users can determine which model's response is better using the provided buttons. Additionally, users can modify the models' outputs to help generate data that will be used to train improved models in the future.

### rating

Two conversation fragments (before and after modifications) are randomly selected from the database and displayed on the screen. Users are asked to label which conversation better aligns with real-world scenarios and provide feedback if desired.

### dataset

The page allows users to download .json data files from the database for model training purposes. Users can also upload conversations in a specified format (currently OpenAI) into the database, which can then be labeled in the /rating section.

### leaderboard

The tab lists all available models on the website along with their Elo scores, which are automatically updated based on user feedback.

### profile

The website also includes a simple profile for personal information, which is based on GitHub and Google accounts.

## Getting Started

First, go get necessary API keys and MONGODB_URI, update it in the .env file. See the .env.example file for reference.  
In this project, we use MongoDB as the database and host it on MongoDB Atlas. You can also use other hosting services, but you may need to modify the code accordingly.  
Besides, if you want to change the list of models evaluated on the website, you need to update relevant API keys in the .env file, model names in [`src/app/api/chat/initiate/route.ts`](src/app/api/chat/initiate/route.ts#50), and API clients in [`src/lib/chat/stream.ts`](src/lib/chat/stream.ts) accordingly.

Then, run the following command.

```bash
yarn
```

To install the packages. Database schema and prisma client will also be created in this step.

Make sure that an anonymous user with info:

```bash
_id ObjectId('ANONYMOUS_USER_ID')
email ANONYMOUS_USER_EMAIL
username "anonymous"
provider "google"
hashedPassword "jwt"
coins 0
avatarUrl "anonymous.com"
bio "anonymous"
verified true
```

is already existed in the database.
Change the ANONYMOUS_USER_ID and ANONYMOUS_USER_EMAIL in @/lib/auth/index.ts to the \_id value provided by mongo. After adding this, the user is allowed to try the functionality of /chat with limited times without signing up.

Last, run:

```bash
yarn dev

```

To start the app. Now you can open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
