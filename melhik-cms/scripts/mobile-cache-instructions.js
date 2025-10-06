console.log('📱 Mobile App Cache Clearing Instructions\n');

console.log('🔍 Problem: You are seeing duplicate data in the mobile app that doesn\'t exist in the CMS.');
console.log('✅ Solution: Clear the mobile app\'s local cache and force a fresh sync.\n');

console.log('📋 Step-by-Step Instructions:\n');

console.log('1️⃣  Clear AsyncStorage in the Mobile App:');
console.log('   • Open the mobile app');
console.log('   • Go to Settings screen');
console.log('   • Look for "Clear Cache", "Reset Data", or "Clear Storage" option');
console.log('   • Tap it to clear all cached data\n');

console.log('2️⃣  Alternative: Manual Cache Clearing:');
console.log('   If there\'s no clear cache option, you can:');
console.log('   • Uninstall the mobile app completely');
console.log('   • Reinstall it from the app store');
console.log('   • This will give you a completely fresh start\n');

console.log('3️⃣  Force Fresh Sync:');
console.log('   • After clearing cache, go to the home screen');
console.log('   • Pull down to refresh (swipe down from top)');
console.log('   • Or go to Settings > Sync > Force Sync');
console.log('   • Wait for the sync to complete\n');

console.log('4️⃣  Verify Clean Data:');
console.log('   • You should now see only:');
console.log('     - 1 Religion: Christianity');
console.log('     - 1 Topic: The Trinity');
console.log('     - Rich content with text, images, and mixed blocks');
console.log('   • No duplicate religions or topics\n');

console.log('🔧 Technical Details:');
console.log('The mobile app stores data in AsyncStorage with these keys:');
console.log('   • @melhik_religions');
console.log('   • @melhik_topics');
console.log('   • @melhik_topic_details');
console.log('   • @melhik_last_sync');
console.log('   • @melhik_content_version\n');

console.log('✅ Expected Result:');
console.log('After clearing cache and syncing, the mobile app should show:');
console.log('   • 1 unique religion (Christianity)');
console.log('   • 1 topic (The Trinity)');
console.log('   • Rich content with 4 content blocks');
console.log('   • No duplicate or old data\n');

console.log('🎉 The mobile app will now display clean, up-to-date content from the CMS!');







