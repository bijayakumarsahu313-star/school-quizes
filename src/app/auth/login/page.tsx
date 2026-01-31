
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle>Login Disabled</CardTitle>
          <CardDescription>
            User authentication has been removed from this application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p>You can now directly access the <Link href="/dashboard" className="text-primary hover:underline">teacher dashboard</Link> or the <Link href="/student-zone" className="text-primary hover:underline">student zone</Link>.</p>
        </CardContent>
      </Card>
    </div>
  );
}
