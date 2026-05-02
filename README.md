# 🎨 C-Board

**C-Board** is a premium, real-time collaborative whiteboard application designed for teams and creators. Sketch ideas, plan workflows, and collaborate instantly with a sleek, minimal interface.

![C-Board Preview](https://via.placeholder.com/1200x600?text=C-Board+Preview)

## ✨ Features

- **Real-time Collaboration**: See everyone's strokes instantly via WebSockets.
- **Infinite Canvas**: Plenty of space for your biggest ideas.
- **Multiple Tools**: 
  - 🖋️ Smooth Pen tool
  - 🟦 Shapes (Rectangle, Circle, Line)
  - 🔤 Text tool
  - 🧼 Eraser
- **Live Presence**: Real-time cursor tracking with name labels and unique colors.
- **Room Management**: Create private rooms or join existing ones via unique IDs.
- **Premium UI**: Modern dark mode with glassmorphic components and a liquid cursor effect.
- **Zero Friction**: No sign-up required. Just create a room and start drawing.

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite** (Fast build tool)
- **Tailwind CSS v4** (Modern styling)
- **Framer Motion** (Fluid animations)
- **Lucide React** (Beautiful icons)

### Backend
- **Node.js** + **Express**
- **ws** (High-performance WebSockets)
- **nanoid** (Secure room IDs)

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/c-board.git
   cd c-board
   ```

2. **Setup Server**
   ```bash
   cd server
   npm install
   npm run dev
   ```

3. **Setup Client**
   ```bash
   cd ../client
   npm install
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 📁 Project Structure

```
c-board/
├── client/              # React + Vite Frontend
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── hooks/       # Custom React hooks (WS, Canvas)
│   │   ├── pages/       # Page-level components
│   │   ├── types/       # TypeScript interfaces
│   │   └── App.tsx      # Main routing
├── server/              # Node.js + WebSocket Backend
│   ├── index.ts        # Entry point
│   ├── roomManager.ts  # Logic for handling rooms & broadcasting
└── docker-compose.yml   # Docker configuration
```

## 🤝 Contributing
Contributions are welcome! Feel free to open an issue or submit a pull request.

## 📄 License
MIT License - feel free to use this project for your own purposes!
