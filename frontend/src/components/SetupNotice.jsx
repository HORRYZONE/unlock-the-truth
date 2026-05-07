import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle } from "lucide-react";

export default function SetupNotice() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 paper-grain">
      <Card className="max-w-2xl w-full shadow-xl border-amber-200" data-testid="setup-notice">
        <CardHeader>
          <div className="flex items-center gap-3 text-amber-700">
            <AlertTriangle className="w-6 h-6" />
            <CardTitle className="text-2xl">Firebase setup required</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 text-stone-700">
          <p>
            This birthday puzzle needs Firebase Realtime Database to sync players
            in real-time. Add your Firebase web config to <code className="mono bg-stone-100 px-1 rounded">/app/frontend/.env</code>:
          </p>
          <pre className="mono text-xs bg-stone-900 text-stone-100 p-4 rounded-lg overflow-x-auto">
{`REACT_APP_FIREBASE_API_KEY=...
REACT_APP_FIREBASE_AUTH_DOMAIN=...
REACT_APP_FIREBASE_DATABASE_URL=https://<project>.firebaseio.com
REACT_APP_FIREBASE_PROJECT_ID=...
REACT_APP_FIREBASE_STORAGE_BUCKET=...
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=...
REACT_APP_FIREBASE_APP_ID=...`}
          </pre>
          <ol className="list-decimal pl-5 space-y-1 text-sm">
            <li>Create a Firebase project & enable <strong>Realtime Database</strong>.</li>
            <li>Copy the web app config from <em>Project settings → Your apps → Web</em>.</li>
            <li>Paste each value into <code className="mono">.env</code> and restart the frontend.</li>
            <li>Set DB rules to <code className="mono">{`{".read": true, ".write": true}`}</code> for testing (tighten later).</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
