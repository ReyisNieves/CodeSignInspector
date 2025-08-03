#!/bin/bash

# Example: Validating macOS Application Signatures
# This script demonstrates how to validate macOS applications using CodeSign Inspector

API_ENDPOINT="http://localhost:5000/api/signature/validate"

# Common macOS application directories
APP_DIRS=(
    "/Applications"
    "/System/Applications"
    "/System/Library/CoreServices"
)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🍎 macOS Application Signature Validator${NC}"
echo "========================================"

validate_app() {
    local app_path="$1"
    local app_name=$(basename "$app_path")
    
    echo -e "\n📱 Validating: ${BLUE}$app_name${NC}"
    
    # Call CodeSign Inspector API
    local response=$(curl -s -X POST "$API_ENDPOINT" \
        -H "Content-Type: application/json" \
        -d "{\"filePath\": \"$app_path\"}")
    
    if [ $? -eq 0 ]; then
        local is_signed=$(echo "$response" | jq -r '.isSigned')
        local is_valid=$(echo "$response" | jq -r '.isValid')
        local signer_name=$(echo "$response" | jq -r '.signerName')
        local error_message=$(echo "$response" | jq -r '.errorMessage')
        
        if [ "$is_signed" = "true" ] && [ "$is_valid" = "true" ]; then
            echo -e "   ✅ ${GREEN}VALID${NC} - Signed by: $signer_name"
        elif [ "$is_signed" = "true" ] && [ "$is_valid" = "false" ]; then
            echo -e "   ⚠️  ${YELLOW}INVALID${NC} - Signed by: $signer_name"
        else
            echo -e "   ❌ ${RED}UNSIGNED${NC}"
        fi
        
        if [ "$error_message" != "null" ] && [ "$error_message" != "" ]; then
            echo -e "   📝 Error: $error_message"
        fi
    else
        echo -e "   ❌ ${RED}API ERROR${NC}"
    fi
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
    echo -e "${RED}Error: jq is required but not installed.${NC}"
    echo "Install with: brew install jq"
    exit 1
fi

# Check if CodeSign Inspector API is running
if ! curl -s "$API_ENDPOINT" &> /dev/null; then
    echo -e "${RED}Error: CodeSign Inspector API is not running at $API_ENDPOINT${NC}"
    echo "Please start the backend service first."
    exit 1
fi

# Find and validate .app bundles
echo -e "\n🔍 Scanning for applications..."

total_apps=0
valid_apps=0
invalid_apps=0
unsigned_apps=0

for dir in "${APP_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "\n📂 Scanning directory: ${BLUE}$dir${NC}"
        
        while IFS= read -r -d '' app_path; do
            if [ -d "$app_path" ]; then
                validate_app "$app_path"
                ((total_apps++))
                
                # Parse response for statistics
                response=$(curl -s -X POST "$API_ENDPOINT" \
                    -H "Content-Type: application/json" \
                    -d "{\"filePath\": \"$app_path\"}")
                
                is_signed=$(echo "$response" | jq -r '.isSigned')
                is_valid=$(echo "$response" | jq -r '.isValid')
                
                if [ "$is_signed" = "true" ] && [ "$is_valid" = "true" ]; then
                    ((valid_apps++))
                elif [ "$is_signed" = "true" ] && [ "$is_valid" = "false" ]; then
                    ((invalid_apps++))
                else
                    ((unsigned_apps++))
                fi
            fi
        done < <(find "$dir" -maxdepth 1 -name "*.app" -print0 2>/dev/null)
    fi
done

# Generate summary
echo -e "\n${BLUE}📊 SUMMARY${NC}"
echo "=========="
echo -e "Total applications: $total_apps"
echo -e "${GREEN}Valid signatures: $valid_apps${NC}"
echo -e "${YELLOW}Invalid signatures: $invalid_apps${NC}"
echo -e "${RED}Unsigned applications: $unsigned_apps${NC}"

# Security recommendations
if [ $invalid_apps -gt 0 ] || [ $unsigned_apps -gt 0 ]; then
    echo -e "\n${YELLOW}⚠️  SECURITY RECOMMENDATIONS:${NC}"
    
    if [ $unsigned_apps -gt 0 ]; then
        echo "   • Review unsigned applications for potential security risks"
        echo "   • Consider removing or updating unsigned third-party software"
    fi
    
    if [ $invalid_apps -gt 0 ]; then
        echo "   • Investigate applications with invalid signatures"
        echo "   • Check for system corruption or malware"
        echo "   • Run: sudo codesign --verify --deep --strict /path/to/app.app"
    fi
    
    echo -e "\n   📖 For more details, check: https://developer.apple.com/documentation/security/notarizing_macos_software_before_distribution"
fi

echo -e "\n${GREEN}✅ macOS signature validation complete!${NC}"
