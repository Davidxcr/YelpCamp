const http = require('http');

console.log('🔍 Verifying YelpCamp API...\n');

function testEndpoint(path, description) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 5176,
            path: path,
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                const isJson = res.headers['content-type']?.includes('application/json');
                const statusOk = res.statusCode === 200;
                
                if (statusOk && isJson) {
                    try {
                        const parsed = JSON.parse(data);
                        console.log(`✅ ${description}`);
                        console.log(`   Status: ${res.statusCode}, Content-Type: ${res.headers['content-type']}`);
                        if (parsed.success) {
                            console.log(`   Response: Success with ${Object.keys(parsed.data || {}).length} data fields`);
                        }
                    } catch (e) {
                        console.log(`❌ ${description} - Invalid JSON`);
                    }
                } else {
                    console.log(`❌ ${description}`);
                    console.log(`   Status: ${res.statusCode}, Content-Type: ${res.headers['content-type']}`);
                    if (!isJson) {
                        console.log(`   Issue: Returning HTML instead of JSON`);
                        console.log(`   Solution: Server needs to be restarted`);
                    }
                }
                resolve();
            });
        });

        req.on('error', (error) => {
            console.log(`❌ ${description} - Connection failed`);
            console.log(`   Error: ${error.message}`);
            console.log(`   Solution: Make sure server is running on port 5176`);
            resolve();
        });

        req.end();
    });
}

async function verifyAPI() {
    console.log('Testing API endpoints...\n');
    
    await testEndpoint('/api/stats', 'GET /api/stats - Statistics endpoint');
    await testEndpoint('/api/campgrounds?limit=1', 'GET /api/campgrounds - List campgrounds');
    await testEndpoint('/api/campgrounds/search/forest?limit=1', 'GET /api/campgrounds/search - Search endpoint');
    
    console.log('\n📋 Summary:');
    console.log('If you see ❌ errors above:');
    console.log('1. Stop your server (Ctrl+C)');
    console.log('2. Restart with: node app.js');
    console.log('3. Look for these startup messages:');
    console.log('   🚀 API routes loaded successfully!');
    console.log('   🔗 Registering API routes at /api');
    console.log('   ✅ All routes registered successfully');
    console.log('4. Run this script again: node verify-api.js');
    console.log('\nIf you see ✅ success messages, your API is working!');
}

verifyAPI(); 