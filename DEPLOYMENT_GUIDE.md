# 🚀 Complete Deployment Guide - AIU Smart Cafe FYP

This guide covers deploying your complete AIU Smart Cafe system for your FYP presentation (15 days).

## 📦 What You're Deploying

1. **AI Models** → Hugging Face Spaces (FREE)
2. **Web Application** → Vercel (FREE)
3. **Database** → MongoDB Atlas (FREE tier)

---

## Part 1: Deploy AI Models to Hugging Face 🤗

### Step 1: Sign Up for Hugging Face
1. Go to https://huggingface.co/join
2. Create a free account
3. Verify your email

### Step 2: Create a New Space
1. Go to https://huggingface.co/new-space
2. Fill in the details:
   - **Name**: `aiu-smart-cafe`
   - **License**: MIT
   - **SDK**: Select **Docker**
   - **Visibility**: Public (free) or Private (requires subscription)
3. Click **Create Space**

### Step 3: Install Git LFS (Large File Storage)

**Windows:**
```bash
# Download and install from: https://git-lfs.github.com/
# Or use chocolatey:
choco install git-lfs

# Initialize Git LFS
git lfs install
```

**Mac:**
```bash
brew install git-lfs
git lfs install
```

**Linux:**
```bash
sudo apt-get install git-lfs
git lfs install
```

### Step 4: Clone Your Hugging Face Space
```bash
# Replace YOUR_USERNAME with your actual Hugging Face username
git clone https://huggingface.co/spaces/Zulfan20/aiu-smart-cafe
cd aiu-smart-cafe
```

### Step 5: Copy Files to the Space

Copy these files from `ML-models/` folder:

**Required Files:**
```bash
# Copy from ML-models/ to aiu-smart-cafe/

# Main application file
app.py

# Requirements
requirements_huggingface.txt  → rename to → requirements.txt

# Docker configuration
Dockerfile
.gitattributes

# README for Hugging Face
README_HUGGINGFACE.md  → rename to → README.md

# Model files (IMPORTANT!)
recommender_mode.h5
recommender_data.pkl
user_encoder.pkl
item_encoder.pkl

# Model folders
newml/                        (entire folder)
my_category_model/            (entire folder)
```

**Your final Space folder structure should look like:**
```
aiu-smart-cafe/
├── app.py
├── requirements.txt
├── Dockerfile
├── .gitattributes
├── README.md
├── recommender_mode.h5
├── recommender_data.pkl
├── user_encoder.pkl
├── item_encoder.pkl
├── newml/
│   ├── config.json
│   ├── model.safetensors
│   ├── tokenizer.json
│   └── ... (other files)
└── my_category_model/
    ├── config.json
    ├── model.safetensors
    ├── preprocessor_config.json
    └── ... (other files)
```

### Step 6: Track Large Files with Git LFS
```bash
cd aiu-smart-cafe

# Track all large model files
git lfs track "*.h5"
git lfs track "*.pkl"
git lfs track "*.safetensors"
git lfs track "*.bin"
```

### Step 7: Set Environment Variables (Optional)

If you want personalized recommendations to work, add your MongoDB URI:

1. Go to your Space settings on Hugging Face
2. Click **Settings** → **Variables and secrets**
3. Add a new secret:
   - Name: `MONGODB_URI`
   - Value: Your MongoDB connection string

### Step 8: Deploy to Hugging Face
```bash
# Stage all files
git add .

# Commit
git commit -m "Initial deployment: AIU Smart Cafe AI Models"

# Push to Hugging Face (this may take 5-10 minutes for large files)
git push
```

### Step 9: Wait for Build
- Go to your Space URL: `https://huggingface.co/spaces/YOUR_USERNAME/aiu-smart-cafe`
- Wait 5-10 minutes for the Docker build to complete
- Once ready, you'll see: "✅ Running"

### Step 10: Test Your API
```bash
# Test health check
curl https://YOUR_USERNAME-aiu-smart-cafe.hf.space/

# Test sentiment analysis
curl -X POST https://YOUR_USERNAME-aiu-smart-cafe.hf.space/analyze_feedback \
  -H "Content-Type: application/json" \
  -d '{"comment": "The food was amazing!"}'
```

**Save your API URL**: `https://YOUR_USERNAME-aiu-smart-cafe.hf.space`

---

## Part 2: Deploy Web App to Vercel 🔷

### Step 1: Prepare Your Repository

Make sure your code is on GitHub:
```bash
cd AIU-Smart-Cafe-FYP

# Add all changes
git add .

# Commit
git commit -m "Ready for deployment"

# Push to GitHub
git push origin main
```

### Step 2: Sign Up for Vercel
1. Go to https://vercel.com/signup
2. Sign up with your **GitHub account** (easiest option)
3. Authorize Vercel to access your repositories

### Step 3: Import Your Project
1. Click **Add New** → **Project**
2. Select your GitHub repository: `AIU-Smart-Cafe-FYP`
3. Click **Import**

### Step 4: Configure Project Settings
1. **Framework Preset**: Next.js (should auto-detect)
2. **Root Directory**: Click **Edit** → Select `app` folder
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

### Step 5: Add Environment Variables

Click **Environment Variables** and add these (one by one):

**Required Variables:**

| Name | Value | Notes |
|------|-------|-------|
| `MONGODB_URI` | `your_mongodb_connection_string` | From MongoDB Atlas |
| `JWT_SECRET` | `your_super_secret_random_key_min_32_chars` | Use strong random string |
| `SENTIMENT_SERVICE_URL` | `https://YOUR_USERNAME-aiu-smart-cafe.hf.space` | Your Hugging Face Space URL |

**Optional Variables:**

| Name | Value | Notes |
|------|-------|-------|
| `EMAIL_USER` | `your_email@gmail.com` | For password reset |
| `EMAIL_PASS` | `your_email_app_password` | Gmail app password |
| `EMAIL_FROM` | `noreply@aiucafe.com` | From email address |

**How to get Gmail App Password:**
1. Go to Google Account → Security
2. Enable 2-Factor Authentication
3. Go to App Passwords
4. Create a new app password
5. Copy and use it as `EMAIL_PASS`

### Step 6: Deploy
1. Click **Deploy**
2. Wait 3-5 minutes for the build
3. Once complete, you'll see: "🎉 Congratulations!"
4. Your app will be live at: `https://your-project-name.vercel.app`

### Step 7: Test Your Deployment
1. Visit your Vercel URL
2. Try registering a new account
3. Login
4. Test these features:
   - Browse menu items
   - Get personalized recommendations
   - Add feedback with sentiment analysis
   - Try visual search (upload food image)

---

## Part 3: Update Environment Variables (Important!)

### Update Vercel Environment Variables

After both deployments are complete:

1. Go to Vercel Dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Update `SENTIMENT_SERVICE_URL` with your actual Hugging Face URL:
   ```
   https://YOUR_USERNAME-aiu-smart-cafe.hf.space
   ```
5. Click **Save**
6. Go to **Deployments** → Click **...** on latest deployment → **Redeploy**

---

## Part 4: MongoDB Atlas Setup (if needed)

If you don't have MongoDB Atlas set up:

### Step 1: Create MongoDB Atlas Account
1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up for free
3. Verify email

### Step 2: Create a Cluster
1. Choose **FREE** tier (M0)
2. Select region closest to you
3. Name your cluster: `aiu-cafe-cluster`
4. Click **Create**

### Step 3: Create Database User
1. Click **Database Access** (left sidebar)
2. Click **Add New Database User**
3. Authentication Method: **Password**
4. Username: `aiu_admin`
5. Password: Create strong password (save it!)
6. Database User Privileges: **Read and write to any database**
7. Click **Add User**

### Step 4: Whitelist IP Addresses
1. Click **Network Access** (left sidebar)
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - This is needed for Vercel and Hugging Face to connect
4. Click **Confirm**

### Step 5: Get Connection String
1. Click **Database** (left sidebar)
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `myFirstDatabase` with `aiu-cafe` or your database name

**Example:**
```
mongodb+srv://aiu_admin:YOUR_PASSWORD@aiu-cafe-cluster.xxxxx.mongodb.net/aiu-cafe?retryWrites=true&w=majority
```

Use this as your `MONGODB_URI` in both Vercel and Hugging Face.

---

## 📊 Cost Breakdown (15 Days)

| Service | Cost | Notes |
|---------|------|-------|
| **Hugging Face Spaces** | **FREE** | Free tier (CPU inference) |
| **Vercel** | **FREE** | Free tier (hobby plan) |
| **MongoDB Atlas** | **FREE** | Free tier (512MB storage) |
| **GitHub** | **FREE** | Free for public repos |
| **Domain (optional)** | ~$10-15 | Only if you want custom domain |
| **TOTAL** | **$0** | Completely free! 🎉 |

---

## 🔍 Testing Your Complete System

### 1. Test AI Models API (Hugging Face)
```bash
# Health check
curl https://YOUR_USERNAME-aiu-smart-cafe.hf.space/

# Sentiment analysis
curl -X POST https://YOUR_USERNAME-aiu-smart-cafe.hf.space/analyze_feedback \
  -H "Content-Type: application/json" \
  -d '{"comment": "Great service!"}'

# Recommendations (replace with real MongoDB user ID)
curl -X POST https://YOUR_USERNAME-aiu-smart-cafe.hf.space/recommend \
  -H "Content-Type: application/json" \
  -d '{"user_id": "507f1f77bcf86cd799439011"}'
```

### 2. Test Web Application (Vercel)
1. Visit `https://your-project.vercel.app`
2. Register new account
3. Login
4. Test features:
   - View menu
   - Add items to cart
   - Place order
   - View recommendations
   - Submit feedback
   - Upload food image for visual search

---

## 🐛 Troubleshooting

### Hugging Face Deployment Issues

**Problem: Build failing**
- Check if all required files are present
- Verify `requirements_huggingface.txt` has correct dependencies
- Check Hugging Face build logs for errors

**Problem: Models not loading**
- Ensure Git LFS tracked all large files
- Check file sizes: `.h5`, `.pkl`, model folders
- Verify paths in `app.py` match your folder structure

**Problem: Out of memory**
- Docker Space may be using too much memory
- Consider using smaller model batch sizes
- Check if you can optimize model loading

### Vercel Deployment Issues

**Problem: Build failing**
- Check build logs in Vercel dashboard
- Verify all dependencies in `package.json`
- Ensure `app` folder is set as root directory

**Problem: Environment variables not working**
- Check variable names match exactly (case-sensitive)
- Redeploy after adding/changing variables
- Check if MongoDB connection string is correct

**Problem: Can't connect to AI models**
- Verify `SENTIMENT_SERVICE_URL` is correct
- Check Hugging Face Space is running
- Test AI API endpoint directly with curl

### MongoDB Connection Issues

**Problem: Connection timeout**
- Check if IP whitelist includes 0.0.0.0/0
- Verify connection string format
- Check username and password are correct

**Problem: Authentication failed**
- Verify database user credentials
- Check database user has proper permissions
- Ensure password doesn't contain special characters that need encoding

---

## 📱 For Your FYP Presentation

### Before Presentation:
1. ✅ Test all features thoroughly
2. ✅ Prepare demo data (sample orders, feedback)
3. ✅ Take screenshots of working features
4. ✅ Test on different devices (mobile, tablet)
5. ✅ Have backup plan (local demo if internet fails)

### During Presentation:
1. Show live deployed app (Vercel URL)
2. Demonstrate all 3 AI models:
   - Recommendations
   - Sentiment analysis
   - Visual search
3. Show Hugging Face Space (API working)
4. Explain architecture (diagram)

### After Presentation:
- Keep services running if needed for evaluation
- Delete resources after final evaluation to avoid any future charges:
  ```bash
  # Delete Hugging Face Space
  # Go to Space Settings → Danger Zone → Delete Space
  
  # Delete Vercel Project
  # Go to Project Settings → Danger Zone → Delete Project
  ```

---

## 🎓 Architecture Diagram

```
┌─────────────────┐
│   Students      │
│   (Browser)     │
└────────┬────────┘
         │
         │ HTTPS
         ▼
┌─────────────────────┐
│   Vercel            │
│   (Next.js App)     │
│   - Frontend        │
│   - API Routes      │
└────┬───────────┬────┘
     │           │
     │           │ HTTPS
     │           ▼
     │    ┌──────────────────┐
     │    │ Hugging Face     │
     │    │ (AI Models API)  │
     │    │ - Recommendations│
     │    │ - Sentiment      │
     │    │ - Visual Search  │
     │    └──────────────────┘
     │
     │ MongoDB Protocol
     ▼
┌─────────────────┐
│  MongoDB Atlas  │
│  (Database)     │
│  - Users        │
│  - Orders       │
│  - Menu Items   │
│  - Feedback     │
└─────────────────┘
```

---

## 📞 Support

If you encounter issues during deployment:

1. Check this guide's troubleshooting section
2. Review Vercel build logs
3. Review Hugging Face Space logs
4. Test each component individually
5. Verify all environment variables

---

## ✅ Deployment Checklist

- [ ] Hugging Face account created
- [ ] Git LFS installed
- [ ] AI models deployed to Hugging Face Space
- [ ] Hugging Face Space is running
- [ ] AI API endpoints tested and working
- [ ] Saved Hugging Face Space URL
- [ ] MongoDB Atlas cluster created
- [ ] Database user created with correct permissions
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] MongoDB connection string obtained
- [ ] Vercel account created and linked to GitHub
- [ ] Repository pushed to GitHub
- [ ] Vercel project imported
- [ ] Root directory set to `app` folder
- [ ] All environment variables added to Vercel
- [ ] `SENTIMENT_SERVICE_URL` points to Hugging Face Space
- [ ] Vercel deployment successful
- [ ] Web app is accessible via Vercel URL
- [ ] All features tested and working
- [ ] Demo data prepared
- [ ] Screenshots taken for presentation

---

**Good luck with your FYP presentation! 🎉**

**Deployment URLs to save:**
- **Web App**: `https://your-project.vercel.app`
- **AI API**: `https://YOUR_USERNAME-aiu-smart-cafe.hf.space`
- **MongoDB**: Connection string saved securely

---

*Last updated: January 2026*
