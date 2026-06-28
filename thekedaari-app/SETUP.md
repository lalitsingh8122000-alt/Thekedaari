# Thekedaari React Native App — Setup Guide

## 1. API URL Set Karein

`src/api/client.js` file mein apna backend server ka IP address dale:

```js
export const API_BASE_URL = 'http://192.168.1.100:5000';
```

> **Note:** Apne PC ka local IP dekhne ke liye Command Prompt mein `ipconfig` run karein.
> Phone aur PC ek hi WiFi pe hone chahiye.

## 2. Expo App Start Karein

```bash
cd thekedaari-app
npm start
```

Ya seedha Android/iOS ke liye:
```bash
npm run android
npm run ios
```

## 3. Phone pe Run Karein

1. Phone mein **Expo Go** app install karein (Play Store / App Store)
2. Terminal mein QR code aayega
3. Expo Go se QR scan karein

## 4. Features

| Screen | Description |
|--------|-------------|
| Login / Register | Phone + password se auth |
| Dashboard | Aaj ki summary, income/expense, top projects |
| Workers (मज़दूर) | List, search, filter; haaziree modal in-app |
| Worker Ledger | Salary earned vs paid balance |
| Projects | List with status/type filters |
| Project Finance | Summary, income tab, expense + contract tab |
| Project Attendance | Date-wise site attendance |
| Attendance Report | All-projects report by date |
| Transactions | Cash flow in/out by date range |
| Roles & Trades | Add worker roles + contract trade types |
| Profile | User info + logout |

## 5. Navigation Structure

```
Bottom Tabs:
├── 🏠 Dashboard
├── 👷 Workers
│   ├── Workers List
│   ├── Worker Add/Edit Form
│   └── Worker Ledger
├── 🏗️ Projects
│   ├── Projects List
│   ├── Project Add/Edit Form
│   ├── Project Finance (Summary / Income / Expense)
│   └── Project Attendance
├── 📅 Attendance (Report)
└── ☰ More
    ├── Attendance Report
    ├── Transactions
    ├── Roles & Trades
    └── Profile
```
