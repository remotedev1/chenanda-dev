"use client";

import { CardWrapper } from "@/components/common/card-wrapper";
import { FormError } from "@/components/common/form-error";
import { FormSuccess } from "@/components/common/form-success";
import { BeatLoader } from "react-spinners";

export const EmailVerificationForm = ({ loading, success, error }) => {
  return (
    <CardWrapper
      headerLabel="Confirming your verification"
      backButtonLabel="Back to login"
      backButtonHref="/auth/login"
    >
      <div className="flex items-center w-full justify-center">
        {loading && (
          <div className="flex items-center justify-center mt-4">
            <BeatLoader color="#4A5568" />
          </div>
        )}

        <FormSuccess message={success} />
        <FormError message={error} />
      </div>
    </CardWrapper>
  );
};
