import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "lucide-react";

export default function AnalyticsPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Analytics & Reports</CardTitle>
        <CardDescription>
          This feature is under construction.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center text-center p-12">
        <PieChart className="h-24 w-24 text-muted-foreground/50 mb-4" />
        <h3 className="text-xl font-bold">Coming Soon!</h3>
        <p className="text-muted-foreground">
          We are working hard to bring you detailed analytics on student performance.
        </p>
      </CardContent>
    </Card>
  )
}
