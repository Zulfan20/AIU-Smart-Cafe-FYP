# AIU Smart Cafe - System Implementation Documentation
**Final Year Project - Implementation Report**  
**Date:** January 23, 2026

---

## Table of Contents
1. [Authentication System](#1-authentication-system)
2. [Student Interface](#2-student-interface)
3. [Owner/Admin Dashboard](#3-owneradmin-dashboard)
4. [AI/ML Integration](#4-aiml-integration)

---

## 1. Authentication System

### 1.1 Login Page (`/login`)
**Purpose:** Provides secure authentication for students to access the cafe ordering system.

**Features:**
- Email and password authentication with validation
- JWT token-based session management
- Form validation with error messages
- Automatic redirect to student dashboard upon successful login
- "Remember Me" functionality
- Link to registration page for new users
- Responsive design for mobile and desktop

**Screenshot Guide:** Capture the login form showing email/password fields, submit button, and link to register page.

---

### 1.2 Registration Page (`/register`)
**Purpose:** Allows new students to create an account to use the cafe system.

**Features:**
- New user registration form with fields:
  - Full Name
  - Email (validated format)
  - Student ID
  - Phone Number
  - Password (with strength indicator)
  - Confirm Password
- Real-time form validation
- Duplicate email detection
- Automatic login after successful registration
- Terms and conditions acceptance
- Link back to login page

**Screenshot Guide:** Capture the registration form with all input fields visible, showing validation states.

---

### 1.3 Admin Login Page (`/admin/login`)
**Purpose:** Separate secure login portal for cafe owners/administrators.

**Features:**
- Admin-specific authentication
- Enhanced security with admin-only JWT tokens
- Different dashboard redirect (owner-dashboard)
- Admin role verification
- Session timeout management

**Screenshot Guide:** Capture admin login interface, highlighting the distinction from student login.

---

## 2. Student Interface

### 2.1 Student Dashboard - Main Page (`/student-dashboard`)
**Purpose:** Central hub for students to browse menu, place orders, and manage their cafe experience.

#### 2.1.1 Header Navigation
**Features:**
- **Logo & Branding:** AIU Smart Cafe logo with tagline
- **Search Bar:** Text search for menu items with real-time filtering
  - Search by item name or description
  - Instant results as you type
- **Visual Search Button:** Camera icon to trigger image-based food search
- **Price Filter Dropdown:** Filter menu by price ranges:
  - All Prices
  - Under RM 5
  - RM 5 - RM 10
  - RM 10 - RM 15
  - Above RM 15
- **Shopping Cart Button:** Shows cart item count badge
- **Profile Button:** Access user profile and settings
- **Logout Button:** Secure logout with session clearing

**Screenshot Guide:** Capture full header showing all navigation elements, search bar, and action buttons.

---

#### 2.1.2 Cafe Status Banner
**Purpose:** Real-time display of cafe operational status.

**Features:**
- **Open/Closed Status:** Visual indicator (green for open, red for closed)
- **Operating Hours:** Display current operating hours (e.g., "08:00 AM - 05:00 PM")
- **Live Time Display:** Current time updated in real-time
- **Status Message:** Clear text indicating if ordering is available
- **Automatic Status Updates:** Refreshes every minute to check cafe status

**Screenshot Guide:** Capture both open and closed states of the cafe status banner.

---

#### 2.1.3 Active Orders Card (Authenticated Users Only)
**Purpose:** Shows real-time status of user's current orders.

**Features:**
- **Order Status Tracking:**
  - Pending: Order received, awaiting cafe acceptance
  - Preparing: Cafe is preparing your order
  - Ready: Order ready for pickup
  - Completed: Order has been picked up
  - Rejected: Order was declined (with reason if provided)
- **Order Details Display:**
  - Order number (last 4 digits of order ID)
  - List of items with quantities
  - Total amount
  - Order placement time
  - Estimated pickup time (if available)
- **Status Icons:** Visual indicators for each order status with color coding
- **Mark as Picked Up Button:** Students can confirm order pickup when ready
- **Give Feedback Button:** Appears when order status is "Ready", allows rating and review
- **Order Carousel:** Navigate between multiple active orders with arrow buttons
- **View Order History Link:** Access to complete order history

**Screenshot Guide:** 
- Capture order card showing "Pending" status
- Capture order card showing "Preparing" status
- Capture order card showing "Ready" status with feedback button
- Capture multiple orders in carousel view

---

#### 2.1.4 Category Filter
**Purpose:** Quick navigation to filter menu items by food category.

**Features:**
- **Category Chips:** Horizontally scrollable category buttons
  - All (shows all items)
  - Main Course
  - Drinks
  - Desserts
  - Snacks
  - Side Dishes
- **Active Category Highlighting:** Selected category has distinct styling
- **Item Count Display:** Shows number of items in each category
- **Mobile-Responsive:** Horizontal scroll on mobile, full display on desktop

**Screenshot Guide:** Capture the category filter bar with different categories selected.

---

#### 2.1.5 Menu Items Grid
**Purpose:** Main display area for browsing available menu items.

**Features:**
- **Responsive Grid Layout:**
  - Mobile: 2 columns
  - Tablet: 2-3 columns
  - Desktop: 4 columns
- **Menu Item Card Components:**
  - High-quality food image with fallback placeholder
  - Item name and description
  - Price display (RM format)
  - Category badge
  - Average rating stars (1-5 scale)
  - Number of reviews count
  - "Add to Cart" button with cart icon
  - "View Reviews" link to see customer feedback
  - Availability indicator (grayed out if unavailable)
- **"Show More" / "Show Less" Button:**
  - Initially shows 6 items
  - Expands to show all items when clicked
  - Shows count of hidden items (e.g., "See More (8 more items)")
- **Real-Time Filtering:** Updates based on search query, category, and price range
- **Empty State:** Displays message when no items match filters

**Screenshot Guide:**
- Capture full menu grid with at least 8 items visible
- Capture individual menu item card in detail showing all elements
- Capture "Show More" button and expanded view
- Capture filtered view with category selected

---

#### 2.1.6 Recommended Items Section (Authenticated Users with Order History)
**Purpose:** AI-powered personalized recommendations based on user's purchase history.

**Features:**
- **Personalization:** Uses collaborative filtering ML model
- **Smart Display Logic:**
  - Only shown to logged-in users
  - Only shown if user has previous orders
  - Hidden for new users (cold start problem solved)
- **Recommendation Card:**
  - "⭐ Recommended for You" header
  - "AI-powered meal suggestions" subtitle
  - Shows top 3 recommended items
  - Each item displays: name, price, rating, "Add to Cart" button
- **Compact Design:** Sidebar on desktop, full-width card on mobile
- **Real-Time Updates:** Refreshes when user places new orders

**Screenshot Guide:**
- Capture recommendations section for existing user with purchase history
- Capture absence of recommendations section for new user
- Show desktop sidebar placement vs mobile full-width placement

---

#### 2.1.7 Best Sellers Section
**Purpose:** Highlights the most popular items among all customers.

**Features:**
- **Popularity Algorithm:** Based on:
  - Total number of orders
  - Order frequency
  - Recent popularity trends
- **"🏆 Best Sellers" Header:** Trophy emoji with prominent title
- **Subtitle:** "Most loved by our customers"
- **Display Format:**
  - Shows top 3-5 best-selling items
  - Same card format as regular menu items
  - Special "Best Seller" badge
- **Universal Display:** Shown to both logged-in and guest users
- **Full-Width Layout:** Displays below menu items for maximum visibility

**Screenshot Guide:** Capture best sellers section showing multiple popular items with badges.

---

#### 2.1.8 Visual Search Feature
**Purpose:** AI-powered image recognition to identify food categories from photos.

**Features:**
- **Access Methods:**
  - Camera icon button in header
  - Opens as slide-in panel from right side
- **Image Upload Options:**
  - Click to upload from device
  - Drag and drop support
  - Mobile: Direct camera capture option
- **AI Processing:**
  - Uses Vision Transformer (ViT) model
  - Recognizes 8 food categories
  - Provides confidence score
  - Processing time: ~2-3 seconds
- **Results Display:**
  - Shows predicted food category
  - Displays confidence percentage
  - Lists all matching menu items from that category
  - Each result has "Add to Cart" button
- **User Feedback:**
  - Loading animation during processing
  - Success/error messages
  - Image preview before submission
- **Clear/Retry Option:** Search another image button

**Screenshot Guide:**
- Capture visual search panel closed (camera button visible)
- Capture image upload interface
- Capture image being processed (loading state)
- Capture search results showing predicted category and matched items
- Capture mobile camera capture option

---

#### 2.1.9 Shopping Cart Dialog
**Purpose:** Review and manage items before placing order.

**Features:**
- **Cart Summary Display:**
  - List of all cart items with images
  - Item name and price
  - Quantity selectors (+/- buttons)
  - Remove item button (trash icon)
  - Individual item subtotals
- **Cart Calculations:**
  - Subtotal (sum of all items)
  - Tax calculation (if applicable)
  - Total amount in bold
- **Empty Cart State:** Shows message when cart is empty
- **Order Instructions Field:**
  - Optional text area for special requests
  - Placeholder: "Any special instructions? (e.g., extra ice, no sugar)"
  - Character limit: 200 characters
- **Place Order Button:**
  - Validates cafe status before submission
  - Disabled if cafe is closed
  - Shows loading state during submission
- **Cart Persistence:** Saves to localStorage, persists across sessions
- **Item Count Badge:** Shows on cart button in header

**Screenshot Guide:**
- Capture empty cart state
- Capture cart with 3-4 different items
- Capture quantity adjustment controls
- Capture order instructions field filled
- Capture cart total calculation breakdown

---

#### 2.1.10 Order History Dialog
**Purpose:** View complete order history with detailed information.

**Features:**
- **Order List Display:**
  - Sorted by date (newest first)
  - Shows all orders (Pending, Preparing, Ready, Completed, Rejected)
- **Order Information:**
  - Order ID (shortened)
  - Date and time of order
  - Status badge with color coding
  - Items list with quantities
  - Total amount
  - Payment status
- **Status Filtering:** Filter by order status
- **Date Range Selection:** View orders from specific time periods
- **Order Details Expansion:** Click to see full order details
- **Feedback Status:** Shows which items have been reviewed
- **Empty State:** Message when no orders found

**Screenshot Guide:**
- Capture order history with multiple orders
- Capture order details expanded view
- Capture different order statuses visible
- Capture empty order history state

---

#### 2.1.11 Feedback/Review Dialog
**Purpose:** Collect customer ratings and reviews for completed orders.

**Features:**
- **Triggered When:** Order status changes to "Ready"
- **Multi-Item Feedback:**
  - Separate rating for each item in the order
  - 5-star rating system per item
  - Individual text review per item (optional)
- **Rating Interface:**
  - Visual star icons (clickable)
  - Hover effects showing rating value
  - Selected stars highlighted in gold
- **Text Review Field:**
  - Optional comment box per item
  - Placeholder: "Share your thoughts about this item..."
  - Character limit: 500 characters
  - Supports emoji
- **Sentiment Analysis:**
  - Reviews are automatically analyzed by AI
  - Classified as Positive, Neutral, or Negative
  - Sentiment score calculated (0-1)
  - Results stored but not shown to user (for admin analytics)
- **Submit Process:**
  - Validates at least star rating for each item
  - Shows success confirmation
  - Updates order to show feedback submitted
  - Prevents duplicate feedback
- **Skip Option:** Can close without submitting (feedback remains available)

**Screenshot Guide:**
- Capture feedback dialog for single item order
- Capture feedback dialog for multi-item order
- Capture star rating interaction
- Capture text review being written
- Capture success confirmation message

---

#### 2.1.12 Reviews Display Dialog
**Purpose:** View all customer reviews for a specific menu item.

**Features:**
- **Triggered By:** Clicking "View Reviews" on any menu item card
- **Review Summary:**
  - Average rating (1-5 stars, to 1 decimal)
  - Total number of reviews
  - Rating distribution chart (5★, 4★, 3★, 2★, 1★)
- **Individual Reviews Display:**
  - Reviewer name and profile picture
  - Star rating
  - Review text
  - Date posted
  - Sentiment badge (Positive/Neutral/Negative)
- **Sorting Options:**
  - Most Recent
  - Highest Rating
  - Lowest Rating
  - Most Helpful
- **Pagination:** Load more reviews (10 per page)
- **Empty State:** Message when no reviews exist yet

**Screenshot Guide:**
- Capture review summary with rating distribution
- Capture multiple individual reviews
- Capture review with positive sentiment badge
- Capture empty reviews state

---

#### 2.1.13 Profile Management Dialog
**Purpose:** View and edit user profile information.

**Features:**
- **Profile Information Display:**
  - Profile picture with upload option
  - Full name
  - Email address (read-only)
  - Student ID
  - Phone number
  - Gender
  - Birthday (optional)
  - Bio (optional)
- **Edit Mode:**
  - Toggle edit button
  - Editable fields with validation
  - Save/Cancel buttons
  - Real-time validation feedback
- **Profile Picture Upload:**
  - Click to upload new photo
  - Image preview before saving
  - Supports JPG, PNG (max 2MB)
  - Circular crop preview
- **Password Change:**
  - Link to change password page
  - Requires current password verification
- **Account Statistics:**
  - Total orders placed
  - Member since date
  - Favorite items (most ordered)
- **Logout Button:** Positioned at bottom of profile

**Screenshot Guide:**
- Capture profile view mode (read-only)
- Capture profile edit mode with editable fields
- Capture profile picture upload interface
- Capture account statistics section

---

### 2.2 Mobile Responsiveness
**Purpose:** Ensure seamless experience across all device sizes.

**Features:**
- **Mobile Menu:**
  - Hamburger icon opens side navigation
  - Access to cart, profile, orders
  - Category filter moved to horizontal scroll
- **Touch-Optimized Controls:**
  - Larger buttons (minimum 44x44px)
  - Swipe gestures for image carousel
  - Pull-to-refresh for order updates
- **Responsive Layouts:**
  - 2-column grid on mobile
  - Stacked sections for better readability
  - Bottom navigation bar for key actions
- **Performance Optimizations:**
  - Lazy loading images
  - Reduced animations on low-end devices
  - Compressed assets for faster loading

**Screenshot Guide:**
- Capture mobile view of student dashboard
- Capture mobile navigation menu opened
- Capture mobile cart view
- Capture mobile order status card

---

## 3. Owner/Admin Dashboard

### 3.1 Dashboard Overview (`/owner-dashboard`)
**Purpose:** Central command center for cafe owners to monitor business performance.

#### 3.1.1 Statistics Cards
**Features:**
- **Total Revenue Card:**
  - Display: RM format with 2 decimals
  - Icon: Dollar sign in emerald background
  - Subtitle: "From all orders"
  - Calculation: Sum of all completed orders
- **Active Orders Card:**
  - Display: Count of pending + preparing orders
  - Icon: Shopping bag in blue background
  - Subtitle: "Pending or In Progress"
  - Real-time updates
- **Total Customers Card:**
  - Display: Unique user count
  - Icon: Users in violet background
  - Subtitle: "Unique users"
  - Counts distinct customers who placed orders

**Screenshot Guide:** Capture all three statistics cards showing live data.

---

#### 3.1.2 Cafe Status Control
**Features:**
- **Open/Close Toggle:**
  - Large toggle switch
  - Green (open) / Red (closed)
  - Instant update to all student dashboards
- **Status Display:**
  - Current status text
  - Operating hours shown
  - Last updated timestamp
- **Impact Warning:** Notifies admin that closing will prevent new orders

**Screenshot Guide:** Capture cafe status control in both open and closed states.

---

#### 3.1.3 Revenue Chart
**Purpose:** Visualize revenue trends over time.

**Features:**
- **Time Range Filters:**
  - Week View: Last 7 days (bar chart)
  - Month View: Selected month (bar chart)
  - Year View: All months in selected year
- **Interactive Chart:**
  - Built with Recharts library
  - Hover to see exact values
  - Responsive to screen size
  - Color-coded bars (emerald gradient)
- **Data Display:**
  - X-axis: Date/Day labels
  - Y-axis: Revenue in RM
  - Tooltip: Shows exact amount on hover
- **No Data State:** Shows message when no orders in selected period

**Screenshot Guide:**
- Capture revenue chart for week view
- Capture revenue chart for month view
- Capture filter controls (dropdowns for month/year)

---

#### 3.1.4 Top Selling Items Card
**Purpose:** Identify best-performing menu items.

**Features:**
- **Time Range Filters:**
  - This Week
  - This Month
  - Custom date range
- **Display Format:**
  - Ranked list (1, 2, 3)
  - Item name with icon
  - Total quantity sold
  - Revenue generated (RM)
  - Trophy icon for #1 item
- **Empty State:** Shows when no sales in selected period
- **Auto-Update:** Recalculates when new orders come in

**Screenshot Guide:** Capture top selling items with all 3 positions filled showing different items.

---

### 3.2 Live Orders Page (`/owner-dashboard/orders`)
**Purpose:** Real-time order management and fulfillment.

**Features:**
- **Order Queue Display:**
  - Sorted by creation time (oldest first)
  - Only shows Pending, Preparing, and Ready orders
  - Completed/Rejected orders removed from view
- **Order Card Information:**
  - Order ID (last 4 digits)
  - Customer name and email
  - Order time (e.g., "2:30 PM")
  - Status badge (color-coded)
  - Items list with quantities (e.g., "2x Nasi Lemak, 1x Teh Tarik")
  - Total amount (bold, emerald color)
- **Order Status Actions:**
  - **Pending Orders:**
    - Accept button (moves to Preparing)
    - Reject button (cancels order, requires reason)
  - **Preparing Orders:**
    - Mark as Ready button (notifies student)
  - **Ready Orders:**
    - Complete button (when student picks up)
- **Refresh Button:** Manual refresh to check for new orders
- **Auto-Refresh:** Updates every 30 seconds automatically
- **Sound Notification:** Alert sound when new order arrives (optional)
- **Empty State:** Shows "No active orders" when queue is empty

**Screenshot Guide:**
- Capture order queue with multiple orders at different statuses
- Capture Pending order with Accept/Reject buttons
- Capture Preparing order with Mark Ready button
- Capture Ready order with Complete button
- Capture empty orders state

---

### 3.3 Menu Management Page (`/owner-dashboard/menu`)
**Purpose:** Complete CRUD operations for menu items.

**Features:**
- **Menu Items Table Display:**
  - Item image thumbnail
  - Item name
  - Description (truncated)
  - Price (RM)
  - Category badge
  - Availability toggle switch
  - Actions: Edit, Delete
- **Search Functionality:**
  - Search by item name or description
  - Real-time filtering
- **Category Filter:** Filter table by food category
- **Add New Item Dialog:**
  - **Fields:**
    - Item Name (required, min 3 chars)
    - Description (optional, max 200 chars)
    - Price (required, must be > 0)
    - Category dropdown (Main Course, Drink, Dessert, etc.)
    - Image URL (required, must be valid URL)
    - Availability checkbox (default: checked)
  - **Validation:**
    - Real-time error messages
    - Submit disabled until all required fields valid
  - **Image Preview:** Shows uploaded image before saving
- **Edit Item Dialog:**
  - Pre-fills form with existing item data
  - Same fields as Add dialog
  - Updates item in database on save
- **Delete Confirmation:**
  - Modal popup asking "Are you sure?"
  - Warning that action cannot be undone
  - Requires confirmation click
- **Availability Toggle:**
  - Quick on/off switch for each item
  - Updates immediately without dialog
  - Grays out item on student dashboard when off
- **Bulk Actions:**
  - Select multiple items (checkboxes)
  - Bulk delete
  - Bulk availability change

**Screenshot Guide:**
- Capture menu management table with multiple items
- Capture "Add Item" dialog with empty form
- Capture "Add Item" dialog with validation errors
- Capture "Edit Item" dialog with pre-filled data
- Capture delete confirmation modal
- Capture availability toggle in action
- Capture search and filter controls

---

### 3.4 User Management Page (`/owner-dashboard/users`)
**Purpose:** Manage student and staff user accounts.

**Features:**
- **Users Table Display:**
  - Profile picture
  - Name
  - Email
  - Student ID
  - Role (Student/Staff/Admin)
  - Registration date
  - Status (Active/Suspended)
  - Actions: View, Edit, Suspend/Activate
- **User Statistics Cards:**
  - Total Users
  - Active Students
  - Staff Members
  - New Users This Month
- **Search and Filter:**
  - Search by name, email, or Student ID
  - Filter by role
  - Filter by status (Active/Suspended)
  - Sort by registration date, name, etc.
- **User Details View:**
  - Full profile information
  - Order history
  - Total spent
  - Favorite items
  - Last login date
- **User Actions:**
  - **View Details:** Opens detailed profile panel
  - **Edit Info:** Modify user information (admin only)
  - **Reset Password:** Send password reset email
  - **Suspend Account:** Temporarily disable user access
  - **Delete Account:** Permanently remove user (requires confirmation)
- **Bulk Operations:**
  - Select multiple users
  - Bulk status change
  - Bulk email notification
- **Export Options:**
  - Export user list to CSV
  - Generate user report (PDF)

**Screenshot Guide:**
- Capture users table with multiple user entries
- Capture user statistics cards
- Capture search and filter controls in use
- Capture user details panel opened
- Capture suspend account confirmation dialog

---

### 3.5 Feedback & Reviews Page (`/owner-dashboard/feedback`)
**Purpose:** Monitor customer satisfaction and sentiment analysis.

**Features:**
- **Overview Statistics Cards:**
  - **Total Reviews:** Count of all feedback submissions
  - **Average Rating:** Overall rating (1-5 stars, to 1 decimal)
  - **Positive Sentiment %:** Percentage of positive reviews (AI-classified)
  - **Recent Trend:** Up/down arrow showing trend vs last period
- **Sentiment Distribution Chart:**
  - Pie chart showing breakdown:
    - Positive (green): % and count
    - Neutral (yellow): % and count
    - Negative (red): % and count
  - Interactive hover for details
- **Feedback Timeline:**
  - List of all feedback sorted by date (newest first)
  - Each entry shows:
    - Customer name and profile pic
    - Item reviewed
    - Star rating (visual stars)
    - Text review
    - Sentiment badge (Positive/Neutral/Negative)
    - Sentiment score (0-1, shown as percentage)
    - Date posted
- **Filter Options:**
  - Filter by sentiment (All, Positive, Neutral, Negative)
  - Filter by rating (5★, 4★, 3★, 2★, 1★)
  - Filter by date range
  - Filter by menu item
- **Item-Specific Reviews:**
  - View all reviews for a specific menu item
  - Shows average rating and review count for that item
  - Helps identify problem items needing attention
- **Sentiment Analysis Details:**
  - AI model: Fine-tuned RoBERTa
  - Confidence score displayed
  - Color-coded badges:
    - 🟢 Positive (green)
    - 🟡 Neutral (yellow)
    - 🔴 Negative (red)
- **Action Items:**
  - Flag inappropriate reviews
  - Respond to feedback (optional feature)
  - Export feedback report
- **Trends Chart:**
  - Line chart showing sentiment trends over time
  - X-axis: Date
  - Y-axis: Sentiment score
  - Shows average sentiment per day/week/month

**Screenshot Guide:**
- Capture overview statistics cards
- Capture sentiment distribution pie chart
- Capture feedback timeline with multiple reviews
- Capture reviews filtered by sentiment
- Capture item-specific review view
- Capture sentiment trend chart

---

### 3.6 Settings Page (`/owner-dashboard/settings`)
**Purpose:** Configure cafe operational settings.

**Features:**
- **Cafe Status Control:**
  - Open/Close cafe toggle
  - Applies to all ordering features
- **Operating Hours Configuration:**
  - Start time picker (e.g., 08:00 AM)
  - End time picker (e.g., 05:00 PM)
  - Day-wise schedule (optional)
  - Holiday closure dates
- **Order Settings:**
  - Minimum order amount (RM)
  - Maximum items per order
  - Order preparation time estimate (minutes)
- **Notification Settings:**
  - Email notifications for new orders (On/Off)
  - Sound alerts (On/Off)
  - SMS notifications (requires setup)
- **Payment Settings:**
  - Enable/disable cash payment
  - Enable/disable online payment (future)
  - Tax rate configuration (%)
- **Admin Account Management:**
  - Change admin password
  - Add/remove staff accounts
  - Manage admin permissions
- **System Settings:**
  - Backup database
  - View system logs
  - Clear cache
- **Save Button:** Saves all settings changes

**Screenshot Guide:**
- Capture operating hours configuration
- Capture notification settings toggles
- Capture admin account management section
- Capture save confirmation message

---

### 3.7 Sidebar Navigation
**Purpose:** Quick access to all dashboard sections.

**Features:**
- **Navigation Menu Items:**
  - 📊 Overview (dashboard)
  - 🛍️ Live Orders
  - 🍽️ Menu Management
  - 👥 User Management
  - 💬 Feedback & Reviews
  - ⚙️ Settings
- **Active Page Highlighting:** Current page has colored background
- **Logout Button:** At bottom of sidebar
- **Collapsible:** Can minimize on smaller screens
- **Role-Based Display:** Shows only permitted sections based on admin role

**Screenshot Guide:** Capture full sidebar with all menu items visible and one item active.

---

## 4. AI/ML Integration

### 4.1 Recommendation System
**Purpose:** Personalized menu suggestions using collaborative filtering.

**Technical Details:**
- **Model Type:** Neural Collaborative Filtering
- **Architecture:**
  - User embeddings: 150 users × 50 dimensions
  - Item embeddings: 71 items × 50 dimensions
  - Dense layers: [128, 64, 32, 1]
  - Activation: ReLU
- **Training Data:** Historical order data (user-item interactions)
- **Input:** User ID
- **Output:** Top N recommended items with confidence scores

**How It Works:**
1. User places orders over time
2. System learns user preferences from order history
3. Finds similar users based on order patterns
4. Recommends items liked by similar users
5. Filters out items already ordered recently
6. Returns top 3-5 suggestions

**Integration Points:**
- Student dashboard (authenticated users only)
- API endpoint: `POST /api/recommendations`
- Backend: Calls Hugging Face Space ML service
- Fallback: Shows best sellers if ML service unavailable

**Screenshot Guide:**
- Capture API request/response in browser DevTools
- Capture recommended items section on student dashboard
- Capture case where recommendations are hidden (new user)

---

### 4.2 Sentiment Analysis
**Purpose:** Automatically classify customer feedback as Positive, Neutral, or Negative.

**Technical Details:**
- **Model Type:** Fine-tuned RoBERTa (Transformer)
- **Base Model:** roberta-base (125M parameters)
- **Training Data:** Food review dataset with sentiment labels
- **Input:** Text review/comment
- **Output:** 
  - Sentiment category (Positive/Neutral/Negative)
  - Confidence score (0-1)

**How It Works:**
1. Student submits feedback with text review
2. Review text sent to sentiment analysis API
3. ML model processes text through transformer layers
4. Model outputs sentiment probability distribution
5. Highest probability class selected as final sentiment
6. Result stored in database with original review

**Integration Points:**
- Feedback submission dialog
- API endpoint: `POST /api/feedback`
- Backend calls: `POST /analyze_feedback` on Hugging Face
- Admin dashboard: Displays sentiment badges and statistics

**Use Cases:**
- Identify negative feedback quickly for immediate action
- Track sentiment trends over time
- Filter reviews by sentiment on admin dashboard
- Calculate overall customer satisfaction percentage

**Screenshot Guide:**
- Capture feedback form with text review
- Capture admin feedback page showing sentiment badges
- Capture sentiment distribution chart
- Capture API response in DevTools showing sentiment classification

---

### 4.3 Visual Search (Image Recognition)
**Purpose:** Identify food categories from user-uploaded images.

**Technical Details:**
- **Model Type:** Vision Transformer (ViT)
- **Architecture:** ViT-Base-Patch16
- **Training Data:** Food image dataset (8 categories)
- **Input:** Food image (JPEG/PNG, resized to 224×224)
- **Output:**
  - Predicted category (e.g., "Main Course", "Drink")
  - Confidence score (0-100%)

**How It Works:**
1. User uploads food image or takes photo
2. Image preprocessed (resize, normalize)
3. ViT model extracts visual features
4. Classification head predicts food category
5. System retrieves all menu items from predicted category
6. Results displayed with confidence score

**Supported Categories:**
- Main Course
- Drinks
- Desserts
- Snacks
- Appetizers
- Side Dishes
- Breakfast
- Special Items

**Integration Points:**
- Visual search button in student dashboard header
- API endpoint: `POST /api/visual-search`
- Backend calls: `POST /visual_search` on Hugging Face
- Returns: Category + matching menu items

**Use Cases:**
- Students don't know item name but have photo
- Discover similar items to what they see
- Quick category browsing with images
- Accessibility feature for non-native speakers

**Screenshot Guide:**
- Capture visual search panel with upload interface
- Capture image being processed (loading state)
- Capture results showing predicted category and matched items
- Capture confidence score display
- Capture mobile camera capture interface

---

### 4.4 ML Service Architecture

**Deployment:**
- **Platform:** Hugging Face Spaces
- **Container:** Docker (Python 3.10-slim)
- **Framework:** Flask + Flask-CORS
- **Port:** 7860 (Hugging Face default)

**API Endpoints:**

1. **Health Check**
   - `GET /`
   - Returns: Status of all 3 models and MongoDB connection

2. **Sentiment Analysis**
   - `POST /analyze_feedback`
   - Input: `{ "comment": "string" }`
   - Output: `{ "sentiment": "Positive", "score": 0.95 }`

3. **Recommendations**
   - `POST /recommend`
   - Input: `{ "user_id": "mongodb_user_id" }`
   - Output: `{ "recommendations": [...] }`

4. **Visual Search**
   - `POST /visual_search`
   - Input: `multipart/form-data` with image file
   - Output: `{ "predicted_category": "Main Course", "confidence": 0.89, "items": [...] }`

**Error Handling:**
- Model loading failures: Fallback to default behavior
- API timeouts: Return cached results or empty array
- Invalid inputs: Return error messages with status codes

**Screenshot Guide:**
- Capture Hugging Face Space dashboard showing all models "Ready"
- Capture API health check response in Postman/browser
- Capture network requests in browser DevTools showing ML API calls

---

## 5. Progressive Web App (PWA) Features

### 5.1 Installation
**Purpose:** Allow users to install the app on their device.

**Features:**
- **Install Prompt:** Browser shows "Add to Home Screen" option
- **Custom Install Button:** In-app prompt for installation
- **App Icon:** Custom cafe logo on home screen
- **Splash Screen:** Branded loading screen on app launch
- **Standalone Mode:** Runs without browser UI

**Screenshot Guide:**
- Capture browser install prompt
- Capture custom install dialog
- Capture app icon on mobile home screen
- Capture splash screen on launch

---

### 5.2 Offline Support
**Purpose:** Basic functionality when internet is unavailable.

**Features:**
- **Service Worker:** Caches static assets
- **Offline Page:** Custom "You're offline" page
- **Cached Menu:** Last loaded menu available offline
- **Queue Orders:** Orders queued until connection restored (future feature)

**Screenshot Guide:**
- Capture offline page
- Capture cached menu display while offline

---

### 5.3 Push Notifications
**Purpose:** Real-time updates for order status changes.

**Features:**
- **Order Status Notifications:**
  - "Your order is being prepared"
  - "Your order is ready for pickup"
  - "Your order has been completed"
- **Permission Request:** Asks user for notification permission
- **Notification Settings:** Can be disabled in profile

**Screenshot Guide:**
- Capture notification permission request
- Capture push notification example on mobile

---

## 6. Technical Implementation Notes

### 6.1 Frontend Stack
- **Framework:** Next.js 16.0.1+ (App Router)
- **Language:** TypeScript 5.x
- **UI Library:** React 19.2.0
- **Styling:** Tailwind CSS 4.x
- **Components:** Radix UI + shadcn/ui
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts 3.5.1
- **Notifications:** Sonner (toast messages)

### 6.2 Backend Stack
- **API:** Next.js API Routes (serverless)
- **Database:** MongoDB Atlas
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Email:** Nodemailer (Gmail SMTP)

### 6.3 Deployment
- **Web App:** Vercel (https://your-app.vercel.app)
- **ML Models:** Hugging Face Spaces (https://zulfan20-aiu-smart-cafe.hf.space)
- **Database:** MongoDB Atlas (Cloud)

---

## 7. Screenshot Checklist

### Student Interface (15-20 screenshots)
- [ ] Login page
- [ ] Registration page
- [ ] Student dashboard (full page view)
- [ ] Header with all navigation elements
- [ ] Cafe status banner (open and closed)
- [ ] Active order card (3 different statuses)
- [ ] Category filter
- [ ] Menu items grid (6+ items)
- [ ] Individual menu item card (close-up)
- [ ] Recommended items section
- [ ] Best sellers section
- [ ] Visual search panel (closed, open, results)
- [ ] Shopping cart (empty and with items)
- [ ] Order confirmation
- [ ] Order history dialog
- [ ] Feedback dialog (single and multi-item)
- [ ] Reviews display
- [ ] Profile view and edit mode
- [ ] Mobile responsive views (3-4 screenshots)

### Owner Dashboard (15-20 screenshots)
- [ ] Admin login page
- [ ] Dashboard overview (full page)
- [ ] Statistics cards
- [ ] Revenue chart (week and month view)
- [ ] Top selling items
- [ ] Live orders page (multiple orders)
- [ ] Order status actions
- [ ] Menu management table
- [ ] Add/Edit menu item dialogs
- [ ] Delete confirmation
- [ ] User management page
- [ ] User details view
- [ ] Feedback & reviews page (full view)
- [ ] Sentiment distribution chart
- [ ] Feedback timeline
- [ ] Settings page
- [ ] Sidebar navigation

### AI/ML Features (5-8 screenshots)
- [ ] Recommendation system in action
- [ ] Sentiment analysis results (admin view)
- [ ] Visual search process (upload → results)
- [ ] Hugging Face Space dashboard
- [ ] API health check response
- [ ] Browser DevTools showing ML API calls

### PWA Features (3-5 screenshots)
- [ ] Install prompt
- [ ] App icon on home screen
- [ ] Offline page
- [ ] Push notification example

---

## 8. Implementation Highlights

### Key Achievements:
✅ **Responsive Design** - Works seamlessly on mobile, tablet, and desktop  
✅ **Real-Time Updates** - Order status changes reflect immediately  
✅ **AI Integration** - 3 working ML models (recommendations, sentiment, visual search)  
✅ **Security** - JWT authentication, password hashing, role-based access  
✅ **UX Optimization** - Intuitive navigation, clear CTAs, helpful feedback  
✅ **Performance** - Fast load times, optimized images, efficient queries  
✅ **Scalability** - Serverless architecture, cloud-based deployment  
✅ **PWA Support** - Installable, offline capability, push notifications  

### Innovation Points:
🌟 **Cold Start Handling** - Hides recommendations for new users until they have purchase history  
🌟 **Visual Search** - Unique feature allowing food identification from images  
🌟 **Auto Sentiment Analysis** - Every review automatically classified without manual work  
🌟 **Real-Time Cafe Status** - Dynamic open/close control affecting all users instantly  
🌟 **Multi-Item Feedback** - Separate ratings for each item in an order  

---

*End of Implementation Documentation*  
*Date: January 23, 2026*  
*AIU Smart Cafe FYP System*
