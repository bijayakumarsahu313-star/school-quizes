
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import Link from "next/link";

export default function CheckoutPage() {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 flex items-center justify-center">
                <Card className="w-full max-w-md text-center">
                    <CardHeader>
                        <CardTitle>Checkout Disabled</CardTitle>
                        <CardDescription>
                            This feature is not available as user accounts and payments have been removed.
                        </CardDescription>
                    </CardHeader>
                     <CardContent>
                        <p>You can now directly access the <Link href="/teacher-tools" className="text-primary hover:underline">teacher tools</Link> or the <Link href="/student-zone" className="text-primary hover:underline">student zone</Link>.</p>
                    </CardContent>
                </Card>
            </main>
            <Footer />
        </div>
    )
}
