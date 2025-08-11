const { execSync } = require('child_process');
const fs = require('fs');

// Get current version from package.json
const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
const currentVersion = packageJson.version;

console.log('🚀 Markdown Reader Pro - Release Script');
console.log('=======================================');
console.log(`Current version: ${currentVersion}`);

// Check if we have uncommitted changes
try {
    const status = execSync('git status --porcelain', { encoding: 'utf8' });
    if (status.trim()) {
        console.log('\n⚠️  You have uncommitted changes:');
        console.log(status);
        console.log('\nPlease commit all changes before releasing.');
        process.exit(1);
    }
} catch (error) {
    console.log('❌ Error checking git status:', error.message);
    process.exit(1);
}

// Check if tag already exists
try {
    const existingTag = execSync(`git tag -l v${currentVersion}`, { encoding: 'utf8' });
    if (existingTag.trim()) {
        console.log(`\n⚠️  Tag v${currentVersion} already exists.`);
        console.log('Please update version in package.json first.');
        process.exit(1);
    }
} catch (error) {
    // Tag doesn't exist, which is good
}

console.log('\n✅ Ready to release!');
console.log('\nSteps to release:');
console.log(`1. Create tag: git tag v${currentVersion}`);
console.log(`2. Push tag: git push origin v${currentVersion}`);
console.log('3. GitHub Actions will automatically build and release!');
console.log('\nOr run this automatically:');
console.log(`   git tag v${currentVersion} && git push origin v${currentVersion}`);

// Ask if user wants to proceed
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

rl.question('\nCreate and push tag now? (y/N): ', (answer) => {
    rl.close();

    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        try {
            console.log('\n🏷️  Creating tag...');
            execSync(`git tag v${currentVersion}`, { stdio: 'inherit' });

            console.log('📤 Pushing tag...');
            execSync(`git push origin v${currentVersion}`, { stdio: 'inherit' });

            console.log('\n🎉 Release tag pushed!');
            console.log('GitHub Actions will now automatically:');
            console.log('1. Build your Windows app');
            console.log('2. Create a GitHub release');
            console.log('3. Upload all build artifacts');
            console.log('\nCheck the Actions tab on GitHub to monitor progress.');

        } catch (error) {
            console.error('❌ Error during release:', error.message);
            process.exit(1);
        }
    } else {
        console.log('\nRelease cancelled. Run the commands manually when ready.');
    }
});
