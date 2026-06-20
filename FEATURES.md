# New Features Documentation

This document describes the newly implemented features in Info-Sphere.

## 1. Article Translation

### Overview

Translate news headlines and content into your preferred language from 20+ supported languages.

### Features

- **Language Selector**: Dropdown in the header to select your preferred language
- **Persistent Preference**: Your language choice is saved in localStorage
- **20+ Languages**: Support for English, Spanish, French, German, Italian, Portuguese, Russian, Chinese, Japanese, Korean, Arabic, Hindi, Bengali, Dutch, Polish, Turkish, Vietnamese, Thai, Indonesian, and Swedish
- **Auto-Detection**: Automatically detects browser language on first visit

### Implementation Details

- **Service**: `src/client/services/translation.ts`
- **Component**: `src/components/LanguageSelector.tsx`
- **Storage Key**: `info-sphere:preferred-language`

### Usage

1. Click the language selector in the header (globe icon)
2. Choose your preferred language from the dropdown
3. The selection is automatically saved and persists across sessions

### Future Enhancements

The current implementation includes a placeholder translation function. To enable real translation:

1. Integrate with a translation API (Google Translate, Microsoft Translator, DeepL, or LibreTranslate)
2. Add your API key to environment variables
3. Update the `translateText` function in `translation.ts`

---

## 2. Dark Mode Scheduler

### Overview

Automatically switch between light and dark themes based on time of day.

### Features

- **Automatic Switching**: Set specific times for light and dark mode activation
- **Customizable Schedule**: Configure start times for both themes
- **Visual Feedback**: Shows next scheduled theme change
- **Manual Override**: Can still manually toggle theme at any time
- **Persistent Settings**: Schedule preferences saved in localStorage

### Implementation Details

- **Service**: `src/client/services/theme-scheduler.ts`
- **Component**: `src/components/ThemeScheduler.tsx`
- **Storage Key**: `info-sphere:theme-schedule`
- **Check Interval**: Every 60 seconds

### Default Schedule

- **Light Mode**: Starts at 06:00 (6:00 AM)
- **Dark Mode**: Starts at 18:00 (6:00 PM)

### Usage

1. Click the clock icon in the header
2. Toggle "Enable automatic theme switching"
3. Set your preferred times for light and dark mode
4. Click "Save"
5. The theme will automatically switch at the specified times

### Technical Details

- Scheduler runs in the background checking every minute
- Handles edge cases like midnight transitions
- Integrates with existing theme toggle functionality
- Uses MutationObserver to sync UI with theme changes

---

## 3. Improved Sorting and Filtering

### Overview

Advanced sorting options to organize news articles based on different criteria.

### Features

- **Multiple Sort Options**:
  - **Newest First**: Sort by publication date (newest to oldest)
  - **Oldest First**: Sort by publication date (oldest to newest)
  - **Most Popular**: Sort by engagement (views + shares)
  - **Source (A-Z)**: Sort alphabetically by source name
  - **Source (Z-A)**: Sort reverse alphabetically by source name

- **Persistent Preference**: Sort option is saved and restored on next visit
- **Real-time Sorting**: Articles are re-sorted immediately when option changes
- **Engagement-Based**: "Most Popular" uses actual user engagement data

### Implementation Details

- **Service**: `src/client/services/sorting-filtering.ts`
- **Integration**: `src/components/NewsList.tsx`
- **Storage Key**: `info-sphere:sort-option`

### Usage

1. Navigate to any news page
2. Use the "Sort by" dropdown above the articles
3. Select your preferred sorting option
4. Articles are immediately re-ordered
5. Your preference is saved for future visits

### Sorting Algorithm

- **Newest/Oldest**: Uses article `publishedAt` timestamp
- **Popular**: Calculates score as `views + (shares × 2)`
- **Source**: Uses case-insensitive alphabetical comparison

### Future Enhancements

The filtering service also includes functions for:

- Filtering by source
- Filtering by date range
- Filtering by search term
- These can be integrated with UI components as needed

---

## Architecture Compliance

All new features follow the existing architecture principles:

### SOLID Principles

- **Single Responsibility**: Each service has one clear purpose
- **Open/Closed**: Services are extensible without modification
- **Dependency Inversion**: Services accept dependencies as parameters

### Design Patterns

- **Service Layer Pattern**: Business logic encapsulated in services
- **Observer Pattern**: State synchronization via localStorage events
- **Strategy Pattern**: Interchangeable sorting algorithms

### Code Organization

- Services in `src/client/services/`
- Components in `src/components/`
- Type-safe with TypeScript
- Comprehensive error handling
- LocalStorage for persistence

---

## Testing

### Manual Testing Checklist

#### Translation Feature

- [ ] Language selector appears in header
- [ ] Can select different languages
- [ ] Selection persists after page reload
- [ ] Works on mobile and desktop

#### Dark Mode Scheduler

- [ ] Scheduler dialog opens from header
- [ ] Can enable/disable automatic switching
- [ ] Can set custom times
- [ ] Shows next scheduled change
- [ ] Theme switches at specified times
- [ ] Manual toggle still works

#### Sorting/Filtering

- [ ] Sort dropdown appears above articles
- [ ] All sort options work correctly
- [ ] Sorting is immediate
- [ ] Preference persists after reload
- [ ] Works with source filtering

### Automated Testing

To add unit tests for these features:

```bash
# Create test files
touch src/client/services/translation.test.ts
touch src/client/services/theme-scheduler.test.ts
touch src/client/services/sorting-filtering.test.ts

# Run tests
npm test
```

---

## Performance Considerations

1. **Translation**: Currently uses simulated translation (no API calls)
2. **Theme Scheduler**: Minimal overhead (1 check per minute)
3. **Sorting**: Uses memoization to prevent unnecessary re-sorts
4. **LocalStorage**: All preferences cached locally for instant access

---

## Browser Compatibility

All features are compatible with:

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## Troubleshooting

### Translation not working

- Check browser console for errors
- Verify localStorage is enabled
- Clear localStorage and try again

### Theme scheduler not switching

- Verify times are in HH:MM format
- Check that scheduler is enabled
- Ensure browser tab is not suspended

### Sorting not persisting

- Check localStorage quota
- Verify no browser extensions blocking storage
- Try clearing site data and reconfiguring

---

## Future Roadmap

### Potential Enhancements

1. **Translation**: Integrate real translation API
2. **Filtering**: Add UI for date range and source filters
3. **Scheduler**: Add multiple schedules (weekday/weekend)
4. **Sorting**: Add custom sort orders
5. **Export**: Export preferences for backup/sync
