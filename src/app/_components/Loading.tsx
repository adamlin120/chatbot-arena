import { CircularProgress } from "@mui/material";
export default function Loading() {
  return (
    <div className="flex w-full h-[70dvh] justify-center items-center">
      {/* <div className="loading-spinner h-[100px] w-[100px]"></div> */}
      <CircularProgress size={100} sx={{ color: "white" }} thickness={3.0} />
    </div>
  );
}
