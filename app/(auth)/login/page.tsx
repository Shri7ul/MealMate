import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Login"
};

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md bg-card/90">
      <CardHeader>
        <CardTitle>Login</CardTitle>
        <CardDescription>Use your Supabase-backed MealMate account.</CardDescription>
      </CardHeader>
      <CardContent>
        <Suspense fallback={null}>
          <LoginForm />
        </Suspense>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          New to MealMate?{" "}
          <Link href="/register" className="font-medium text-primary">
            Create an account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
