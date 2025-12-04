import { useEffect, useRef, useState, useMemo } from "react"
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle, Download, CloudUpload, Music, Disc, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
type Mood = "all" | "sad" | "energy" | "power" | "euphoria"
interface Track {
id: string
title: string
artist: string
duration: string
url: string
remoteUrl: string
image?: string
cached?: boolean
progress?: number
}
interface ManifestTrack {
id: string
title: string
artist: string
filename: string
image?: string
}
const LOCAL_KEY = (m: Mood) => `playerTracks_${m}`
const SETTINGS_KEY = "playerSettings"
const ft = (t: number) => {
if (!t || isNaN(t)) return "0:00"
const m = Math.floor(t / 60)
const s = Math.floor(t % 60)
return `${m}:${String(s).padStart(2, "0")}`
}
const moodFolders: Record<Mood, string[]> = {
all: ["/music", "/music2"],
sad: ["/music"],
energy: ["/music2"],
power: ["/music2"],
euphoria: ["/music2"],
}
const moods: { id: Mood; icon: string; label: string }[] = [
{ id: "all", icon: "♪", label: "All" },
{ id: "sad", icon: ":'(", label: "Sad" },
{ id: "energy", icon: "Ἒ", label: "Energy" },
{ id: "power", icon: "OwO", label: "Power" },
{ id: "euphoria", icon: "(´◡`)", label: "Euphoria" },
]
export const MusicPlayer = () => {
const [mood, setMood] = useState<Mood>("all")
const [tracks, setTracks] = useState<Track[]>([])
const [il, setIL] = useState(true)
const [lc, setLC] = useState(0)
const [tc, setTC] = useState(0)
const [ct, setCT] = useState(0)
const [ip, setIP] = useState(false)
const [sh, setSH] = useState(false)
const [lp, setLP] = useState(false)
const [tm, setTM] = useState(0)
const [du, setDU] = useState(0)
const [currentTime, setCurrentTime] = useState(new Date())
const ar = useRef<HTMLAudioElement | null>(null)
const fr = useRef<HTMLInputElement | null>(null)
const or = useRef<string | null>(null)
const getCache = async (u: string) => {
if (!("caches" in window)) return null
try {
const c = await caches.open("music-player-cache-v1")
const r = await c.match(u)
if (!r) return null
const b = await r.blob()
return URL.createObjectURL(b)
} catch {
return null
}
}
const cacheTrack = async (u: string, setProg: (n: number) => void) => {
const c = await caches.open("music-player-cache-v1")
const r = await fetch(u)
if (!r.ok) throw 0
const reader = r.body!.getReader()
let rec = new Uint8Array()
let len = Number(r.headers.get("Content-Length") || 0)
let got = 0
for (; ;) {
const { done, value } = await reader.read()
if (done) break
got += value.length
let tmp = new Uint8Array(rec.length + value.length)
tmp.set(rec)
tmp.set(value, rec.length)
rec = tmp
setProg(Math.floor((got / len) * 100))
}
const blob = new Blob([rec])
await c.put(u, new Response(blob))
return URL.createObjectURL(blob)
}
useEffect(() => {
setIL(true)
; (async () => {
try {
const s = localStorage.getItem(LOCAL_KEY(mood))
if (s) {
const p: Track[] = JSON.parse(s)
const rh = await Promise.all(
p.map(async (t) => {
if (t.cached) {
const o = await getCache(t.remoteUrl)
if (o) return { ...t, url: o, cached: true }
}
return { ...t, url: t.remoteUrl, cached: false }
})
)
setTracks(rh)
setTC(rh.length)
setLC(rh.length)
setIL(false)
return
}
const folders = moodFolders[mood]
let allTracks: Track[] = []
for (const bp of folders) {
try {
const rs = await fetch(`${bp}/manifest.json`)
if (!rs.ok) continue
const mf: ManifestTrack[] = await rs.json()
const folderTracks: Track[] = mf.map((m) => ({
id: `${bp}-${m.id}`,
title: m.title,
artist: m.artist,
duration: "0:00",
remoteUrl: `${bp}/${m.filename}`,
url: `${bp}/${m.filename}`,
image: m.image ? `${bp}/${m.image}` : undefined,
cached: false,
progress: 0,
}))
allTracks = [...allTracks, ...folderTracks]
} catch {
continue
}
}
setTC(allTracks.length)
const c = await caches.open("music-player-cache-v1")
for (let i = 0; i < allTracks.length; i++) {
if (await c.match(allTracks[i].remoteUrl)) allTracks[i].cached = true
setLC(i + 1)
}
setTracks(allTracks)
localStorage.setItem(
LOCAL_KEY(mood),
JSON.stringify(allTracks.map(({ url, progress, ...k }) => k))
)
} catch {
setTracks([])
} finally {
setIL(false)
}
})()
setLC(0)
}, [mood])
useEffect(() => {
localStorage.setItem(
LOCAL_KEY(mood),
JSON.stringify(tracks.map(({ url, progress, ...k }) => k))
)
}, [tracks, mood])
useEffect(() => {
try {
const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || "{}")
if (s.ct !== undefined) setCT(s.ct)
if (s.ip !== undefined) setIP(s.ip)
if (s.sh !== undefined) setSH(s.sh)
if (s.lp !== undefined) setLP(s.lp)
} catch { }
}, [])
useEffect(() => {
localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ct, ip, sh, lp }))
}, [ct, ip, sh, lp])
useEffect(() => {
const a = ar.current
if (!a) return
const t = tracks[ct]
if (!t) return
; (async () => {
if (or.current) try { URL.revokeObjectURL(or.current) } catch { }
if (t.cached) {
const o = await getCache(t.remoteUrl)
if (o) {
a.src = o
or.current = o
} else a.src = t.remoteUrl
} else a.src = t.remoteUrl
a.load()
if (ip) a.play().catch(() => { })
})()
}, [ct, tracks])
useEffect(() => {
const a = ar.current
if (!a) return
let lastUpdate = 0
const ot = () => {
const now = Date.now()
if (now - lastUpdate > 250) {
setTM(a.currentTime)
lastUpdate = now
}
}
const lm = () => setDU(a.duration || 0)
const ed = () => {
if (lp) {
a.currentTime = 0
a.play()
return
}
if (sh) setCT(Math.floor(Math.random() * tracks.length))
else setCT((p) => (p + 1) % tracks.length)
}
a.addEventListener("timeupdate", ot)
a.addEventListener("loadedmetadata", lm)
a.addEventListener("ended", ed)
return () => {
a.removeEventListener("timeupdate", ot)
a.removeEventListener("loadedmetadata", lm)
a.removeEventListener("ended", ed)
}
}, [lp, sh, tracks.length])
useEffect(() => {
const a = ar.current
if (!a) return
ip ? a.play().catch(() => { }) : a.pause()
}, [ip])
useEffect(() => {
const interval = setInterval(() => {
setCurrentTime(new Date())
}, 1000)
return () => clearInterval(interval)
}, [])
const fp = () => {
if (!tracks.length) return toast.error("No songs")
setIP((p) => !p)
}
const nx = () => {
if (!tracks.length) return
if (sh) setCT(Math.floor(Math.random() * tracks.length))
else setCT((p) => (p + 1) % tracks.length)
setIP(true)
}
const pv = () => {
if (!tracks.length) return
const a = ar.current
if (a && a.currentTime > 3) a.currentTime = 0
else setCT((p) => (p - 1 + tracks.length) % tracks.length)
setIP(true)
}
const dl = async (i: number) => {
const t = tracks[i]
if (!t) return
if (t.cached) {
toast.success("Already cached")
return
}
try {
setTracks((p) => p.map((x, j) => (j === i ? { ...x, progress: 1 } : x)))
const obj = await cacheTrack(t.remoteUrl, (n) =>
setTracks((p) => p.map((x, j) => (j === i ? { ...x, progress: n } : x)))
)
const a = new Audio(obj)
await new Promise((r) => a.addEventListener("loadedmetadata", () => r(null)))
const d = ft(a.duration || 0)
setTracks((p) =>
p.map((x, j) => (j === i ? { ...x, cached: true, url: obj, duration: d, progress: 100 } : x))
)
toast.success("Saved")
} catch {
toast.error("Failed")
}
}
const up = async (f: FileList | File[]) => {
if (!f) return
const a = []
for (const x of Array.from(f as FileList) as File[]) {
if (!x.type.startsWith("audio/")) continue
const b = await new Promise<string>((r) => {
const rd = new FileReader()
rd.onload = () => r(rd.result as string)
rd.readAsDataURL(x)
})
const t = new Audio(b)
await new Promise((r) => t.addEventListener("loadedmetadata", () => r(null)))
a.push({
id: `${Date.now()}-${x.name}`,
title: x.name.replace(/\.[^/.]+$/, ""),
artist: "Unknown",
duration: ft(t.duration || 0),
remoteUrl: b,
url: b,
cached: true,
})
}
if (!a.length) return toast.error("Audio only")
setTracks((p) => [...p, ...a])
toast.success(`Added ${a.length}`)
}
const cur = tracks[ct]
const progress = du > 0 ? (tm / du) * 100 : 0
return (
<div
className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
style={{
backgroundImage: 'url(/img/panorama.jpg)',
backgroundSize: 'cover',
backgroundPosition: 'center',
backgroundAttachment: 'fixed'
}}
>
<div className="absolute inset-0 backdrop-blur-3xl bg-black/40" />
<div className="relative z-10 w-full max-w-7xl">
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-auto">
<div className="glass-card rounded-3xl p-6">
<h3 className="text-white/90 text-sm font-semibold mb-4 uppercase tracking-wider">Playlist Moods</h3>
<div className="flex flex-wrap gap-3">
{moods.map((m) => (
<button
key={m.id}
onClick={() => setMood(m.id)}
className={`flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all ${mood === m.id
? "bg-white/20 ring-2 ring-white/40"
: "bg-white/5 hover:bg-white/10"
}`}
>
<span className="text-2xl mb-1">{m.icon}</span>
<span className="text-[10px] text-white/70">{m.label}</span>
</button>
))}
</div>
</div>
<div className="glass-card-strong rounded-3xl p-8 md:col-span-1 lg:col-span-1 md:row-span-2">
<div className="flex items-center justify-between mb-6">
<h3 className="text-white/90 text-sm font-semibold uppercase tracking-wider">The Player</h3>
<button className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center">
<div className="w-2 h-2 rounded-full bg-white/50" />
</button>
</div>
<div className="relative w-full aspect-square mb-6 flex items-center justify-center">
<div className="absolute inset-0 rounded-full border-2 border-primary/30 animate-rotate"
style={{
background: `conic-gradient(from 0deg, hsl(180 80% 60% / 0.3) ${progress}%, transparent ${progress}%)`
}}
/>
<div className="absolute inset-4 rounded-full border border-primary/50 animate-pulse-ring" />
<div className="absolute inset-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 backdrop-blur-xl flex items-center justify-center overflow-hidden">
<div className="flex items-center justify-center gap-1 h-20">
{[...Array(20)].map((_, i) => (
<div
key={i}
className="w-1 bg-white/80 rounded-full transition-all duration-150"
style={{
height: ip
? `${30 + Math.sin((tm * 10 + i) / 2) * 20 + Math.random() * 20}%`
: "20%",
}}
/>
))}
</div>
</div>
<div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8">
<Music className="w-8 h-8 text-white/40 mb-2" />
<h4 className="text-white font-semibold text-sm mb-1 truncate w-full">
{cur?.title || "No Track"}
</h4>
<p className="text-white/60 text-xs truncate w-full">
{cur?.artist || "Select a song"}
</p>
</div>
</div>
</div>
<div className="glass-card rounded-3xl p-6">
<div className="flex items-center justify-center gap-4">
<Button
variant="ghost"
size="icon"
onClick={() => {
setSH((s) => !s)
toast.success(sh ? "Shuffle off" : "Shuffle on")
}}
className={`h-12 w-12 rounded-full ${sh ? "bg-white/20 text-white" : "text-white/60 hover:bg-white/10"
}`}
>
<Shuffle className="w-5 h-5" />
</Button>
<Button
variant="ghost"
size="icon"
onClick={pv}
className="h-12 w-12 rounded-full text-white/80 hover:bg-white/10"
>
<SkipBack className="w-5 h-5" />
</Button>
<Button
size="icon"
onClick={fp}
className="h-16 w-16 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-xl"
>
{ip ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7 ml-1" />}
</Button>
<Button
variant="ghost"
size="icon"
onClick={nx}
className="h-12 w-12 rounded-full text-white/80 hover:bg-white/10"
>
<SkipForward className="w-5 h-5" />
</Button>
<Button
variant="ghost"
size="icon"
onClick={() => {
setLP((l) => !l)
toast.success(lp ? "Loop off" : "Loop on")
}}
className={`h-12 w-12 rounded-full ${lp ? "bg-white/20 text-white" : "text-white/60 hover:bg-white/10"
}`}
>
<Repeat className="w-5 h-5" />
</Button>
</div>
<div className="mt-4 text-center">
<div className="text-white/50 text-xs mb-1">Now Playing</div>
<div className="text-white/80 text-sm">
{ft(tm)} / {cur?.duration || "0:00"}
</div>
</div>
</div>
<div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center">
<Clock className="w-8 h-8 text-white/40 mb-3" />
<div className="text-white text-3xl font-bold mb-1">
{currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
</div>
<div className="text-white/60 text-sm">
{currentTime.toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit' }).replace(/\//g, '.')}
</div>
</div>
<div className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center">
<Disc className={`w-16 h-16 text-primary/60 mb-3 ${ip ? 'animate-rotate' : ''}`} />
<div className="text-white text-4xl font-bold">
{Math.round(progress)}%
</div>
<div className="text-white/60 text-xs mt-1">Playback Progress</div>
</div>
<div
className="glass-card rounded-3xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-white/10 transition-all"
onClick={() => fr.current?.click()}
>
<div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mb-3">
<CloudUpload className="w-8 h-8 text-primary" />
</div>
<h4 className="text-white font-semibold mb-1">Upload MP3</h4>
<p className="text-white/60 text-xs text-center">
{il && tc > 0 ? `Loading ${lc}/${tc}...` : "Preloading 'New Track.mp3'..."}
</p>
<button className="mt-3 px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs transition-all flex items-center gap-2">
<span className="text-lg">+</span> Browse Files
</button>
</div>
<div className="glass-card rounded-3xl p-6 md:col-span-2 lg:col-span-2">
<h3 className="text-white/90 text-sm font-semibold mb-4 uppercase tracking-wider">Music Playlist</h3>
{tracks.length === 0 && !il && (
<div className="text-center py-8 text-white/50 text-sm">
No tracks found. Upload some music! 🎵
</div>
)}
<div className="space-y-2 max-h-80 overflow-y-auto custom-scrollbar pr-2">
{tracks.map((t, i) => (
<div
key={t.id}
onClick={() => {
setCT(i)
setIP(true)
}}
className={`flex items-center gap-4 p-3 rounded-2xl cursor-pointer transition-all ${i === ct
? "bg-white/15 ring-1 ring-white/20"
: "bg-white/5 hover:bg-white/10"
}`}
>
<div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/30 to-secondary/30 flex items-center justify-center overflow-hidden flex-shrink-0">
{t.image ? (
<img src={t.image} alt={t.title} className="w-full h-full object-cover" />
) : (
<Music className="w-6 h-6 text-white/40" />
)}
</div>
<div className="flex-1 min-w-0">
<h4 className="text-white font-medium text-sm truncate">{t.title}</h4>
<p className="text-white/60 text-xs truncate">{t.artist}</p>
{!t.cached && t.progress > 0 && (
<div className="w-full h-1 bg-white/10 rounded mt-1">
<div
style={{ width: `${t.progress}%` }}
className="h-full bg-primary rounded transition-all"
/>
</div>
)}
</div>
<div className="flex items-center gap-3">
<span className="text-white/50 text-xs">{t.duration}</span>
<Button
size="icon"
variant="ghost"
onClick={(e) => {
e.stopPropagation()
dl(i)
}}
className="h-8 w-8 rounded-full hover:bg-white/10 text-white/60"
>
<Download className="w-4 h-4" />
</Button>
</div>
</div>
))}
</div>
</div>
</div>
</div>
<input
ref={fr}
type="file"
accept="audio/*"
multiple
onChange={(e) => up(e.target.files)}
className="hidden"
/>
<audio ref={ar} />
</div>
)
}