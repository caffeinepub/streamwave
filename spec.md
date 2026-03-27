# StreamWave – Offline Video & Free Calling App

## Current State
New project. Empty backend and blank frontend.

## Requested Changes (Diff)

### Add
- **Offline Video Library**: Users can paste/enter a video URL, the app downloads and caches it in IndexedDB for offline playback. Video list shows saved videos with thumbnails, title, and play/delete controls.
- **WebRTC Free Calling**: Users enter a username/room ID, can start a voice+video call with another user for free using WebRTC peer-to-peer. Signaling is handled via the ICP backend.
- **PWA manifest + service worker**: App works offline once loaded.
- **Dark-themed UI**: Deep navy/teal design matching design preview.

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: Store user presence/signaling data for WebRTC (offer/answer/ICE candidates), and video metadata.
2. Frontend:
   - PWA: manifest.json + service worker registration
   - Offline Video tab: add URL → fetch & store in IndexedDB → list saved videos → play in <video> element
   - Calls tab: enter name + room → WebRTC signaling via backend polling → peer video/audio stream
   - Navigation between two tabs (Videos, Calls)
   - Dark navy/teal design as per design preview
