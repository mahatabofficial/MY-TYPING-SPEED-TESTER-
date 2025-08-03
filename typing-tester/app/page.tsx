"use client"

import type React from "react"
import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils" // Assuming cn utility is available

const TEST_TEXT =
  "The quick brown fox jumps over the lazy dog. This is a classic pangram often used for typing tests because it contains every letter of the alphabet. Practice makes perfect, so keep typing to improve your speed and accuracy. Consistency is key to mastering touch typing. A journey of a thousand miles begins with a single step. The early bird catches the worm. All that glitters is not gold. When in Rome, do as the Romans do. Actions speak louder than words. Better late than never."

const TUTORIAL_LESSONS = [
  {
    title: "Home Row (ASDF JKL;)",
    text: "asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl; asdf jkl;",
  },
  {
    title: "Home Row (Full)",
    text: "asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl; asdfg hjkl;",
  },
  {
    title: "Top Row",
    text: "qwerty uiop qwerty uiop qwerty uiop qwerty uiop qwerty uiop qwerty uiop",
  },
  {
    title: "Bottom Row",
    text: "zxcvb nm,./ zxcvb nm,./ zxcvb nm,./ zxcvb nm,./ zxcvb nm,./ zxcvb nm,./",
  },
  {
    title: "All Letters",
    text: "abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz abcdefghijklmnopqrstuvwxyz",
  },
]

export default function TypingTester() {
  // Typing Test State
  const [testText, setTestText] = useState(TEST_TEXT)
  const [typedText, setTypedText] = useState("")
  const [startTime, setStartTime] = useState<number | null>(null)
  const [endTime, setEndTime] = useState<number | null>(null)
  const [timer, setTimer] = useState(0)
  const [wpm, setWpm] = useState(0)
  const [accuracy, setAccuracy] = useState(100)
  const [errors, setErrors] = useState(0)
  const [testStarted, setTestStarted] = useState(false)
  const [testFinished, setTestFinished] = useState(false)

  // Tutorial State
  const [activeTab, setActiveTab] = useState("tester") // 'tester' or 'tutorial'
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0)
  const [tutorialTypedText, setTutorialTypedText] = useState("")

  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const calculateResults = useCallback(() => {
    if (!startTime || !endTime) return

    const timeTakenSeconds = (endTime - startTime) / 1000
    if (timeTakenSeconds <= 0) {
      setWpm(0)
      setAccuracy(0)
      setErrors(0)
      return
    }

    let correctChars = 0
    let calculatedErrors = 0
    for (let i = 0; i < typedText.length; i++) {
      if (typedText[i] === testText[i]) {
        correctChars++
      } else {
        calculatedErrors++
      }
    }

    // WPM calculation: (correct characters / 5) / (time in minutes)
    const calculatedWpm = Math.round(correctChars / 5 / (timeTakenSeconds / 60))
    const calculatedAccuracy = typedText.length > 0 ? Math.round((correctChars / typedText.length) * 100) : 100

    setWpm(calculatedWpm)
    setAccuracy(calculatedAccuracy)
    setErrors(calculatedErrors)
  }, [startTime, endTime, typedText, testText])

  const resetTest = useCallback(() => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
    setTypedText("")
    setStartTime(null)
    setEndTime(null)
    setTimer(0)
    setWpm(0)
    setAccuracy(100)
    setErrors(0)
    setTestStarted(false)
    setTestFinished(false)
    textareaRef.current?.focus()
  }, [])

  const handleTyping = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const currentTypedText = e.target.value

      if (!testStarted && currentTypedText.length > 0) {
        setStartTime(Date.now())
        setTestStarted(true)
        timerIntervalRef.current = setInterval(() => {
          setTimer((prevTimer) => prevTimer + 1)
        }, 1000)
      }

      setTypedText(currentTypedText)

      if (currentTypedText.length === testText.length) {
        setEndTime(Date.now())
        setTestFinished(true)
        if (timerIntervalRef.current) {
          clearInterval(timerIntervalRef.current)
        }
      }
    },
    [testStarted, testText.length],
  )

  useEffect(() => {
    if (testFinished) {
      calculateResults()
    }
  }, [testFinished, calculateResults])

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [])

  const renderTestText = () => {
    return testText.split("").map((char, index) => {
      let colorClass = ""
      if (index < typedText.length) {
        if (typedText[index] === char) {
          colorClass = "text-green-600 dark:text-green-400"
        } else {
          colorClass = "text-red-600 dark:text-red-400"
        }
      }
      return (
        <span key={index} className={colorClass}>
          {char}
        </span>
      )
    })
  }

  // Tutorial Logic
  const currentLesson = TUTORIAL_LESSONS[currentLessonIndex]

  const handleTutorialTyping = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTutorialTypedText(e.target.value)
  }, [])

  const renderTutorialText = () => {
    return currentLesson.text.split("").map((char, index) => {
      let colorClass = ""
      if (index < tutorialTypedText.length) {
        if (tutorialTypedText[index] === char) {
          colorClass = "text-green-600 dark:text-green-400"
        } else {
          colorClass = "text-red-600 dark:text-red-400"
        }
      }
      return (
        <span key={index} className={colorClass}>
          {char}
        </span>
      )
    })
  }

  const goToNextLesson = () => {
    if (currentLessonIndex < TUTORIAL_LESSONS.length - 1) {
      setCurrentLessonIndex(currentLessonIndex + 1)
      setTutorialTypedText("")
    }
  }

  const goToPreviousLesson = () => {
    if (currentLessonIndex > 0) {
      setCurrentLessonIndex(currentLessonIndex - 1)
      setTutorialTypedText("")
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-slate-50 dark:bg-gray-950 p-4 sm:p-6">
      <h1 className="text-4xl sm:text-5xl font-extrabold mb-8 text-gray-900 dark:text-gray-50 tracking-tight">
        Typing Master
      </h1>

      <div className="flex space-x-2 mb-8 bg-gray-200 dark:bg-gray-800 p-1 rounded-full shadow-inner">
        <Button
          onClick={() => {
            setActiveTab("tester")
            resetTest() // Reset test when switching back to tester
          }}
          className={cn(
            "px-6 py-2 rounded-full text-lg font-semibold transition-colors duration-200",
            activeTab === "tester"
              ? "bg-gray-800 text-white shadow-md dark:bg-gray-700"
              : "bg-transparent text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700",
          )}
        >
          Typing Speed Tester
        </Button>
        <Button
          onClick={() => {
            setActiveTab("tutorial")
            setTutorialTypedText("") // Reset tutorial input when switching
          }}
          className={cn(
            "px-6 py-2 rounded-full text-lg font-semibold transition-colors duration-200",
            activeTab === "tutorial"
              ? "bg-gray-800 text-white shadow-md dark:bg-gray-700"
              : "bg-transparent text-gray-700 hover:bg-gray-300 dark:text-gray-300 dark:hover:bg-gray-700",
          )}
        >
          Typing Tutorial
        </Button>
      </div>

      {activeTab === "tester" && (
        <Card className="w-full max-w-3xl shadow-xl rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardHeader className="pb-4 px-6 pt-6">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">Typing Speed Tester</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <Button
              variant="outline"
              className="w-full py-2 text-base border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 shadow-sm"
            >
              Load Custom Text
            </Button>

            <div className="relative p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-lg leading-relaxed font-mono text-gray-800 dark:text-gray-200 min-h-[150px] overflow-hidden shadow-inner">
              {renderTestText()}
            </div>

            <Textarea
              ref={textareaRef}
              value={typedText}
              onChange={handleTyping}
              placeholder="Start typing here..."
              disabled={testFinished}
              className="w-full p-4 text-lg rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none shadow-sm"
              rows={6}
            />

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center mt-6">
              <Card className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-100">{wpm}</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">WPM</div>
              </Card>
              <Card className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-100">{accuracy}%</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Accuracy</div>
              </Card>
              <Card className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-100">{errors}</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Errors</div>
              </Card>
              <Card className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="text-4xl font-bold text-gray-800 dark:text-gray-100">{formatTime(timer)}</div>
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Time</div>
              </Card>
            </div>

            <Button
              onClick={resetTest}
              className="w-full py-3 text-lg bg-gray-800 hover:bg-gray-900 text-white dark:bg-gray-700 dark:hover:bg-gray-600 rounded-lg shadow-md"
            >
              Reset
            </Button>
          </CardContent>
        </Card>
      )}

      {activeTab === "tutorial" && (
        <Card className="w-full max-w-3xl shadow-xl rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <CardHeader className="pb-4 px-6 pt-6">
            <CardTitle className="text-2xl font-bold text-gray-800 dark:text-gray-100">
              Typing Tutorial: {currentLesson.title}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            <div className="relative p-6 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 text-lg leading-relaxed font-mono text-gray-800 dark:text-gray-200 min-h-[100px] overflow-hidden shadow-inner">
              {renderTutorialText()}
            </div>

            <Textarea
              value={tutorialTypedText}
              onChange={handleTutorialTyping}
              placeholder="Type the lesson text here..."
              className="w-full p-4 text-lg rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 resize-none shadow-sm"
              rows={4}
            />

            <div className="flex justify-between space-x-4">
              <Button
                onClick={goToPreviousLesson}
                disabled={currentLessonIndex === 0}
                className="px-6 py-2 text-base bg-gray-700 hover:bg-gray-800 text-white dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg shadow-md"
              >
                Previous Lesson
              </Button>
              <Button
                onClick={goToNextLesson}
                disabled={currentLessonIndex === TUTORIAL_LESSONS.length - 1}
                className="px-6 py-2 text-base bg-gray-700 hover:bg-gray-800 text-white dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg shadow-md"
              >
                Next Lesson
              </Button>
            </div>
            {tutorialTypedText.length === currentLesson.text.length && (
              <p className="text-center text-lg font-semibold text-green-600 dark:text-green-400 mt-4">
                Lesson Complete!
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
