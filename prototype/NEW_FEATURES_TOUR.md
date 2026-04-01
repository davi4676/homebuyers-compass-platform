# New Features Tour — Where to See Them in the App

Run the app (`npm run dev`), then open **http://localhost:3002** and use this as a checklist.

---

## 1. **Home page (with new UI pieces)**

**URL:** http://localhost:3002

- **Skip link:** Press **Tab** once. A “Skip to main content” link appears (top-left). Press Enter to jump to main content.
- **Cookie banner:** On first visit (or after clearing `localStorage`), a bar at the **bottom** asks to accept cookies, with a link to Privacy.
- **Favicon:** Check the browser tab — you should see the new 🏠 icon.

---

## 2. **Custom 404 page**

**URL:** http://localhost:3002/this-page-does-not-exist

You should see:

- **“404”** heading  
- **“This page could not be found.”**  
- **“Back to home”** button  

---

## 3. **Privacy page (for cookie banner link)**

**URL:** http://localhost:3002/privacy

- Placeholder privacy page.
- Linked from the cookie banner (“Privacy policy”).

---

## 4. **Loading state**

- Go to http://localhost:3002
- Click a link that loads a heavier page (e.g. **Homebuyer** or **Quiz**).
- You may briefly see the **spinner + “Loading...”** from `app/loading.tsx` during navigation.

---

## 5. **Error screen (only if something breaks)**

- Normally hidden.
- If a page throws an error, you get **“Something went wrong”** with **“Try again”** and **“Back to home”**.

---

## 6. **Offline indicator**

- Open the app, then in DevTools: **Network** tab → set throttling to **Offline** (or unplug network).
- A **yellow bar** at the top should say: “You are offline. Some features may be unavailable.”

---

## 7. **SEO (no visible UI)**

- **Sitemap:** http://localhost:3002/sitemap.xml  
- **Robots:** http://localhost:3002/robots.txt  

These are for search engines; you can open them in the browser to confirm they work.

---

## Quick checklist

| Feature           | Where to see it                          |
|------------------|------------------------------------------|
| Skip link        | Tab on home page                         |
| Cookie banner    | Bottom of home (first visit)              |
| Favicon          | Browser tab                              |
| 404 page         | `/any-fake-path`                         |
| Privacy page     | `/privacy` or cookie banner link         |
| Loading spinner  | Navigate between pages                   |
| Offline bar      | DevTools → Network → Offline             |
| Sitemap          | `/sitemap.xml`                           |
| Robots           | `/robots.txt`                            |
