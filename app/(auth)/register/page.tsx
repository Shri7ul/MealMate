import Link from "next/link";
import { RegisterForm } from "@/features/auth/components/register-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = {
  title: "Register"
};

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-2xl bg-card/90">
      <CardHeader>
        <CardTitle>Create account</CardTitle>
        <CardDescription>
          Register as a Manager or Member. Manager accounts can create a mess immediately.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
