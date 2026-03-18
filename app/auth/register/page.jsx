import { Button } from "@/components/ui/button";
import Link from "next/link";

const RegisterPage = () => {
  return (
    <div>
      <h2>Cannot register, contact admin</h2>
      <Button asChild className="bg-red-400 rounded-lg hover:bg-red-700 hover:text-white">
        <Link href="/">Go home</Link>
      </Button>
    </div>
  );
};

export default RegisterPage;