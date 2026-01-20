const axios = require('axios');

console.log('Testing ML Service Connection...\n');

// Test 1: Health Check
async function testHealth() {
  try {
    const response = await axios.get('http://127.0.0.1:5001/');
    console.log('✓ Health Check:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('✗ Health Check Failed:', error.message);
    return false;
  }
}

// Test 2: Sentiment Analysis
async function testSentiment() {
  try {
    const response = await axios.post('http://127.0.0.1:5001/analyze_feedback', {
      comment: 'The food was amazing and the service was great!'
    });
    console.log('\n✓ Sentiment Analysis:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('\n✗ Sentiment Analysis Failed:', error.message);
    return false;
  }
}

// Test 3: Recommendations
async function testRecommendations() {
  try {
    const response = await axios.post('http://127.0.0.1:5001/recommend', {
      user_id: '675f3da3b7e0c957a5e66fe9'
    });
    console.log('\n✓ Recommendations:');
    console.log(JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('\n✗ Recommendations Failed:', error.message);
    return false;
  }
}

async function runTests() {
  console.log('='.repeat(50));
  const health = await testHealth();
  const sentiment = await testSentiment();
  const recommendations = await testRecommendations();
  console.log('\n' + '='.repeat(50));
  console.log('Test Results:');
  console.log('  Health Check:', health ? '✓ PASS' : '✗ FAIL');
  console.log('  Sentiment:', sentiment ? '✓ PASS' : '✗ FAIL');
  console.log('  Recommendations:', recommendations ? '✓ PASS' : '✗ FAIL');
  console.log('='.repeat(50));
}

runTests();
