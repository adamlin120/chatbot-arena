"use client";
import { useSession } from "next-auth/react";
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
  }, [session]);

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
    <div className="bg-[rgb(31,41,55,0.3)] rounded-lg p-6 fade-in">
      <h1 className="text-3xl font-bold mb-6 text-white">個人檔案/Profile</h1>
      <div className="max-w-md mx-auto">
        <div className="flex items-center mb-6">
          <h2 className="text-xl font-semibold text-white mr-4">
            使用者名稱/Username
          </h2>
          <Image
            src={profile.image}
            alt="Profile Image"
            width={48}
            height={48}
            className="rounded-full"
          />
        </div>
        <p className="text-lg text-white mb-6">{profile.username}</p>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-white">金幣/Coins</h2>
          <p className="text-lg text-white">{profile.coins}</p>
        </div>

        {isEditing ? (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">自介/Bio</h2>
            <textarea
              className="w-full border border-gray-300 rounded-md p-3 text-black leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={newBio}
              onChange={(e) => setNewBio(e.target.value)}
            />
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
          </div>
        ) : (
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">自介/Bio</h2>
            <p className="text-lg text-white mb-4">{profile.bio}</p>
            {profile.email === session?.user?.email && (
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                onClick={handleEditBio}
              >
                編輯/Edit Bio
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
