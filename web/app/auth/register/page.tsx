export const dynamic = 'force-dynamic';

import RegisterForm from "@/components/auth/RegisterForm";
import CommonHeader from "@/components/common/CommonHeader";
import PremiumBackground from "@/components/PremiumBackground";

export default function RegisterPage() {
  return (
    <PremiumBackground>
      <div className="min-h-screen flex flex-col">
        <CommonHeader />

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <RegisterForm />
        </main>
      </div>
    </PremiumBackground>
  );
}
