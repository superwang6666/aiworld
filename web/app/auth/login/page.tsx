import LoginForm from "@/components/auth/LoginForm";
import CommonHeader from "@/components/common/CommonHeader";
import PremiumBackground from "@/components/PremiumBackground";

export default function LoginPage() {
  return (
    <PremiumBackground>
      <div className="min-h-screen flex flex-col">
        <CommonHeader />

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <LoginForm />
        </main>
      </div>
    </PremiumBackground>
  );
}
