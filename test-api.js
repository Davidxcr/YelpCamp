const axios = require('axios');

// Base URL for your API
const BASE_URL = 'http://localhost:5176/api';

async function testAPI() {
    console.log('🧪 Testing YelpCamp API Endpoints...\n');

    try {
        // Test 1: Get Statistics
        console.log('📊 Testing GET /api/stats');
        const statsResponse = await axios.get(`${BASE_URL}/stats`);
        console.log('✅ Stats Response:');
        console.log(JSON.stringify(statsResponse.data, null, 2));
        console.log('\n' + '─'.repeat(50) + '\n');

        // Test 2: Get All Campgrounds (first page)
        console.log('🏕️  Testing GET /api/campgrounds?page=1&limit=5');
        const campgroundsResponse = await axios.get(`${BASE_URL}/campgrounds`, {
            params: {
                page: 1,
                limit: 5,
                sortBy: 'title'
            }
        });
        console.log('✅ Campgrounds Response:');
        console.log(`Found ${campgroundsResponse.data.data.campgrounds.length} campgrounds`);
        console.log('Pagination:', campgroundsResponse.data.data.pagination);
        console.log('First campground:', campgroundsResponse.data.data.campgrounds[0]?.title);
        console.log('\n' + '─'.repeat(50) + '\n');

        // Test 3: Search for forest campgrounds
        console.log('🔍 Testing GET /api/campgrounds/search/forest');
        const searchResponse = await axios.get(`${BASE_URL}/campgrounds/search/forest`, {
            params: { limit: 3 }
        });
        console.log('✅ Search Response:');
        console.log(`Found ${searchResponse.data.data.results} forest campgrounds`);
        searchResponse.data.data.campgrounds.forEach((camp, index) => {
            console.log(`${index + 1}. ${camp.title} - $${camp.price}/night`);
        });
        console.log('\n' + '─'.repeat(50) + '\n');

        // Test 4: Get ocean category campgrounds
        console.log('🌊 Testing GET /api/campgrounds/category/ocean');
        const oceanResponse = await axios.get(`${BASE_URL}/campgrounds/category/ocean`, {
            params: { limit: 3 }
        });
        console.log('✅ Ocean Category Response:');
        console.log(`Found ${oceanResponse.data.data.results} ocean campgrounds`);
        oceanResponse.data.data.campgrounds.forEach((camp, index) => {
            console.log(`${index + 1}. ${camp.title} - ${camp.location}`);
        });
        console.log('\n' + '─'.repeat(50) + '\n');

        // Test 5: Get specific campground details
        if (campgroundsResponse.data.data.campgrounds.length > 0) {
            const firstCampgroundId = campgroundsResponse.data.data.campgrounds[0]._id;
            console.log(`🏕️  Testing GET /api/campgrounds/${firstCampgroundId}`);
            
            const detailResponse = await axios.get(`${BASE_URL}/campgrounds/${firstCampgroundId}`);
            console.log('✅ Campground Detail Response:');
            console.log(`Title: ${detailResponse.data.data.campground.title}`);
            console.log(`Location: ${detailResponse.data.data.campground.location}`);
            console.log(`Price: $${detailResponse.data.data.campground.price}/night`);
            console.log(`Average Rating: ${detailResponse.data.data.stats.averageRating}`);
            console.log(`Total Reviews: ${detailResponse.data.data.stats.totalReviews}`);
            console.log(`Images: ${detailResponse.data.data.campground.images.length} photos`);
        }

        console.log('\n🎉 All API tests completed successfully!');

    } catch (error) {
        console.error('❌ API Test Error:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received. Is the server running on port 5176?');
        } else {
            console.error('Error:', error.message);
        }
    }
}

// Function to demonstrate different API usage patterns
async function demonstrateAPIUsage() {
    console.log('\n📚 API Usage Demonstrations:\n');

    try {
        // Example 1: Pagination
        console.log('1️⃣  Pagination Example:');
        const page1 = await axios.get(`${BASE_URL}/campgrounds?page=1&limit=5`);
        const page2 = await axios.get(`${BASE_URL}/campgrounds?page=2&limit=5`);
        console.log(`Page 1: ${page1.data.data.campgrounds.length} campgrounds`);
        console.log(`Page 2: ${page2.data.data.campgrounds.length} campgrounds`);
        console.log(`Total Pages: ${page1.data.data.pagination.totalPages}`);
        console.log();

        // Example 2: Filtering by price
        console.log('2️⃣  Price Filtering Example:');
        const affordableCamps = await axios.get(`${BASE_URL}/campgrounds`, {
            params: {
                minPrice: 10,
                maxPrice: 30,
                limit: 5,
                sortBy: 'price',
                sortOrder: 'asc'
            }
        });
        console.log(`Found ${affordableCamps.data.data.campgrounds.length} affordable campgrounds ($10-$30):`);
        affordableCamps.data.data.campgrounds.forEach(camp => {
            console.log(`  • ${camp.title}: $${camp.price}/night`);
        });
        console.log();

        // Example 3: Location search
        console.log('3️⃣  Location Search Example:');
        const californiaCamps = await axios.get(`${BASE_URL}/campgrounds`, {
            params: {
                location: 'california',
                limit: 3
            }
        });
        console.log(`Found ${californiaCamps.data.data.campgrounds.length} campgrounds in California:`);
        californiaCamps.data.data.campgrounds.forEach(camp => {
            console.log(`  • ${camp.title} in ${camp.location}`);
        });

    } catch (error) {
        console.error('❌ Demonstration Error:', error.message);
    }
}

// Main execution
async function main() {
    console.log('🚀 Starting YelpCamp API Tests...\n');
    
    await testAPI();
    await demonstrateAPIUsage();
    
    console.log('\n📖 For complete API documentation, see API_DOCUMENTATION.md');
    console.log('💡 Start your server with: npm start or node app.js');
}

// Run if this file is executed directly
if (require.main === module) {
    main();
}

module.exports = { testAPI, demonstrateAPIUsage }; 