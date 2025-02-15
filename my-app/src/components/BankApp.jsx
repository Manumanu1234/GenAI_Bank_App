import React, { useState, useEffect } from "react";
import axios from "axios";

const FASTAPI_URL = "http://localhost:8000"; // Update with actual backend URL

const BankApp = () => {
  const [query, setQuery] = useState("");
  const [amount, setAmount] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [uiState, setUiState] = useState("input");
  const [notification, setNotification] = useState("");

  // Debugging: Log UI state changes
  useEffect(() => {
    console.log("UI State Updated:", uiState);
  }, [uiState]);

  const handleStartProcess = async () => {
    if (!query) {
      setNotification("Please enter a request to proceed.");
      return;
    }

    try {
      console.log("Sending request to backend...");
      const response = await axios.post(`${FASTAPI_URL}/start`, { data: [query] });
      console.log("Backend response:", response.data);
      processResponse(response.data);
    } catch (error) {
      setNotification("Failed to connect to the backend.");
      console.error("Error:", error);
    }
  };

  const handleConfirmSubmit = async (data) => {
    try {
      console.log("Submitting confirmation:", data);
      const response = await axios.post(`${FASTAPI_URL}/confirm`, { data: [data] });
      console.log("Backend response:", response.data);
      processResponse(response.data);
    } catch (error) {
      setNotification("Failed to connect to the backend.");
      console.error("Error:", error);
    }
  };

  const processResponse = (result) => {
    console.log("Processing response:", result);

    switch (result.intrrupted_name) {
      case "user__confirmation":
        setUserInfo(result.message);
        setUiState("user_interrupt");
        break;
      case "amount_detail":
        console.log("Switching to amount input...");
        setUiState((prev) => (prev === "amount_interrupt" ? "amount_interrupt " : "amount_interrupt")); // Force re-render
        break;
      case "needmobile":
        setUiState("number_interrupt");
        break;
      case "final_result":
        setUserInfo(result.message);
        setUiState("final_result");
        break;
      default:
        setNotification(result.message);
        setUiState("user_interrupt");
        break;
    }
  };

  const resetUiState = () => {
    setUiState("input");
    setUserInfo(null);
    setQuery("");
    setAmount("");
    setMobileNumber("");
  };

  return (
    <div style={{ maxWidth: "500px", margin: "auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h1>Transaction Process</h1>

      {notification && <p style={{ color: "red" }}>{notification}</p>}
      <p>Current UI State: {uiState}</p> {/* Debugging UI State */}

      {uiState === "input" && (
        <div>
          <input
            type="text"
            placeholder="Enter your request"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ padding: "5px", marginRight: "10px" }}
          />
          <button onClick={handleStartProcess}>Start Process</button>
        </div>
      )}

      {uiState === "user_interrupt" && (
        <div>
          <p>{userInfo}</p>
          <button onClick={() => handleConfirmSubmit("yes")}>Yes</button>
          <button onClick={() => handleConfirmSubmit("no")}>No</button>
        </div>
      )}

      {uiState === "amount_interrupt" && (
        <div>
          <p>Please enter the amount to send:</p>
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            style={{ padding: "5px", marginRight: "10px" }}
          />
          <button onClick={() => handleConfirmSubmit(amount)}>Submit Amount</button>
        </div>
      )}

      {uiState === "number_interrupt" && (
        <div>
          <p>Please enter your mobile number:</p>
          <input
            type="text"
            placeholder="Enter mobile number"
            value={mobileNumber}
            onChange={(e) => setMobileNumber(e.target.value)}
            style={{ padding: "5px", marginRight: "10px" }}
          />
          <button onClick={() => handleConfirmSubmit(mobileNumber)}>Submit Number</button>
        </div>
      )}

      {uiState === "final_result" && userInfo && typeof userInfo === "object" && (
        <div>
          <h2>Transaction Summary</h2>
          <p><strong>Amount Sent:</strong> {userInfo.amount}</p>
          <p><strong>Current Balance:</strong> {userInfo.current_balance}</p>

          <h3>Sender Details:</h3>
          <pre>{JSON.stringify(userInfo.sender_details, null, 2)}</pre>

          <h3>Receiver Details:</h3>
          <pre>{JSON.stringify(userInfo.receiver_details, null, 2)}</pre>

          <p><strong>Transaction Status:</strong> 
            <span style={{ color: userInfo.final_result === "success" ? "green" : "red", fontWeight: "bold" }}>
              {String(userInfo.final_result)}
            </span>
          </p>
        </div>
      )}

      {uiState === "final_result" && (
        <button onClick={resetUiState} style={{ marginTop: "10px" }}>Start New Transaction</button>
      )}
    </div>
  );
};

export default BankApp;
