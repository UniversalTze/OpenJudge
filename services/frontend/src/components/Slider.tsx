"use client"

import type React from "react"
import { Label } from "@/components/ui/label";
import { useState, useRef, useCallback, useEffect } from "react"

const skillLevels: {
  id: number
  value: "Beginner" | "Intermediate" | "Advanced"
}[] = [
  { id: 0, value: "Beginner" },
  { id: 1,  value: "Intermediate" },
  { id: 2, value: "Advanced" },
]

export default function SkillSlider({ skillLevel, setSkillLevel }: { skillLevel: "Beginner" | "Intermediate" | "Advanced"; setSkillLevel: (level: "Beginner" | "Intermediate" | "Advanced") => void }) {
  const [selectedLevel, setSelectedLevel] = useState(skillLevels.findIndex(level => level.value === skillLevel) || 0)
  const [isDragging, setIsDragging] = useState(false)
  const sliderRef = useRef<HTMLDivElement>(null)

  const handleSliderChange = (levelId: number) => {
    setSelectedLevel(levelId)
    setSkillLevel(skillLevels[levelId].value)
  }

  const getClosestLevel = useCallback((percentage: number) => {
    const step = 100 / (skillLevels.length - 1)
    return Math.round(percentage / step)
  }, [])

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    updateSliderPosition(e.clientX)
  }

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return
      updateSliderPosition(e.clientX)
    },
    [isDragging],
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const updateSliderPosition = (clientX: number) => {
    if (!sliderRef.current) return

    const rect = sliderRef.current.getBoundingClientRect()
    const percentage = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
    const closestLevel = getClosestLevel(percentage)
    setSelectedLevel(closestLevel)
    setSkillLevel(skillLevels[closestLevel].value)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove)
      document.addEventListener("mouseup", handleMouseUp)
      return () => {
        document.removeEventListener("mousemove", handleMouseMove)
        document.removeEventListener("mouseup", handleMouseUp)
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  return (
    <div className="w-full max-w-md mx-auto">
      <Label htmlFor="skill-slider">Skill Level</Label>
      <div className="relative mt-1 p-3" id="skill-slider">
        <div
          ref={sliderRef}
          className="relative h-2 bg-[#0f1629] rounded-full cursor-pointer"
          onMouseDown={handleMouseDown}
        >
          <div
            className="absolute h-2 bg-[#7152e0] rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${(selectedLevel / (skillLevels.length - 1)) * 100}%` }}
          />
          {skillLevels.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => handleSliderChange(level.id)}
              onMouseDown={(e) => e.stopPropagation()}
              className={`absolute top-1/2 w-4 h-4 rounded-full border-2 transform -translate-y-1/2 -translate-x-1/2 transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-[#7152e0] focus:ring-offset-2 cursor-pointer ${
                selectedLevel >= level.id
                  ? "bg-[#7152e0] border-[#7152e0] shadow-lg"
                  : "bg-gray-500 border-gray-500 hover:border-[#7152e0]"
              }`}
              style={{ left: `${(level.id / (skillLevels.length - 1)) * 100}%` }}
              aria-label={`Select ${level.value} skill level`}
            />
          ))}
        </div>
        <div className="flex justify-between mt-4 -m-2">
          {skillLevels.map((level) => (
            <button
              key={level.id}
              type="button"
              onClick={() => handleSliderChange(level.id)}
              className={`text-sm font-medium transition-colors duration-200 hover:text-[#7152e0] focus:outline-none focus:text-[#7152e0] ${
                selectedLevel === level.id ? "text-[#7152e0]" : "text-gray-500"
              }`}
            >
              {level.value}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
