import { NextResponse } from 'next/server';
import axios from 'axios';
import FormData from 'form-data';
import dbConnect from '@/lib/dbConnect';
import MenuItem from '@/models/menuItem.model';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const imageFile = formData.get('image');

    if (!imageFile) {
      return NextResponse.json({ error: 'No image file provided' }, { status: 400 });
    }

    // Convert the file to a buffer
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create form data for ML service
    const mlFormData = new FormData();
    mlFormData.append('image', buffer, {
      filename: imageFile.name,
      contentType: imageFile.type,
    });

    // Call ML service
    const mlServiceUrl = process.env.SENTIMENT_SERVICE_URL || 'http://127.0.0.1:5001';
    
    console.log('[VISUAL SEARCH] Sending image to ML service...');
    
    const mlResponse = await axios.post(`${mlServiceUrl}/visual_search`, mlFormData, {
      headers: {
        ...mlFormData.getHeaders(),
      },
      timeout: 10000,
    });

    console.log('[VISUAL SEARCH] ML Response:', mlResponse.data);

    const { predicted_category, confidence, all_predictions } = mlResponse.data;

    // Fetch menu items based on prediction
    await dbConnect();
    
    let menuItems = [];
    let searchType = '';
    let searchValue = '';

    const categoryLower = predicted_category.toLowerCase();

    if (categoryLower.includes('drink')) {
      // For Drinks: Search by category (case-insensitive) and return ALL items
      searchType = 'category';
      searchValue = 'Drink';
      
      // Search for items with category matching "drink" (case-insensitive)
      menuItems = await MenuItem.find({
        category: { $regex: 'drink', $options: 'i' } // Case-insensitive match for "Drink" or "Drinks"
      }).sort({ averageRating: -1, reviewCount: -1 });
      
      console.log(`[VISUAL SEARCH] Found ${menuItems.length} drinks from Drink category (case-insensitive)`);
      
    } else if (categoryLower.includes('roti')) {
      // For Roti: Search by name containing "roti"
      searchType = 'name_filter';
      searchValue = 'roti';
      menuItems = await MenuItem.find({
        name: { $regex: 'roti', $options: 'i' }, // case-insensitive search
        isAvailable: true
      }).sort({ averageRating: -1, reviewCount: -1 }).limit(20);
      
    } else if (categoryLower.includes('nasi')) {
      // For Nasi: Search by name containing "nasi"
      searchType = 'name_filter';
      searchValue = 'nasi';
      menuItems = await MenuItem.find({
        name: { $regex: 'nasi', $options: 'i' }, // case-insensitive search
        isAvailable: true
      }).sort({ averageRating: -1, reviewCount: -1 }).limit(20);
      
    } else {
      // Fallback: try category search
      searchType = 'category';
      searchValue = predicted_category;
      menuItems = await MenuItem.find({
        category: predicted_category,
        isAvailable: true
      }).sort({ averageRating: -1, reviewCount: -1 }).limit(20);
    }

    console.log(`[VISUAL SEARCH] Search type: ${searchType}, value: ${searchValue}, found: ${menuItems.length} items`);
    
    // If no items found, log available options
    if (menuItems.length === 0) {
      console.log(`[VISUAL SEARCH] No items found!`);
      const allItems = await MenuItem.find({ isAvailable: true });
      console.log(`[VISUAL SEARCH] Available categories:`, [...new Set(allItems.map(item => item.category))]);
      console.log(`[VISUAL SEARCH] Sample item names:`, allItems.slice(0, 5).map(item => item.name));
    }

    return NextResponse.json({
      predicted_category,
      search_type: searchType,
      search_value: searchValue,
      confidence,
      all_predictions,
      items: menuItems,
      total_items: menuItems.length
    });

  } catch (error) {
    console.error('[VISUAL SEARCH] Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      return NextResponse.json({ 
        error: 'ML service is not running. Please start the visual search service.' 
      }, { status: 503 });
    }

    return NextResponse.json({ 
      error: error.message || 'Internal server error' 
    }, { status: 500 });
  }
}
