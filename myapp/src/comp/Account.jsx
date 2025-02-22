import { useEffect, useState } from "react"
import FinancialSummary from "./FinancialSummary"
import TransactionList from "./TransactionList"
import UserProfile from "./UserProfile"
import axios from "axios"
import NavBar from "./NavBar"

export default function Account() {
  const [userDetails, setUserDetails] = useState(null);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    async function fetchUserDetails() {
      try {
        const response = await axios.get("http://127.0.0.1:8000/userdetails/");
        const fetchedData = response.data.details;
        console.log(fetchedData);

        const user = {
          name: fetchedData[1],
          bank: fetchedData[4],
          bankBalance: fetchedData[5],
          email: "gracelee123@gmail.com",
          number: fetchedData[3],
        };

        setUserDetails(user);
        const response1 = await axios.get("http://127.0.0.1:8000/transactions/");
        setTransactions(response1.data.details);
      } catch (err) {
        setError('Failed to fetch user details');
        console.error(err);
      }
    }

    fetchUserDetails();
  }, []);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!userDetails) {
    return <div>Loading...</div>;
  }

  return (
    <div>
        <NavBar/>
        <div className="min-h-screen bg-white-100 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold mb-8 text-center text-gray-800">My Profile</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <UserProfile user={userDetails} />
          </div>
          <div className="lg:col-span-2 space-y-8">
            <FinancialSummary balance={userDetails.bankBalance} transactions={transactions} />
            <TransactionList transactions={transactions} />
          </div>
        </div>
      </div>
    </div>
    </div>

  );
}
