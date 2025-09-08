#!/bin/bash

# Test script syntax for Ubuntu compatibility

echo "🔍 Testing script syntax..."

# Test the fixed script
echo "Testing fix_urls_ubuntu_fixed.sh..."
bash -n fix_urls_ubuntu_fixed.sh
if [ $? -eq 0 ]; then
    echo "✅ fix_urls_ubuntu_fixed.sh syntax is correct"
else
    echo "❌ fix_urls_ubuntu_fixed.sh has syntax errors"
fi

# Test the main script
echo "Testing fix_all_urls_ubuntu.sh..."
bash -n fix_all_urls_ubuntu.sh
if [ $? -eq 0 ]; then
    echo "✅ fix_all_urls_ubuntu.sh syntax is correct"
else
    echo "❌ fix_all_urls_ubuntu.sh has syntax errors"
fi

# Test the setup script
echo "Testing ubuntu_setup.sh..."
bash -n ubuntu_setup.sh
if [ $? -eq 0 ]; then
    echo "✅ ubuntu_setup.sh syntax is correct"
else
    echo "❌ ubuntu_setup.sh has syntax errors"
fi

echo ""
echo "🎉 Syntax testing completed!"
