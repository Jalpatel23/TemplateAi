# Manual Testing Guide for Error Handling

This guide shows you how to manually test all the error handling features in your application.

## 🚀 **Quick Start**

### **1. Start Your Application**
```bash
# Start the frontend
cd front
npm run front

# In another terminal, start the backend
npm run dev
```

### **2. Open Browser Developer Tools**
- Press `F12` or `Ctrl+Shift+I` (Windows/Linux)
- Press `Cmd+Option+I` (Mac)
- Go to the **Console** tab

## 🧪 **Manual Test Scenarios**

### **🌐 Network Error Tests**

#### **Test 1: Failed Fetch**
```javascript
// In browser console:
fetch('/non-existent-endpoint').catch(e => console.error(e));
```
**Expected Result**: Yellow error overlay with "Connection Error" message

#### **Test 2: Network Error**
```javascript
// In browser console:
console.error(new Error('Network Error'));
```
**Expected Result**: Yellow error overlay with connection troubleshooting tips

#### **Test 3: Internet Disconnection**
```javascript
// In browser console:
console.error(new Error('ERR_INTERNET_DISCONNECTED'));
```
**Expected Result**: Yellow error overlay with "Retry Connection" button

### **🔐 Authentication Error Tests**

#### **Test 1: Clerk Loading Failure**
```javascript
// In browser console:
console.error(new Error('Clerk: Failed to load Clerk'));
```
**Expected Result**: Blue error overlay with "Authentication Error" message

#### **Test 2: Authentication Failed**
```javascript
// In browser console:
console.error(new Error('Authentication failed'));
```
**Expected Result**: Blue error overlay with "Sign In Again" button

#### **Test 3: Unauthorized Access**
```javascript
// In browser console:
console.error(new Error('Unauthorized access'));
```
**Expected Result**: Blue error overlay with authentication troubleshooting tips

### **📦 Resource Loading Error Tests**

#### **Test 1: Image Loading Failure**
```javascript
// In browser console:
const img = new Image();
img.src = 'non-existent-image.jpg';
img.onerror = () => console.error(new Error('Image failed to load'));
```
**Expected Result**: Orange error overlay with "Resource Loading Error" message

#### **Test 2: Stylesheet Loading Error**
```javascript
// In browser console:
console.error(new Error('Stylesheet failed to load'));
```
**Expected Result**: Orange error overlay with "Retry Loading" button

#### **Test 3: Script Loading Error**
```javascript
// In browser console:
console.error(new Error('Script failed to load'));
```
**Expected Result**: Orange error overlay with resource loading tips

### **🛡️ Browser Security Error Tests**

#### **Test 1: CORS Error**
```javascript
// In browser console:
console.error(new Error('CORS policy blocked request'));
```
**Expected Result**: Purple error overlay with "Browser Security Error" message

#### **Test 2: Permission Denied**
```javascript
// In browser console:
console.error(new Error('Permission denied'));
```
**Expected Result**: Purple error overlay with "Check Settings" button

#### **Test 3: Storage Quota**
```javascript
// In browser console:
console.error(new Error('Storage quota exceeded'));
```
**Expected Result**: Purple error overlay with browser security tips

### **💾 Memory Error Tests**

#### **Test 1: Out of Memory**
```javascript
// In browser console:
console.error(new Error('Out of memory'));
```
**Expected Result**: Pink error overlay with "Memory Error" message

#### **Test 2: Memory Quota**
```javascript
// In browser console:
console.error(new Error('Memory quota exceeded'));
```
**Expected Result**: Pink error overlay with "Close Other Tabs" button

### **🔧 Script Error Tests**

#### **Test 1: Syntax Error**
```javascript
// In browser console:
console.error(new Error('Syntax error in script'));
```
**Expected Result**: Teal error overlay with "Script Error" message

#### **Test 2: Reference Error**
```javascript
// In browser console:
console.error(new Error('Reference error in script'));
```
**Expected Result**: Teal error overlay with "Refresh Page" button

#### **Test 3: Type Error**
```javascript
// In browser console:
console.error(new Error('Type error in script'));
```
**Expected Result**: Teal error overlay with script error tips

### **⚠️ Generic Error Tests**

#### **Test 1: Unknown Error**
```javascript
// In browser console:
console.error(new Error('Something unexpected happened'));
```
**Expected Result**: Red error overlay with "Something went wrong" message

#### **Test 2: Custom Error**
```javascript
// In browser console:
console.error(new Error('Custom application error'));
```
**Expected Result**: Red error overlay with "Refresh Page" button

## 🎯 **UI Interaction Tests**

### **Test Button Functionality**
1. Trigger any error using the methods above
2. **Primary Button Test**: Click the primary action button
   - Network errors: Should reload the page
   - Auth errors: Should redirect to home
   - Resource errors: Should reload the page
   - Browser errors: Should open browser settings help
   - Memory errors: Should reload the page
   - Script errors: Should reload the page

3. **Secondary Button Test**: Click the secondary action button
   - Network errors: Should open connection check
   - Auth errors: Should go to home
   - Resource errors: Should refresh page
   - Browser errors: Should suggest different browser
   - Memory errors: Should refresh page
   - Script errors: Should go to home

### **Test Hover Effects**
1. Trigger any error
2. Hover over the buttons
3. **Expected Result**: Buttons should lift up slightly with shadow

### **Test Error Overlay Styling**
1. Trigger any error
2. **Expected Result**: 
   - Overlay should cover entire screen
   - Should have dark background with blur
   - Should be centered
   - Should have proper z-index (above everything)

## 🔍 **Visual Verification Checklist**

### **Error Overlay Appearance**
- [ ] Overlay covers entire screen
- [ ] Dark background with blur effect
- [ ] Centered error message box
- [ ] Proper icon for error type
- [ ] Correct color scheme for error type
- [ ] Two action buttons present
- [ ] Troubleshooting tips section (if applicable)

### **Error Type Colors**
- [ ] **Network Errors**: Yellow (#ffc107)
- [ ] **Authentication Errors**: Blue (#17a2b8)
- [ ] **Resource Errors**: Orange (#fd7e14)
- [ ] **Browser Errors**: Purple (#6f42c1)
- [ ] **Memory Errors**: Pink (#e83e8c)
- [ ] **Script Errors**: Teal (#20c997)
- [ ] **Generic Errors**: Red (#dc3545)

### **Error Type Icons**
- [ ] **Network Errors**: 🌐
- [ ] **Authentication Errors**: 🔐
- [ ] **Resource Errors**: 📦
- [ ] **Browser Errors**: 🛡️
- [ ] **Memory Errors**: 💾
- [ ] **Script Errors**: 🔧
- [ ] **Generic Errors**: ⚠️

## 🚨 **Real-World Testing Scenarios**

### **Test 1: Internet Disconnection**
1. Open your application
2. Disconnect your internet
3. Try to perform an action that requires network
4. **Expected Result**: Yellow connection error overlay

### **Test 2: Browser Extension Conflicts**
1. Install a problematic browser extension
2. Try to use your application
3. **Expected Result**: Purple browser security error overlay

### **Test 3: Memory Pressure**
1. Open many browser tabs
2. Try to use your application
3. **Expected Result**: Pink memory error overlay

### **Test 4: Authentication Issues**
1. Clear browser cookies
2. Try to access authenticated features
3. **Expected Result**: Blue authentication error overlay

## 📊 **Test Results Tracking**

Create a simple checklist to track your test results:

```markdown
## Error Handling Test Results

### Network Errors
- [ ] Failed to fetch
- [ ] Network Error
- [ ] ERR_NETWORK
- [ ] Internet Disconnected

### Authentication Errors
- [ ] Clerk Failed to Load
- [ ] Authentication Failed
- [ ] Unauthorized Access

### Resource Errors
- [ ] Image Loading Error
- [ ] Stylesheet Loading Error
- [ ] Script Loading Error
- [ ] Media Loading Error

### Browser Errors
- [ ] CORS Error
- [ ] Permission Denied
- [ ] Storage Quota

### Memory Errors
- [ ] Out of Memory
- [ ] Memory Quota

### Script Errors
- [ ] Syntax Error
- [ ] Reference Error
- [ ] Type Error
- [ ] URI Error

### UI Interactions
- [ ] Primary Button Functionality
- [ ] Secondary Button Functionality
- [ ] Hover Effects
- [ ] Overlay Styling

### Real-World Scenarios
- [ ] Internet Disconnection
- [ ] Browser Extension Conflicts
- [ ] Memory Pressure
- [ ] Authentication Issues
```

## 🎉 **Success Criteria**

Your error handling is working correctly if:

1. **No Red React Overlay**: React's default error overlay never appears
2. **User-Friendly Messages**: All error messages are clear and actionable
3. **Proper Error Classification**: Each error type shows the correct color and icon
4. **Working Buttons**: All action buttons perform their intended functions
5. **Responsive Design**: Error overlays work on all screen sizes
6. **Accessibility**: Error messages are readable and buttons are clickable

## 🐛 **Troubleshooting**

### **If Error Overlay Doesn't Appear**
1. Check browser console for JavaScript errors
2. Verify the global error handler is initialized
3. Check if there are any console errors about the error handler

### **If Wrong Error Type is Shown**
1. Check the error message patterns in the error handler
2. Verify the error detection logic
3. Test with different error messages

### **If Buttons Don't Work**
1. Check browser console for JavaScript errors
2. Verify event listeners are properly attached
3. Test with different browsers

This manual testing guide should help you thoroughly test all aspects of the error handling system! 