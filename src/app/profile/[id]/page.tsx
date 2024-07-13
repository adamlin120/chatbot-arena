"use client";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Loading from "@/app/_components/Loading";
import Image from "next/image";
export const dynamic = "force-dynamic";

const ProfilePage = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [profile, setProfile] = useState({
    email: "",
    username: "",
    image: "",
    coins: 0,
    bio: "",
  });
  const [newBio, setNewBio] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // Redirect if not logged in
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (session) {
      // Assuming the email is stored in the session object
      const _id = params.id;
      // Call the API to get the user profile
      fetch(`/api/profile/user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ _id }),
      })
        .then((response) => response.json())
        .then((data) => {
          setProfile({
            email: data.user.email,
            username: data.user.username,
            image: data.user.avatarUrl,
            coins: data.user.coins,
            bio: data.user.bio,
          });
          setNewBio(data.user.bio);
        })
        .catch((error) => {
          console.error("Error fetching profile:", error);
        });
    }
  }, [session,params.id]);

  if (!session || !profile.username) {
    return <Loading />;
  }

  const handleEditBio = () => {
    setIsEditing(true);
  };

  const handleSaveBio = () => {
    // Call the API to update the user's bio
    fetch(`/api/profile/edit`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: session?.user?.email, bio: newBio }),
    })
      .then((response) => response.json())
      .then((data) => {
        setProfile((prevProfile) => ({
          ...prevProfile,
          bio: data.user.bio,
        }));
        setIsEditing(false);
      })
      .catch((error) => {
        console.error("Error updating bio:", error);
      });
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewBio(profile.bio); // Reset newBio to the current bio
  };
  return (
    <div className="bg-[rgb(31,41,55,0.3)] p-5 px-10 md:px-16 lg:px-40 xl:px-60 fade-in hidden-scrollbar rounded-lg">
      <div className="flex flex-col gap-3">
        <div className="text-3xl font-bold">Profile</div>
        <div className="text-md">使用者個人檔案管理</div>
      </div>
      <div className="mx-auto">
        <table className="w-full text-left text-white">
          <tbody>
            <tr
              className="border-b border-gray-600"
              style={{ userSelect: "none" }}
            >
              <td className="text-l font-semibold py-2 md:w-48">
                使用者名稱/Username
              </td>
              <td className="flex items-center py-2">
                &nbsp;&nbsp;
                <Image
                  src={profile.image}
                  alt="Profile Image"
                  width={48}
                  height={48}
                  className="rounded-full mr-4"
                />
                <span className="text-lg">{profile.username}</span>
              </td>
            </tr>
            <tr
              className="border-b border-gray-600"
              style={{ userSelect: "none" }}
            >
              <td className="text-l font-semibold py-2">金幣/Coins</td>
              <td className="text-lg py-2">&nbsp;&nbsp;{profile.coins}</td>
            </tr>
            <tr>
              <td
                className="text-l font-semibold py-2"
                style={{ userSelect: "none" }}
              >
                自介/Bio
              </td>
              <td className="py-2">
                <div
                  className={`w-full h-48 border ${isEditing ? "border-white" : "border-none"} rounded-md p-3 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
                >
                  {isEditing ? (
                    <textarea
                      className="w-full h-full border-none resize-none outline-none bg-[rgb(31,41,55)] text-white text-lg" // Added text-lg class here
                      style={{ width: "calc(100% - 1rem)" }}
                      value={newBio}
                      onChange={(e) => setNewBio(e.target.value)}
                    />
                  ) : (
                    <p className="w-full h-full text-lg mb-4 overflow-auto border-none">
                      {profile.bio}
                    </p> // Added text-lg class here
                  )}
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        {isEditing ? (
          <div className="flex justify-end mt-4 space-x-4">
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              onClick={handleSaveBio}
            >
              儲存/Save
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-white font-semibold px-6 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50 transition-colors"
              onClick={handleCancelEdit}
            >
              取消/Cancel
            </button>
          </div>
        ) : (
          profile.email === session?.user?.email && (
            <div className="flex justify-end mt-4 space-x-4">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                onClick={handleEditBio}
              >
                編輯/Edit Bio
              </button>
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                title="登出"
                onClick={() => signOut()}
              >
                登出
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
