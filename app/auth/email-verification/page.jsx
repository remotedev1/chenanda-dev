import { emailVerification } from "@/actions/email-verification";
import { EmailVerificationForm } from "@/components/backOffice/auth/email-verification-form";

const EmailVerificationPage = async ({ searchParams }) => {
  const token = searchParams?.token;

  let success = null;
  let error = null;
  let loading = true;

  if (!token) {
    error = "Missing token!";
  } else {
    try {
      const result = await emailVerification(token);
      success = result.success;
      error = result.error;
      loading = false;
    } catch (e) {
      console.log(e);
      loading = false;
      error = "Something went wrong!";
    }
  }

  return (
    <section className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <EmailVerificationForm success={success} error={error} loading={loading} />
    </section>
  );
};

export default EmailVerificationPage;
