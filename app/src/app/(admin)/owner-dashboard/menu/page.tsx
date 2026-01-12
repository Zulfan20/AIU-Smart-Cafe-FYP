"use client"

import { useState, useEffect } from "react"
import { Plus, Pencil, Trash2, Image as ImageIcon, Upload, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface MenuItem {
  _id: string
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  isAvailable: boolean
}

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("All")
  
  // NEW: Track which item is being edited (null = create mode)
  const [editingId, setEditingId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    category: "Main Course",
    imageUrl: "",
    isAvailable: true,
  })

  // 1. FETCH MENU
  const fetchMenu = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/menu?maxPrice=1000") 
      const data = await res.json()
      setItems(data)
    } catch (error) {
      console.error("Failed to fetch menu", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMenu()
  }, [])

  // Filtered items based on search and category
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || item.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const categories = ["All", "Main Course", "Drink", "Side"]

  // 2. RESET FORM HELPER
  const resetForm = () => {
    setFormData({ 
        name: "", 
        description: "", 
        price: "", 
        category: "Main Course", 
        imageUrl: "", 
        isAvailable: true 
    })
    setEditingId(null) // Reset edit mode
  }

  // 3. HANDLE OPEN DIALOG (Create vs Edit)
  const handleOpenChange = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
        resetForm() // Clean up when closing
    }
  }

  const handleEdit = (item: MenuItem) => {
    setEditingId(item._id) // Set ID so we know we are updating
    setFormData({
        name: item.name,
        description: item.description || "",
        price: item.price.toString(), // Convert number back to string for input
        category: item.category,
        imageUrl: item.imageUrl || "",
        isAvailable: item.isAvailable
    })
    setIsDialogOpen(true) // Open the modal
  }

  // 4. HANDLE SUBMIT (Create OR Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token")

    if (!token) {
      alert("Admin session expired. Please log in again.")
      setIsSubmitting(false)
      return
    }

    try {
      // Determine URL and Method based on editingId
      const url = editingId 
        ? `/api/admin/menu/${editingId}` // Update URL
        : "/api/admin/menu"              // Create URL
      
      const method = editingId ? "PUT" : "POST"

      const res = await fetch(url, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price)
        })
      })

      if (!res.ok) throw new Error("Failed to save item")

      setIsDialogOpen(false)
      fetchMenu() 
      resetForm()
      
    } catch (error) {
      alert("Error saving item. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Image Upload Handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, imageUrl: reader.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  // Delete Handler
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token")

    if (!token) {
      alert("Admin session expired. Please log in again.")
      return
    }
    try {
      const res = await fetch(`/api/admin/menu/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      })
      if (res.ok) fetchMenu()
    } catch (error) {
      console.error("Delete failed", error)
    }
  }

  const toggleAvailability = async (item: MenuItem) => {
    const token = localStorage.getItem("adminToken") || localStorage.getItem("token")
    const newStatus = !item.isAvailable
    setItems(items.map(i => i._id === item._id ? { ...i, isAvailable: newStatus } : i))

    if (!token) {
      alert("Admin session expired. Please log in again.")
      fetchMenu()
      return
    }

    try {
      await fetch(`/api/admin/menu/${item._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ isAvailable: newStatus })
      })
    } catch (error) {
      fetchMenu()
    }
  }

  return (
    <div className="p-8 space-y-6 bg-gray-50/50 min-h-screen">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900">Menu Management</h2>
          <p className="text-gray-500 mt-1">Add, edit, or remove items from the student menu.</p>
        </div>
        
        {/* ADD ITEM DIALOG */}
        <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
          <DialogTrigger asChild>
            <Button className="bg-teal-600 hover:bg-teal-700" onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" /> Add New Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Menu Item" : "Add New Menu Item"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input 
                    required 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={(val) => setFormData({...formData, category: val})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Main Course">Main Course</SelectItem>
                      <SelectItem value="Drink">Drink</SelectItem>
                      <SelectItem value="Snack">Snack</SelectItem>
                      <SelectItem value="Side">Side</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea 
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Price (RM)</Label>
                  <Input 
                    type="number" 
                    step="0.01" 
                    required 
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Item Image</Label>
                  <Input type="file" accept="image/*" onChange={handleImageUpload} />
                </div>
              </div>

              {formData.imageUrl && (
                <div className="relative w-full h-40 bg-gray-100 rounded-lg overflow-hidden border">
                  <img src={formData.imageUrl} alt="Preview" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-6 w-6"
                    onClick={() => setFormData({ ...formData, imageUrl: "" })}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <DialogFooter>
                <Button type="submit" disabled={isSubmitting} className="bg-teal-600">
                  {isSubmitting ? "Saving..." : (editingId ? "Update Item" : "Save Item")}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Category Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search menu items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {/* Category Filter */}
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((cat) => (
              <SelectItem key={cat} value={cat}>{cat}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Results Info */}
      <div className="text-sm text-gray-500">
        Showing {filteredItems.length} of {items.length} items
      </div>

      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No items found matching your criteria.</p>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
          <Card key={item._id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all">
            <div className="h-40 bg-gray-200 relative">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-400">
                        <ImageIcon className="h-10 w-10" />
                    </div>
                )}
                <div className="absolute top-2 right-2">
                    <Badge className={item.isAvailable ? "bg-emerald-500" : "bg-red-500"}>
                        {item.isAvailable ? "Available" : "Sold Out"}
                    </Badge>
                </div>
            </div>
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                    <span className="font-bold text-emerald-700">RM {item.price.toFixed(2)}</span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2 mb-4 h-10">
                    {item.description}
                </p>
                
                <div className="flex items-center justify-between pt-4 border-t">
                    <div className="flex items-center gap-2">
                        <Switch 
                            checked={item.isAvailable} 
                            onCheckedChange={() => toggleAvailability(item)}
                        />
                        <span className="text-xs text-gray-500">Stock</span>
                    </div>
                    <div className="flex gap-2">
                        {/* EDIT BUTTON */}
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-gray-500 hover:text-blue-600"
                            onClick={() => handleEdit(item)} // <--- CONNECTED HERE!
                        >
                            <Pencil className="h-4 w-4" />
                        </Button>
                        {/* DELETE BUTTON */}
                        <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-8 w-8 text-gray-500 hover:text-red-600"
                            onClick={() => handleDelete(item._id)}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </div>
  )
}