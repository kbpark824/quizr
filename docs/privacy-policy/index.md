# Privacy Policy for Quizr

**Last updated: August 11, 2025**

## Overview

Quizr is a simple daily trivia app that delivers one trivia question per day via push notifications. We believe in minimal data collection and maximum privacy. This policy explains what limited data we collect and how we use it.

## What Data We Collect

### Push Notification Tokens
- **What**: Device push notification tokens (in ExponentPushToken format)
- **Why**: To send you daily trivia notifications
- **How**: Automatically collected when you first open the app and allow notifications
- **Storage**: Stored securely in our Supabase database

### Anonymous Device Identifiers
- **What**: Anonymous device identifier (generated unique string like "device_1736789123_abc123def")
- **Why**: To track which daily questions you've completed
- **How**: Generated automatically when you first use the app
- **Storage**: Stored locally on your device and in our Supabase database

### Question Completion Tracking
- **What**: Record of which daily questions you've attempted/completed (no answers stored)
- **Why**: To show your progress and prevent duplicate questions
- **How**: Tracked when you view or complete daily trivia questions
- **Note**: Only completion status is stored, not your actual answers

## What Data We DON'T Collect

We do **not** collect:
- Your name, email, or any personal information
- User accounts or login credentials
- Your answers to trivia questions
- Location data
- Contact lists or other device information beyond anonymous identifiers
- Any data that can personally identify you

## How We Use Your Data

### Push Notification Tokens
- Send daily trivia questions via push notifications
- Ensure notifications are delivered to your device
- Remove invalid or expired tokens from our system

### Anonymous Device Identifiers
- Track your daily question completion progress
- Prevent showing you the same question twice
- Maintain your trivia streak across app sessions

### Question Completion Data
- Display your daily trivia progress
- Ensure each user gets one question per day
- Maintain app functionality without requiring user accounts

## Data Sharing

We use these third-party services:

### Supabase
- **Purpose**: Database storage for push notification tokens and question completion tracking
- **Data shared**: Push notification tokens and anonymous device identifiers with completion status
- **Privacy policy**: [Supabase Privacy Policy](https://supabase.com/privacy)

### Expo Push Notification Service
- **Purpose**: Delivery of push notifications
- **Data shared**: Push notification tokens and message content
- **Privacy policy**: [Expo Privacy Policy](https://expo.dev/privacy)

### Open Trivia Database
- **Purpose**: Source of trivia questions
- **Data shared**: None (we only fetch questions, not share any user data)
- **Website**: [opentdb.com](https://opentdb.com)

We do **not**:
- Sell your data to anyone
- Share your data for advertising purposes
- Use your data for marketing unrelated products

## Data Retention

- **Push tokens**: Stored until you uninstall the app or the token expires
- **Device identifiers**: Stored locally on your device and in our database indefinitely
- **Question completion data**: Retained to maintain your progress history
- **Automatic cleanup**: Invalid push tokens are automatically removed from our system

## Your Rights and Choices

### Notification Control
- **Disable notifications**: Turn off push notifications in your device settings
- **Uninstall**: Simply delete the app to stop all data collection

### Data Deletion
- **Automatic**: Uninstalling the app will stop data collection and remove local device identifier
- **Manual request**: Email us at support@quizr.app to request deletion of your push token and completion data

### Data Access
- **What we have**: We can tell you if we have a push token and completion data for your device
- **Request access**: Email support@quizr.app with your request and device information

## Data Security

We protect your data through:
- Encrypted connections (HTTPS/TLS)
- Secure database storage with Supabase
- Row-level security policies in our database
- Regular security updates and monitoring

## Children's Privacy

Quizr is suitable for users 13 and older. We do not knowingly collect data from children under 13. If you believe a child under 13 has used our app, please contact us at support@quizr.app.

## International Users

Your data may be processed and stored in the United States where our service providers (Supabase, Expo) operate. By using our app, you consent to this data transfer.

## Changes to This Policy

We may update this privacy policy occasionally. When we do:
- We'll update the "Last updated" date at the top
- Significant changes will be communicated via push notification
- The updated policy will be available in the app's About section

## Contact Us

If you have questions about this privacy policy or your data:

- **Email**: support@quizr.app
- **Response time**: We aim to respond within 48 hours

## Legal Basis (for EU users)

If you're in the European Union, our legal basis for processing your data is:
- **Legitimate interest**: For app functionality and improvements
- **Consent**: For sending push notifications (which you can withdraw anytime)

---

*This privacy policy is designed to be simple and transparent, just like our app. We collect only what's necessary to deliver daily trivia questions and track your progress without requiring user accounts.*