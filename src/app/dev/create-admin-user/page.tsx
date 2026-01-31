
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DevCreateAdminUserPage() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center gap-6 bg-muted">
        <Card className="w-full max-w-md rounded-lg bg-background p-8 shadow-lg text-center">
            <CardHeader>
                <CardTitle>Developer Tool Disabled</CardTitle>
                <CardDescription>
                    This tool is no longer needed because user accounts have been removed from the application.
                </CardDescription>
            </CardHeader>
        </Card>
    </div>
  );
}
