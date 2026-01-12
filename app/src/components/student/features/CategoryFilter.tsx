import { categoryIcons } from "@/lib/dashboard-utils"
import { Coffee, Grid3x3 } from "lucide-react"

interface CategoryFilterProps {
  categories: string[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory }: CategoryFilterProps) {
  return (
    <div className="mb-6 md:mb-8">
      <h3 className="text-xl md:text-2xl font-bold mb-4 text-gray-800">Category</h3>
      <div className="flex flex-wrap gap-3 md:gap-4 justify-start">
        {/* All Category Button */}
        <div className="flex flex-col items-center gap-2">
          <div
            onClick={() => onSelectCategory("All")}
            className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${
              selectedCategory === "All"
                ? "bg-emerald-600 border-emerald-600"
                : "bg-white border-emerald-500 hover:bg-emerald-50"
            }`}
          >
            <Grid3x3
              className={`w-6 h-6 md:w-7 md:h-7 ${selectedCategory === "All" ? "text-white" : "text-emerald-600"}`}
            />
          </div>
          <span
            className={`text-xs md:text-sm font-medium ${selectedCategory === "All" ? "text-gray-900" : "text-gray-700"}`}
          >
            All
          </span>
        </div>

        {/* Other Categories */}
        {categories
          .filter((cat) => cat !== "All")
          .map((category) => {
            const Icon = categoryIcons[category] || Coffee
            return (
              <div key={category} className="flex flex-col items-center gap-2">
                <div
                  onClick={() => onSelectCategory(category)}
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl border-2 flex items-center justify-center transition-all cursor-pointer ${
                    selectedCategory === category
                      ? "bg-emerald-600 border-emerald-600"
                      : "bg-white border-emerald-500 hover:bg-emerald-50"
                  }`}
                >
                  <Icon
                    className={`w-6 h-6 md:w-7 md:h-7 ${selectedCategory === category ? "text-white" : "text-emerald-600"}`}
                  />
                </div>
                <span
                  className={`text-xs md:text-sm font-medium ${selectedCategory === category ? "text-gray-900" : "text-gray-700"}`}
                >
                  {category}
                </span>
              </div>
            )
          })}
      </div>
    </div>
  )
}
