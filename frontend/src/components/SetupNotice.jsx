import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function SetupNotice() {
  return (
    <div className="min-h-screen bg-stage grain flex items-center justify-center px-6">
      <Card className="max-w-2xl w-full glass-card border-amber-500/30 shadow-2xl" data-testid="setup-notice">
        <CardHeader>
          <div className="flex items-center gap-3 text-amber-300">
            <AlertTriangle className="w-6 h-6" />
            <CardTitle className="text-2xl display text-amber-50">Firebase setup required</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-stone-300">
          <p>
            This birthday puzzle needs Firebase Realtime Database to sync players in real-time.
            Add your Firebase web config to <code className="mono bg-black/40 px-1 rounded text-amber-200">/app/frontend/.env</code>:
          </p>
          <pre className="mono text-xs bg-black/60 text-amber-100 p-4 rounded-lg overflow-x-auto border border-amber-500/20">
{`REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_DATABASE_URL=https://<project>.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...`}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}
