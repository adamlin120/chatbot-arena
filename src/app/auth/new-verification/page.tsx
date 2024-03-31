import Loading from "@/app/_components/Loading";
import { NewVerificationForm } from "@/app/_components/NewVerificationForm";
import { Suspense } from "react";
const NewVerificationPage = async () => {
  return (
    <Suspense fallback={<Loading />}>
      <NewVerificationForm />
    </Suspense>
  );
};

export default NewVerificationPage;
