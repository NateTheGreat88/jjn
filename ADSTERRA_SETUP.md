# Adsterra Integration Setup Guide

## Step 0: Add Your Website to Adsterra (First Time Setup)

If you haven't added your website yet:

1. Log into your Adsterra publisher dashboard: https://publishers.adsterra.com/
2. Click **ADD WEBSITE** button (top right of the dashboard)
3. Fill in your website details:
   - **Website URL**: Your website's URL (e.g., `https://yourdomain.com` or your hosting URL)
   - **Website Category**: Select the appropriate category (Gaming, Entertainment, etc.)
   - **Website Description**: Brief description of your site
   - **Traffic**: Select your traffic level
4. Submit the form and wait for approval (usually takes a few hours to 1-2 days)
5. Once approved, you'll see your website in the Websites list

## Step 1: Get Your Ad Codes from Adsterra

1. Log into your Adsterra publisher dashboard
2. Go to **Websites** → Select your website (after it's approved)
3. Click **AD UNIT** → Choose an ad format (Banner, Square, etc.)
4. Configure your ad unit:
   - Select ad size (728x90 for banner, 300x250 for square, etc.)
   - Set any custom settings
   - Click **Create** or **Save**
5. Click **GET CODE** to copy your ad code
6. You'll get an ad unit ID/key that looks like: `xxxxxxxxxxxxxxxx`

## Step 2: Configure Ad Codes

Edit `js/adsterra.js` and replace the empty `id` fields with your actual Adsterra ad unit IDs:

```javascript
const adsterraConfig = {
    banner: {
        id: 'YOUR_BANNER_AD_ID_HERE',  // Replace with your actual ID
        width: '728',
        height: '90'
    },
    square: {
        id: 'YOUR_SQUARE_AD_ID_HERE',  // Replace with your actual ID
        width: '300',
        height: '250'
    },
    // ... etc
};
```

## Step 3: Add Ads to Your Pages

### Option A: Automatic Placement (Recommended)

Add this to the `<head>` section of your HTML pages:

```html
<link rel="stylesheet" href="css/adsterra.css">
<script src="js/adsterra.js" defer></script>
```

Then add ad containers where you want ads to appear:

```html
<!-- Header ad -->
<div class="adsterra-ad adsterra-header" data-ad-type="banner"></div>

<!-- Inline content ad -->
<div class="adsterra-ad adsterra-inline" data-ad-type="square"></div>

<!-- Footer ad -->
<div class="adsterra-ad adsterra-footer" data-ad-type="square"></div>
```

### Option B: Programmatic Placement

Use JavaScript to insert ads dynamically:

```javascript
// Insert ad after header
adsterra.insertAd('header', 'banner');

// Insert ad in footer
adsterra.insertAd('footer', 'square');

// Insert inline ad
adsterra.insertAd('inline', 'square');
```

## Step 4: Ad Placement Recommendations

### Homepage (`index.html`)
- **Header**: Banner ad (728x90)
- **Between sections**: Square ad (300x250)
- **Footer**: Square ad (300x250)

### Game Pages (`game.html`, `minigames.html`, etc.)
- **Top**: Mobile banner (320x50) on mobile, Square (300x250) on desktop
- **Bottom**: Square ad (300x250)

### Content Pages (`chat.html`, `profile.html`, etc.)
- **Sidebar**: Skyscraper (160x600) on desktop
- **Inline**: Square ad (300x250) between content sections

## Step 5: Testing

1. Open your website in a browser
2. Check browser console for any errors
3. Verify ads are loading correctly
4. Test on mobile devices (ads should auto-adjust)

## Important Notes

- **Ad Blockers**: Some users may have ad blockers enabled
- **Mobile Responsive**: Ads automatically adjust for mobile devices
- **Performance**: Ads load asynchronously to not block page rendering
- **Privacy**: Adsterra handles all ad serving and tracking

## Troubleshooting

### Ads not showing?
1. Check that ad IDs are correctly configured in `js/adsterra.js`
2. Verify ad codes are copied correctly from Adsterra dashboard
3. Check browser console for JavaScript errors
4. Make sure ad blockers are disabled for testing

### Ads breaking layout?
- Check CSS in `css/adsterra.css`
- Adjust margins/padding as needed
- Use browser DevTools to inspect ad containers

### Need help?
- Check Adsterra documentation: https://publishers.adsterra.com/
- Review Adsterra dashboard for ad unit status

## Example: Adding Ads to index.html

```html
<!DOCTYPE html>
<html>
<head>
    <!-- ... existing head content ... -->
    <link rel="stylesheet" href="css/adsterra.css">
    <script src="js/adsterra.js" defer></script>
</head>
<body>
    <!-- ... existing content ... -->
    
    <!-- Header ad -->
    <div class="adsterra-ad adsterra-header" data-ad-type="banner"></div>
    
    <main>
        <!-- Your content -->
    </main>
    
    <!-- Inline ad -->
    <div class="adsterra-ad adsterra-inline" data-ad-type="square"></div>
    
    <!-- Footer ad -->
    <div class="adsterra-ad adsterra-footer" data-ad-type="square"></div>
    
    <!-- ... rest of page ... -->
</body>
</html>
```

## Updating Ad Codes

When you get new ad codes from Adsterra:
1. Update the `id` fields in `js/adsterra.js`
2. Clear browser cache
3. Refresh your pages

That's it! Your ads should now be displaying on your website.

