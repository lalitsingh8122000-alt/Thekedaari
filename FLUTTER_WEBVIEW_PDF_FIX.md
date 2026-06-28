# Flutter WebView — PDF Download Fix

## Problem

In the Android Flutter app, tapping **Download Report** does nothing.

**Root causes:**
1. `window.open()` is blocked by WebView — returns `null` (no new windows allowed)
2. `window.print()` is silently ignored by WebView

**Web-side code is already fixed** to handle case #1 via an iframe overlay fallback.  
What remains is enabling `window.print()` support on the Flutter/app side.

---

## Which WebView package are you using?

Check your `pubspec.yaml` — find either `flutter_inappwebview` or `webview_flutter`.

---

## Option A — `flutter_inappwebview` ✅ Recommended

This is the simplest fix — just one new callback needed.

### Step 1 — Verify / add dependencies in `pubspec.yaml`

```yaml
dependencies:
  flutter_inappwebview: ^6.1.5
```

Run:
```bash
flutter pub get
```

### Step 2 — Add `onPrint` callback to your `InAppWebView` widget

Find where you declare `InAppWebView(...)` and add the `onPrint` and `onCreateWindow` callbacks:

```dart
import 'package:flutter_inappwebview/flutter_inappwebview.dart';

InAppWebView(
  initialUrlRequest: URLRequest(url: WebUri("https://yourapp.com")),
  initialSettings: InAppWebViewSettings(
    javaScriptEnabled: true,
    useWideViewPort: true,
    loadWithOverviewMode: true,
    supportZoom: true,
    builtInZoomControls: true,
    displayZoomControls: false,
  ),

  // ✅ KEY CHANGE — fires whenever window.print() is called from the web page
  onPrint: (controller, url) async {
    await controller.printCurrentPage();
  },

  // ✅ Optional — allows window.open() popups (web code already handles null case)
  onCreateWindow: (controller, createWindowAction) async {
    return true;
  },
)
```

### Step 3 — Android manifest

In `android/app/src/main/AndroidManifest.xml`, ensure the `<application>` tag has:

```xml
<application
    android:usesCleartextTraffic="true"
    ...>
```

### That's it for Option A. No web-side changes needed.

---

## Option B — `webview_flutter` (Google's official package)

This package does **not** support `window.print()` or `window.open()` natively.  
The fix requires a **JavaScript channel** — the web page sends the HTML string to Flutter, and Flutter prints it using the `printing` package.

### Step 1 — Add dependencies in `pubspec.yaml`

```yaml
dependencies:
  webview_flutter: ^4.10.0
  printing: ^5.13.2
```

Run:
```bash
flutter pub get
```

### Step 2 — Add JavaScript channel to your WebViewController

```dart
import 'package:webview_flutter/webview_flutter.dart';
import 'package:printing/printing.dart';

late final WebViewController _controller;

@override
void initState() {
  super.initState();

  _controller = WebViewController()
    ..setJavaScriptMode(JavaScriptMode.unrestricted)
    ..addJavaScriptChannel(
      'FlutterPrint', // ← must match exactly what the web page calls
      onMessageReceived: (JavaScriptMessage message) async {
        // message.message is the full HTML string from the web page
        await Printing.layoutPdf(
          onLayout: (format) async {
            return await Printing.convertHtml(
              format: format,
              html: message.message,
            );
          },
        );
      },
    )
    ..loadRequest(Uri.parse('https://yourapp.com'));
}
```

### Step 3 — Notify web team to update the JS

The web-side `printInIframe` function needs to detect `FlutterPrint` channel and use it.  
Share this note with the web developer:

> In `printInIframe()` in both `attendance/page.js` and `workers/[id]/report/page.js`,
> update the iframe `load` event handler to:
>
> ```js
> iframe.addEventListener('load', () => {
>   // If running inside Flutter webview_flutter, use the JS channel
>   if (window.FlutterPrint) {
>     window.FlutterPrint.postMessage(html);
>   } else {
>     try { iframe.contentWindow.focus(); iframe.contentWindow.print(); } catch { /* unsupported */ }
>   }
>   const cleanup = () => { wrapper.remove(); window.removeEventListener('focus', cleanup); };
>   setTimeout(() => window.addEventListener('focus', cleanup), 1500);
> });
> ```

---

## Decision Table

| Package | Change needed | Difficulty |
|---|---|---|
| `flutter_inappwebview` | Add `onPrint` callback + `onCreateWindow` | ⭐ Easy — 10 lines |
| `webview_flutter` | Add JS channel + web code update | ⭐⭐ Medium — both sides |
| Other / custom WebView | Contact web team for JS channel approach | ⭐⭐⭐ Depends |

---

## Testing Checklist

After the fix is deployed:

- [ ] Tap **Download Report** on Android app → overlay appears with report
- [ ] Android Print / Save as PDF system sheet opens
- [ ] PDF saves successfully to device
- [ ] **✕ Close** button dismisses the overlay
- [ ] iOS PWA still works (popup window opens as before)
- [ ] Desktop browser still works (popup window opens as before)
- [ ] Worker salary report PDF also works (same fix applies)

---

## Contact

Web-side PDF code lives in:
- `frontend/src/app/attendance/page.js` — Attendance report
- `frontend/src/app/workers/[id]/report/page.js` — Worker salary report
