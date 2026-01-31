
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>User Management Disabled</CardTitle>
        <CardDescription>
          This feature is not available as user accounts have been removed.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>The application no longer has a user management system.</p>
      </CardContent>
    </Card>
  )
}
