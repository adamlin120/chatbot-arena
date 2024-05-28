"use client";
import { getSession } from "next-auth/react";
import { JSONTree } from 'react-json-tree';
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import CircularProgress from '@mui/material/CircularProgress';
import Loading from "./Loading";
import { green } from "@mui/material/colors";
export const dynamic = "force-dynamic";

export default function DatasetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [ratingdata, setRatingdata] = useState([]);
  const [chatdata, setChatdata] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentPageChat, setCurrentPageChat] = useState(1);
  const [downloadingRating, setDownloadingRating] = useState(false);
  const [downloadingChat, setDownloadingChat] = useState(false);
  const itemsPerPage = 1; // Each element is considered one page

  const fetchRandomRating = async (amount: Number) => {
    const res = await fetch(`/api/dataset/rating?amount=${amount}`);
    if (res.ok) {
      return res.json();
    }
    throw new Error('Failed to fetch random ratings');
  }

  const fetchRandomChat = async (amount: Number) => {
    const res = await fetch(`/api/dataset/chat?amount=${amount}`);
    if (res.ok) {
      return res.json();
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const session = await getSession();
        if (!session || !session.user || session.user.verified === false) {
          router.push("/login");
        } else {
          const rating = await fetchRandomRating(100);
          const chat = await fetchRandomChat(100);
          setRatingdata(rating);
          setChatdata(chat);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // Download JSON!!
  const downloadJSON = async (type: any, filename: string) => {
    var data;
    if (type == "rating") {
      setDownloadingRating(true);
      data = await fetchRandomRating(-1);
    }
    else {
      setDownloadingChat(true);
      data = await fetchRandomChat(-1);
    }
    const json = JSON.stringify(data);
    const blob = new Blob([json], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = href;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (type == "rating") {
      setDownloadingRating(false);
    }
    else {
      setDownloadingChat(false);
    }
  };

  // Calculate display for rating data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = ratingdata.slice(indexOfFirstItem, indexOfLastItem);

  // Calculate display for chat data
  const indexOfLastItemChat = currentPageChat * itemsPerPage;
  const indexOfFirstItemChat = indexOfLastItemChat - itemsPerPage;
  const currentItemsChat = chatdata.slice(indexOfFirstItemChat, indexOfLastItemChat);

  // Navigate for rating data
  const goToPreviousPage = () => {
    setCurrentPage(currentPage => Math.max(1, currentPage - 1));
  };
  const goToNextPage = () => {
    setCurrentPage(currentPage => Math.min(ratingdata.length, currentPage + 1));
  };

  // Navigate for chat data
  const goToPreviousPageChat = () => {
    setCurrentPageChat(currentPageChat => Math.max(1, currentPageChat - 1));
  };
  const goToNextPageChat = () => {
    setCurrentPageChat(currentPageChat => Math.min(chatdata.length, currentPageChat + 1));
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div id="dataset" className="p-5 px-44 fade-in hidden-scrollbar">
      <div className="flex flex-col gap-3">
        <div className="text-3xl font-bold">Dataset</div>
        <div className="text-s">
          開源資料集下載區（下載資料集可能需要一些時間，請耐心等待）
        </div>
        <div className="text-xl">1. Rating資料預覽：（至多顯示100筆）</div>
        <div>
          {currentItems.map((item, index) => (
            <div key={index} className="json-container">
              <JSONTree data={item} theme="flat" />
            </div>
          ))}
          <div className="flex justify-center items-center mt-4 space-x-4">
            <button onClick={goToPreviousPage} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md shadow-md">
              &lt; Prev
            </button>
            <span className="px-3 py-1 bg-gray-700 text-white rounded-md">
              {currentPage}/{ratingdata.length}
            </span>
            <button onClick={goToNextPage} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md shadow-md">
              Next &gt;
            </button>
            <button
              onClick={() => downloadJSON("rating", "rating_data.json")}
              className={`px-3 py-1 rounded-md shadow-md text-white ${downloadingRating ? 'bg-gray-500 cursor-wait' : 'bg-blue-500 hover:bg-blue-600'}`}
              disabled={downloadingRating}
            >
              Download Rating JSON
            </button>
            {downloadingRating && (
              <CircularProgress
                size={24}
              />
            )}
          </div>
        </div>
        <div className="text-xl">2. Chat資料預覽：（至多顯示100筆）</div>
        <div>
          {currentItemsChat.map((item, index) => (
            <div key={index} className="json-container">
              <JSONTree data={item} theme="flat" />
            </div>
          ))}
          <div className="flex justify-center items-center mt-4 space-x-4">
            <button onClick={goToPreviousPageChat} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md shadow-md">
              &lt; Prev
            </button>
            <span className="px-3 py-1 bg-gray-700 text-white rounded-md">
              {currentPageChat}/{chatdata.length}
            </span>
            <button onClick={goToNextPageChat} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded-md shadow-md">
              Next &gt;
            </button>
            <button
              onClick={() => downloadJSON("chat", "chat_data.json")}
              className={`px-3 py-1 rounded-md shadow-md text-white ${downloadingChat ? 'bg-gray-500 cursor-wait' : 'bg-blue-500 hover:bg-blue-600'}`}
              disabled={downloadingChat}
            >
              Download Chat JSON
            </button>
            {downloadingChat && (
              <CircularProgress
                size={24}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}