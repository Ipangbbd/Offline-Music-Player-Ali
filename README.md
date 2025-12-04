# 🎵 Music Player Offline Playable

A modern, responsive music player application built with React and TypeScript that works completely offline. Stream your music collection with a beautiful glassmorphism UI design.

## Why I built this project?

Cause... honestly I'm tired of getting more and more ads in music apps, so I just
get as much .mp3 songs and dunks it in, but if you guys have any contributions or
suggestions it'd be really helpful, please contributes.

## Features

- **Offline Playback**: Play music directly from your device without internet connection
- **Mood-Based Playlists**: Organize music by mood (All, Focus, Energy, Power, Euphoria)
- **Local Caching**: Automatically cache and store music for quick access
- **File Upload**: Upload MP3 files directly to the player
- **Responsive Design**: Fully responsive UI that works on desktop, tablet, and mobile devices
- **Playback Controls**: Play, pause, next, previous, shuffle, and loop functionality
- **Progress Tracking**: Real-time playback progress and duration display
- **Modern UI**: Glassmorphism design with smooth animations and backdrop blur effects

## Screenshots

**Desktop UI:**
![Desktop UI](image.png)

**Mobile UI:**
![Mobile UI](image2.png)

## Tech Stack

- **Frontend**: React 18
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Build Tool**: Vite
- **Icons**: Lucide React
- **UI Components**: Custom shadcn/ui components
- **Notifications**: Sonner

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Bun (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ipangbbd/Music-Player-Offline-Playable.git
cd Music-Player-Offline-Playable
```

2. Install dependencies:
```bash
bun install
# or
npm install
```

3. Start the development server:
```bash
bun dev
# or
npm run dev
```

4. Build for production:
```bash
bun run build
# or
npm run build
```

## Adding Music

To add music to the player:

1. Place your audio files in the `public/music` or `public/music2` directory
2. Create a `manifest.json` file in the same directory with the following format:

```json
[
  {
    "id": "track-1",
    "title": "Song Title",
    "artist": "Artist Name",
    "filename": "song.mp3",
    "image": "album-art.jpg"
  }
]
```

3. Reload the application to see your music library

## Project Structure

```
bear-hug-player/
├── public/
│   ├── music/              # Music folder 1
│   │   └── manifest.json
│   └── music2/             # Music folder 2
│       └── manifest.json
├── src/
│   ├── components/
│   │   ├── MusicPlayer.tsx # Main player component
│   │   └── ui/             # UI components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── App.tsx
│   └── main.tsx
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

## Features Explained

### Mood-Based Organization
The player organizes music into different moods that can be toggled:
- **All**: All available tracks
- **Focus**: Concentration-friendly music
- **Energy**: Upbeat, energetic tracks
- **Power**: High-energy, motivational tracks
- **Euphoria**: Peak energy, uplifting music

### Offline Caching
Music tracks are automatically cached using the browser's Cache API, allowing for offline playback and faster loading times on subsequent visits.

### File Upload
Users can upload their own MP3 files directly through the UI. Files are stored locally and persist across sessions.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Performance

- Lightweight bundle size
- Optimized for fast loading
- Smooth animations with GPU acceleration
- Efficient state management with React hooks

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

Created by **Codevwithali**

## Contributing

Contributions are welcome! Feel free to fork this repository and submit pull requests for any improvements.

## Support

If you encounter any issues or have suggestions, please open an issue on the GitHub repository.

---

**Happy listening! 🎶**