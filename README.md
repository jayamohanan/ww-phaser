# Word Web - Interactive Word Connection Game

A responsive web game where players connect words through shared letters, built with Phaser.js for submission to Poki.

## 🎮 Game Description

Word Web is like a crossword puzzle, but instead of filling in empty squares, you're placing complete words into slots that are already the right size. Players must drag and drop words into slots so that connected slots share the same letter at specific positions.

### Key Features

- **Multiple Levels**: 5 built-in levels with increasing difficulty
- **Level Editor**: Create and save custom levels
- **Responsive Design**: Works on both desktop and mobile devices
- **Visual Feedback**: Color-coded connections show correct/incorrect matches
- **Progressive Difficulty**: From simple 2-word connections to complex webs

## 🚀 How to Play

1. **Drag Words**: Pick up words from the bottom panel
2. **Drop in Slots**: Place them in slots of matching length
3. **Match Letters**: Connected slots must share the same letter
4. **Visual Cues**: 
   - Green connections = correct match
   - Red connections = wrong match
   - Orange = connection pending
5. **Win Condition**: All slots filled with valid connections

## 🎯 Game Modes

### Play Mode
- Complete pre-made levels
- Progress through increasing difficulty
- Track completion and best times

### Level Editor
- **Place Mode**: Click to place word slots of different lengths
- **Connect Mode**: Click letter positions to create connections
- **Test Mode**: Test your custom levels
- **Save/Load**: Store custom levels locally

## 🛠️ Technical Features

### Responsive Design
- Automatic scaling for different screen sizes
- Touch-optimized controls for mobile
- Landscape and portrait mode support
- Minimum touch target sizes for accessibility

### Built With
- **Phaser.js 3.90.0**: Game engine
- **ES6 Modules**: Modern JavaScript architecture
- **Local Storage**: Save progress and custom levels
- **CSS3**: Responsive styling

## 📱 Mobile Optimizations

- Touch and drag controls
- Optimal button sizing (44px minimum)
- Orientation change handling
- Viewport scaling
- Touch feedback effects

## 🔧 Development Setup

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation
```bash
# Clone or download the project
cd ww-phaser

# Install dependencies
npm install

# Start development server
npm start
```

The game will be available at `http://localhost:8080`

### Project Structure
```
ww-phaser/
├── index.html              # Main HTML file
├── package.json            # Dependencies and scripts
├── src/
│   ├── main.js            # Game configuration and initialization
│   ├── scenes/            # Game scenes
│   │   ├── MenuScene.js   # Main menu
│   │   ├── GameScene.js   # Main gameplay
│   │   ├── LevelEditorScene.js # Level creation
│   │   └── UIScene.js     # UI overlays
│   ├── objects/           # Game objects
│   │   ├── WordSlot.js    # Word slot containers
│   │   ├── DraggableWord.js # Draggable word tokens
│   │   └── ConnectionLine.js # Visual connections
│   ├── data/              # Game data
│   │   └── LevelManager.js # Level data and management
│   └── utils/             # Utility functions
│       └── GameUtils.js   # Helper classes
```

## 🎨 Customization

### Creating Custom Levels
1. Open Level Editor from main menu
2. Use "Place Mode" to add word slots
3. Use "Connect Mode" to link letter positions
4. Save with custom words
5. Test your creation

### Level Data Format
```javascript
{
  id: 1,
  name: "Level Name",
  slots: [
    { x: 300, y: 200, wordLength: 3, id: "slot1" }
  ],
  connections: [
    { fromSlot: "slot1", fromIndex: 2, toSlot: "slot2", toIndex: 0 }
  ],
  words: ["CAT", "TOY"],
  solution: {
    "slot1": "CAT",
    "slot2": "TOY"
  }
}
```

## 🌐 Browser Compatibility

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile Safari (iOS 12+)
- Chrome Mobile (Android 6+)

## 📝 Game Design Notes

### Educational Value
- Vocabulary building
- Spatial reasoning
- Pattern recognition
- Logical thinking

### Accessibility
- High contrast colors
- Large touch targets
- Clear visual feedback
- Simple, intuitive controls

### Performance
- Optimized for 60 FPS
- Efficient memory usage
- Fast loading times
- Smooth animations

## 🚀 Deployment for Poki

The game is ready for Poki submission with:
- Responsive design for all devices
- No external dependencies (except Phaser.js)
- Local storage for progress
- Clean, family-friendly content
- Engaging gameplay mechanics

### Build for Production
```bash
# The game runs directly from the built files
# No build step required - ready for deployment
```

## 📄 License

This project is created for educational and portfolio purposes.

## 🤝 Contributing

This is a portfolio project, but suggestions and improvements are welcome!

---

**Word Web** - Connect words, challenge your mind! 🧩✨
