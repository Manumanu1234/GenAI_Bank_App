import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Mail, Phone, Building, CreditCard } from "lucide-react";

export default function UserProfile({ user }) {
  return (
    <Card className="bg-white shadow-lg">
      <CardHeader className="text-center">
        <Avatar className="w-24 h-24 mx-auto">
          <AvatarImage src="/placeholder.svg?height=96&width=96" alt={user.name} />
          <AvatarFallback>
            {user.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </AvatarFallback>
        </Avatar>
        <CardTitle className="mt-4 text-2xl font-bold">{user.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Building className="text-blue-500" />
            <div>
              <p className="text-sm text-gray-500">Bank</p>
              <p className="font-medium">{user.bank}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <CreditCard className="text-green-500" />
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="font-medium">${user.bankBalance.toFixed(2)}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Mail className="text-purple-500" />
            <div>
              <p className="text-sm text-gray-500">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <Phone className="text-yellow-500" />
            <div>
              <p className="text-sm text-gray-500">Phone</p>
              <p className="font-medium">{user.number}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
