import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendVerificationEmail = async (email: string, token: string) => {
  const confirmLink = `http://localhost:3000/auth/new-verification?token=${token}`; //TODO: change the url later

  await resend.emails.send({
    from: "onboarding@resend.dev",
    to: email,
    subject: "~ChatBot-Arena 電子郵件確認~",
    html: `<p>請點擊此<a href="${confirmLink}">連結</a>來驗證您的電子郵件 > <</p>`,
  });
};
