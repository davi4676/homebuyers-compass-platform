# Easier Paths to Create Educational Videos

These options are **simpler than the Google + OBS workflow** — fewer tools, less setup.

---

## 🏆 Recommended: Loom (Easiest Overall)

**Best if:** You're okay recording your own voice.

| | |
|---|---|
| **What it is** | One-click screen + mic recorder. Record your slides while you talk. |
| **Cost** | Free — 25 videos, 5 min each (plenty for 30–90 sec clips) |
| **Setup** | Install browser extension, sign up (free) |
| **Steps** | 1. Open slides in present mode 2. Click Loom 3. Record 4. Share link |

**Flow:**
1. Put script in Google Docs, slides in Google Slides (or Canva)
2. Go to [loom.com](https://loom.com) → Install Chrome extension
3. Open slides in fullscreen → Click Loom icon → Record
4. Talk through the script, advance slides as you go
5. Stop recording → Copy share link
6. **Embed:** Loom links can be embedded. For app: upload to YouTube (Loom → Download → Upload to YouTube) or use Loom embed if supported.

**Limits:** 5 min max per video on free plan. Fine for 30–90 sec videos.

---

## 🎨 Canva (Design + AI Voice in One)

**Best if:** You want **no recording** — AI reads your script.

| | |
|---|---|
| **What it is** | Design slides + add AI voiceover, export video. All in one tool. |
| **Cost** | Free tier with AI usage limits |
| **Setup** | Sign up at canva.com |

**Flow:**
1. Create design → Video (or Presentation)
2. Add slides (titles, bullets) — use templates
3. Add AI Voice: Apps → "Text to Speech" or "AI Voice" → Paste script → Pick voice
4. Sync voice to timeline
5. Export as MP4
6. Upload to YouTube → Add video ID to `lib/educational-videos.ts`

**Pros:** No mic, no OBS, no separate recording step.  
**Cons:** AI voice may sound less personal; free tier has limits.

---

## ✂️ CapCut (AI Voice + Editing)

**Best if:** You want AI voice + simple timeline editing.

| | |
|---|---|
| **What it is** | Video editor with built-in AI text-to-speech. Import slides as images, add voiceover. |
| **Cost** | Free, no watermark on desktop export |
| **Setup** | Download from capcut.com |

**Flow:**
1. Export slides as PNGs from Google Slides or Canva
2. CapCut: New project → Import images
3. Add to timeline in order
4. Add text → "Text to Speech" → Paste script → Generate
5. Adjust timing so each slide matches the narration
6. Export MP4 → Upload to YouTube

**Pros:** Free, natural AI voices, full control over timing.  
**Cons:** Manual sync of slides to audio.

---

## 📊 Comparison

| Path | Tools | Recording | Setup Time | Best For |
|------|-------|-----------|------------|----------|
| **Loom** | Loom + Slides | Your voice | ~5 min | Fastest to first video |
| **Canva** | Canva only | AI voice | ~15 min | No mic, all-in-one |
| **CapCut** | CapCut + Slides | AI voice | ~20 min | Best AI voice quality |
| **Google + OBS** | Docs, Slides, OBS, YouTube | Your voice | ~30 min | Full control |

---

## Adding Videos to the App

Once you have videos (from any tool):

1. **Upload to YouTube** (or keep Loom links for Loom-hosted)
2. Get the video ID from the URL: `youtube.com/watch?v=**XXXXX**` → use `XXXXX`
3. Edit `prototype/lib/educational-videos.ts`:

```ts
export const EDUCATIONAL_VIDEO_IDS: Record<string, string> = {
  preparation: 'YOUR_VIDEO_ID_HERE',
  'pre-approval': '...',
  // etc.
}
```

4. Videos will appear automatically on the Playbooks (Resources) page for each phase.

---

## Suggested First Video

Start with **Step 1: Preparation & Planning** using **Loom**:

1. Copy the script from the video script doc
2. Make 4–5 slides in Canva or Google Slides
3. Record with Loom (2–3 minutes)
4. Download from Loom, upload to YouTube as Unlisted
5. Add the YouTube video ID to `educational-videos.ts`

You'll have your first embedded video in the app within an hour.
