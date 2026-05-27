import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserX, Mail } from "lucide-react";
import Link from "next/link";

export default function AccessRevokedPage() {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="max-w-md w-full bg-zinc-800 border-zinc-700">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-4">
            <UserX className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-white text-xl">Access Revoked</CardTitle>
          <CardDescription className="text-zinc-400">
            Your access to this application has been removed by an administrator.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-zinc-300 text-sm">
            You no longer have permission to access the Falcore Proposal Generator.
            Your account has been deactivated by an administrator.
          </p>
          <div className="flex flex-col gap-3">
            <form action="/api/auth/logout" method="POST">
              <Button type="submit" variant="outline" className="w-full border-zinc-600 text-zinc-300 hover:bg-zinc-700">
                Return to Login
              </Button>
            </form>
            <Button asChild variant="outline" className="border-zinc-600 text-zinc-300 hover:bg-zinc-700">
              <a href="mailto:faez@falcoretech.com" className="flex items-center justify-center">
                <Mail className="mr-2 h-4 w-4" />
                Contact Administrator
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
