"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { motion, AnimatePresence } from "framer-motion"
import { Send, DollarSign, Phone, User, RefreshCw } from "lucide-react"

import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "../components/ui/card"
import NavBar from "./NavBar"
import PopupCard from "./PopupCard"
import CurrencyTransfer from "./CurrencyTransfer"

const FASTAPI_URL = "http://localhost:8000" 

const BankApp = () => {
  const [query, setQuery] = useState("")
  const [amount, setAmount] = useState("")
  const [mobileNumber, setMobileNumber] = useState("")
  const [userInfo, setUserInfo] = useState(null)
  const [uiState, setUiState] = useState("input")
  const [notification, setNotification] = useState("")

  // Debugging: Log UI state changes
  useEffect(() => {
    console.log("UI State Updated:", uiState)
  }, [uiState])

  const handleStartProcess = async () => {
    if (!query) {
      setNotification("Please enter a request to proceed.")
      return
    }

    try {
      console.log("Sending request to backend...")
      const response = await axios.post(`${FASTAPI_URL}/start`, { data: [query] })
      console.log("Backend response:", response.data)
      processResponse(response.data)
    } catch (error) {
      setNotification("Failed to connect to the backend.")
      console.error("Error:", error)
    }
  }

  const handleConfirmSubmit = async (data) => {
    try {
      console.log("Submitting confirmation:", data)
      const response = await axios.post(`${FASTAPI_URL}/confirm`, { data: [data] })
      console.log("Backend response:", response.data)
      processResponse(response.data)
    } catch (error) {
      setNotification("Failed to connect to the backend.")
      console.error("Error:", error)
    }
  }

  const processResponse = (result) => {
    console.log("Processing response:", result)

    switch (result.intrrupted_name) {
      case "user__confirmation":
        console.log(result.message)
        setUserInfo(result.message)
        setUiState("user_interrupt")
        break
      case "amount_detail":
        console.log("Switching to amount input...")
        setUiState("amount_interrupt")
        break
      case "needmobile":
        console.log("hiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii")
        setUserInfo(result.message)
        console.log(result.message)
        setUiState("number_interrupt")
        break
      case "final_result":
        setUserInfo(result.message)
        setUiState("final_result")
        break
      default:
        setNotification(result.message)
        setUiState("user_interrupt")
        break
    }
  }

  const resetUiState = () => {
    setUiState("input")
    setUserInfo(null)
    setQuery("")
    setAmount("")
    setMobileNumber("")
  }


  return (
    <div className="min-h-screen bg-cover bg-center flex flex-col" style={{ backgroundImage: "url('/5968949.jpg')" }}>
      <NavBar />
      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl bg-white text-black border border-gray-200 shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Money Transfer Gen AI</CardTitle>
            <CardDescription className="text-center text-gray-600">Secure and easy money transfers</CardDescription>
          </CardHeader>
          <CardContent>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3 bg-red-100 text-red-800 rounded-md"
              >
                {notification}
              </motion.div>
            )}

            {uiState === "input" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                <div className="flex items-center">
                  <Input
                    type="text"
                    placeholder="Enter your request"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full bg-white text-black border-gray-300 focus:border-black focus:ring-black"
                  />
                  <Button
                    onClick={handleStartProcess}
                    className="group ml-2 h-10 flex items-center justify-center bg-black hover:bg-gray-800 transition-colors duration-300 rounded-r-md"
                  >
                    <Send className="h-6 w-6 text-white" />
                  </Button>
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {uiState === "user_interrupt" && (
                <PopupCard title="Confirmation" onClose={resetUiState}>
                  <p className="text-center text-black-300 mb-4">Can You Confirm the Receiver ?</p>
                  <p className="text-center text-gray-700 mb-6 font-medium">
                    <div className="flex mb-3">
                      <span className="text-lg font-semibold text-black-600">Name:</span>
                      <span className="text-l text-gray-900 ml-2">{userInfo[1]}</span>
                    </div>

                    <div className="flex mb-3">
                      <span className="text-lg font-semibold text-black-600">Address:</span>
                      <span className="text-l text-gray-900 ml-2">{userInfo[2]}</span>
                    </div>

                    <div className="flex mb-3">
                      <span className="text-lg font-semibold text-black-600">Number:</span>
                      <span className="text-l text-gray-900 ml-2">{userInfo[3]}</span>
                    </div>

                    <div className="flex mb-3">
                      <span className="text-lg font-semibold text-black-600">Bank:</span>
                      <span className="text-l text-gray-900 ml-2">{userInfo[4]}</span>
                    </div>
                  </p>

                  <div className="flex justify-center space-x-4">
                    <Button onClick={() => handleConfirmSubmit("yes")} variant="outline">
                      Yes
                    </Button>
                    <Button onClick={() => handleConfirmSubmit("no")} variant="outline">
                      No
                    </Button>
                  </div>
                </PopupCard>
              )}

              {uiState === "amount_interrupt" && (
                <PopupCard title="Enter Amount" onClose={resetUiState}>
                  <div className="space-y-4">
                    <p className="text-center text-black-300">You Don't Mention any amount can you mention amount please ?</p>
                    <div className="flex items-center">
                      <DollarSign className="text-gray-300 mr-2" />
                      <Input
                        type="number"
                        placeholder="Enter amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="w-full bg-white-800 text-black border-gray-600"
                      />
                    </div>
                    <Button onClick={() => handleConfirmSubmit(amount)} className="w-full">
                      Submit Amount
                    </Button>
                  </div>
                </PopupCard>
              )}

              {uiState === "number_interrupt" && (
                <PopupCard title="Enter Mobile Number" onClose={resetUiState}>
                  <div className="space-y-4">
                    <p className="text-center text-black-300">The Person Name not Found can you mention the number of the person:</p>
                    <div className="flex items-center">
                      <Phone className="text-gray-300 mr-2" />
                      <Input
                        type="number"
                        placeholder="Enter mobile number"
                        value={mobileNumber}
                        onChange={(e) => setMobileNumber(e.target.value)}
                        className="w-full bg-white-800 text-black border-gray-600"
                      />
                    </div>
                    <Button onClick={() => handleConfirmSubmit(mobileNumber)} className="w-full">
                      Submit Number
                    </Button>
                  </div>
                </PopupCard>
              )}
            </AnimatePresence>

            {uiState === "final_result" && userInfo && typeof userInfo === "object" && (
              <CurrencyTransfer userInfo={userInfo} resetUiState={resetUiState} />
            )}
          </CardContent>
          <CardFooter></CardFooter>
        </Card>
      </div>
    </div>
  )
}

export default BankApp

