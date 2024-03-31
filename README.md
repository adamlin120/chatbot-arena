# ChatBot Arena

## Getting Started

Go to [resend](https://resend.com/) and get an email API KEY (This is used for email verification)

- Fill the key in RESEND_API_KEY= field in .env file, too.

Go to Slack Canva to get necessary API keys and DATABASE_URL, update it in the .env file. See the .env.example file for reference.

Then, run the following command.
```bash
yarn
```
To install the packages. Database schema will also be created in this step.

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
