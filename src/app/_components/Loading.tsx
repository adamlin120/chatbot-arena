import { CircularProgress } from "@mui/material";
export default function Loading() {
  return (
    <div className="flex w-full h-full pt-16 justify-center items-center">
      {/* <div className="loading-spinner h-[100px] w-[100px]"></div> */}
      <CircularProgress size={100} />
    </div>
  );
}
