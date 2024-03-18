"use client"

import { useState } from "react";
import { signIn } from "next-auth/react";
import AuthInput from "./AuthInput";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from "react-toastify";
type Props = {
    error?: string;
}

function AuthForm(props: Props) {
    const [email, setEmail] = useState<string>("");
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [confirmPassword, setConfirmPassword] = useState<string>("");
    const [isSignUp, setIsSignUp] = useState<boolean>(false);

    const isPasswordValid = password.length >= 8 && password.length <= 20 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
    const isPasswordConfirm = (password === confirmPassword);
    const isUsernameValid = username.length <= 20 && username.length > 0;
    const invalidSignUp = (!isPasswordValid || !isUsernameValid || !isPasswordConfirm);
    const invalidSignIn = (!isPasswordValid);
    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        signIn("credentials", {
            email,
            username,
            password,
            callbackUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/rating`,
        },{mode: isSignUp})
    };

    return (
        <div className="min-w-[300px] bg-white rounded-lg shadow-lg p-6">
            <div className="flex justify-end">
            </div>
            <div className="mb-4 text-2xl font-semibold text-center text-black">
                {isSignUp ? "註冊" : "登入"}
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <AuthInput label="Email" type="email" value={email} setValue={setEmail} />
                {isSignUp && (
                    <AuthInput label="使用者名稱" type="text" value={username} setValue={setUsername} />
                )}
                {!isUsernameValid && username.length > 0 &&
                    <p className="text-red-500 text-sm">
                        請輸入長度介於1-20的使用者名稱!
                    </p>}

                <AuthInput label="密碼" type="password" value={password} setValue={setPassword} />
                {!isPasswordValid && password.length > 0 &&
                    <p className="text-red-500 text-sm">
                        密碼長度介於8-20，包含大小寫英數字!
                    </p>}
                {isSignUp && (
                    <AuthInput
                        label="確認密碼"
                        type="password"
                        value={confirmPassword}
                        setValue={setConfirmPassword}
                    />
                )}
                {isSignUp && !isPasswordConfirm && confirmPassword.length > 0 &&
                    <p className="text-red-500 text-sm">
                        密碼不相符!
                    </p>}
                <div className="text-sm text-gray-500">
                    {isSignUp ? (
                        <span>
                            已經有帳號了？{" "}
                            <button
                                type="button"
                                className="text-blue-500 hover:underline"
                                onClick={() => setIsSignUp(false)}
                            >
                                登入
                            </button>
                        </span>
                    ) : (
                        <span>
                            尚未註冊?{" "}
                            <button
                                type="button"
                                className="text-blue-500 hover:underline"
                                onClick={() => setIsSignUp(true)}
                            >
                                註冊
                            </button>
                        </span>
                    )}
                </div>
                {isSignUp && (
                    <button
                        type="submit"
                        className={`w-full ${invalidSignUp ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 rounded-md`}
                        disabled={invalidSignUp}
                    >
                        註冊
                    </button>
                )}
                {!isSignUp && (
                    <button
                        type="submit"
                        className={`w-full ${invalidSignIn ? 'bg-gray-300' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 rounded-md`}
                        disabled={invalidSignIn}
                    >
                        登入
                    </button>
                )}
                 {props.error=="CredentialsSignin"&&!isSignUp&&<p className="bg-red-100 text-red-600 text-center p-2">帳密錯誤或已被註冊，請重試！</p>}
                 {props.error=="NotVerified"&&!isSignUp&&<p className="bg-green-100 text-green-600 text-center p-2">Email驗證信已寄出！</p>}
            </form>
            <div className="flex items-center justify-center mt-4">
                {/* Additional content */}
            </div>
        </div>
    );
}

export default AuthForm;