"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Card, CardContent, CardFooter } from "../components/ui/card"
import { Button } from "../components/ui/button"
import { RefreshCw, User } from "lucide-react"

const draw = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: {
        delay: i * 0.2,
        type: "spring",
        duration: 1.5,
        bounce: 0.2,
        ease: "easeInOut",
      },
      opacity: { delay: i * 0.2, duration: 0.2 },
    },
  }),
}

function Checkmark({ size = 100, strokeWidth = 2, color = "currentColor", className = "" }) {
  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      initial="hidden"
      animate="visible"
      className={className}
    >
      <title>Animated Checkmark</title>
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        stroke={color}
        variants={draw}
        custom={0}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          fill: "transparent",
        }}
      />
      <motion.path
        d="M30 50L45 65L70 35"
        stroke={color}
        variants={draw}
        custom={1}
        style={{
          strokeWidth,
          strokeLinecap: "round",
          strokeLinejoin: "round",
          fill: "transparent",
        }}
      />
    </motion.svg>
  )
}

export default function CurrencyTransfer({ userInfo, resetUiState }) {
  return (
    <Card className="w-full max-w-xl mx-auto p-6 min-h-[300px] flex flex-col justify-center bg-zinc-900 dark:bg-white border-zinc-800 dark:border-zinc-200 backdrop-blur-sm">
      <CardContent className="space-y-4 flex flex-col items-center justify-center">
        <motion.div
          className="flex justify-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{
            duration: 0.4,
            ease: [0.4, 0, 0.2, 1],
            scale: {
              type: "spring",
              damping: 15,
              stiffness: 200,
            },
          }}
        >
          <div className="relative">
            <motion.div
              className="absolute inset-0 blur-xl bg-emerald-500/10 dark:bg-emerald-500/20 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{
                delay: 0.2,
                duration: 0.8,
                ease: "easeOut",
              }}
            />
            <Checkmark
              size={80}
              strokeWidth={4}
              color="rgb(16 185 129)"
              className="relative z-10 dark:drop-shadow-[0_0_10px_rgba(0,0,0,0.1)]"
            />
          </div>
        </motion.div>
        <motion.div
          className="space-y-2 text-center w-full"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            delay: 0.2,
            duration: 0.6,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          <motion.h2
            className="text-lg text-zinc-100 dark:text-zinc-900 tracking-tighter font-semibold uppercase"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.4 }}
          >
            Transfer Successful
          </motion.h2>
          <motion.div
            className="space-y-4 mt-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.4 }}
          >
            <div className="bg-zinc-800/50 dark:bg-zinc-50/50 rounded-xl p-4 border border-zinc-700/50 dark:border-zinc-200/50 backdrop-blur-md">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Amount Sent</span>
                <span className="font-medium text-zinc-100 dark:text-zinc-900">${userInfo.amount} USD</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Current Balance</span>
                <span className="font-medium text-zinc-100 dark:text-zinc-900">${userInfo.current_balance} USD</span>
              </div>
            </div>
            <div className="bg-zinc-800/50 dark:bg-zinc-50/50 rounded-xl p-4 border border-zinc-700/50 dark:border-zinc-200/50 backdrop-blur-md">
              <h3 className="text-sm font-medium text-zinc-100 dark:text-zinc-900 mb-2 flex items-center">
                <User className="mr-2 h-4 w-4" /> Sender Details
              </h3>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Name:</span>
                  <span className="text-zinc-100 dark:text-zinc-900">{userInfo.sender_details[1]}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Number:</span>
                  <span className="text-zinc-100 dark:text-zinc-900">{userInfo.sender_details[3]}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Account:</span>
                  <span className="text-zinc-100 dark:text-zinc-900">{userInfo.sender_details[4]}</span>
                </p>
              </div>
            </div>
            <div className="bg-zinc-800/50 dark:bg-zinc-50/50 rounded-xl p-4 border border-zinc-700/50 dark:border-zinc-200/50 backdrop-blur-md">
              <h3 className="text-sm font-medium text-zinc-100 dark:text-zinc-900 mb-2 flex items-center">
                <User className="mr-2 h-4 w-4" /> Receiver Details
              </h3>
              <div className="space-y-1 text-sm">
                <p className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Name:</span>
                  <span className="text-zinc-100 dark:text-zinc-900">{userInfo.receiver_details[1]}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Address:</span>
                  <span className="text-zinc-100 dark:text-zinc-900">{userInfo.receiver_details[2]}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-zinc-500 dark:text-zinc-400">Mobile:</span>
                  <span className="text-zinc-100 dark:text-zinc-900">{userInfo.receiver_details[3]}</span>
                </p>
              </div>
            </div>
            <p className="text-center text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Transaction Status: </span>
              <span
                className={`font-medium ${userInfo.final_result === "success" ? "text-emerald-400" : "text-red-400"}`}
              >
                {userInfo.final_result.charAt(0).toUpperCase() + userInfo.final_result.slice(1)}
              </span>
            </p>
          </motion.div>
        </motion.div>
      </CardContent>
      <CardFooter className="mt-6">
        <Button
          onClick={resetUiState}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white dark:bg-emerald-600 dark:hover:bg-emerald-700 dark:text-white transition-colors duration-200"
        >
          <RefreshCw className="mr-2 h-4 w-4" /> Start New Transaction
        </Button>
      </CardFooter>
    </Card>
  )
}