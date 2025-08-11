# System Map - Markdown Reader Pro

## 🗺️ Visual Atlas of Project Architecture & Components

> **A comprehensive visual guide to the Markdown Reader Pro system architecture, data flows, and component interactions**

---

## 📋 Visual Index

1. [High-Level System Architecture](#high-level-system-architecture)
2. [Process Communication Flow](#process-communication-flow)
3. [File Loading Sequence](#file-loading-sequence)
4. [User Interface State Machine](#user-interface-state-machine)
5. [Data Flow Architecture](#data-flow-architecture)
6. [Component Interaction Map](#component-interaction-map)
7. [Error Handling Flow](#error-handling-flow)
8. [Settings Management Flow](#settings-management-flow)
9. [Theme System Architecture](#theme-system-architecture)
10. [Build & Deployment Pipeline](#build--deployment-pipeline)

---

## 🏗️ High-Level System Architecture

### System Overview Diagram

```mermaid
graph TB
    subgraph "Operating System"
        OS[OS Layer<br/>Windows/macOS/Linux]
    end

    subgraph "Main Process (Node.js)"
        APP[App Lifecycle<br/>main.js]
        FS[File System<br/>Operations]
        IPC[IPC Hub<br/>Communication]
        MENU[Native Menu<br/>System]
    end

    subgraph "Renderer Process (Browser)"
        UI[UI Layer<br/>HTML/CSS/JS]
        MD[Markdown<br/>Renderer]
        SETTINGS[Settings<br/>Manager]
        STATE[State<br/>Management]
    end

    subgraph "External Dependencies"
        MARKED[marked.js<br/>Parser]
        HIGHLIGHT[highlight.js<br/>Syntax Highlighter]
        ELECTRON[Electron<br/>Framework]
    end

    OS --> APP
    APP --> FS
    APP --> IPC
    APP --> MENU

    IPC <--> STATE
    STATE --> UI
    STATE --> MD
    STATE --> SETTINGS

    MD --> MARKED
    MD --> HIGHLIGHT

    UI --> ELECTRON
    MD --> ELECTRON
```

**Architecture Components:**

- **Main Process**: Handles system operations, file I/O, and IPC routing
- **Renderer Process**: Manages UI rendering, user interactions, and state
- **External Dependencies**: Third-party libraries for markdown processing
- **IPC Bridge**: Secure communication between processes

---

## 🔄 Process Communication Flow

### IPC Communication Architecture

```mermaid
sequenceDiagram
    participant User
    participant Renderer
    participant Preload
    participant Main
    participant System

    Note over User,System: File Opening Workflow

    User->>Renderer: Click "Open File" or Drag & Drop
    Renderer->>Preload: triggerFileDialog()
    Preload->>Main: ipcRenderer.invoke('trigger-file-dialog')
    Main->>System: Show Native File Dialog
    System->>Main: User selects file
    Main->>Renderer: Send 'file-opened' event
    Renderer->>Preload: readFile(filePath)
    Preload->>Main: ipcRenderer.invoke('read-file', filePath)
    Main->>System: fs.readFile(filePath)
    System->>Main: File content
    Main->>Preload: Return file data
    Preload->>Renderer: File content
    Renderer->>Renderer: Process and render markdown
    Renderer->>Renderer: Update UI state
```

**Communication Patterns:**

- **Request-Response**: For file operations and metadata
- **Event-Driven**: For file selection and system events
- **Error Handling**: Consistent error response structure

---

## 📁 File Loading Sequence

### Complete File Processing Pipeline

```mermaid
flowchart TD
    A[User Action] --> B{Action Type}

    B -->|Menu/Shortcut| C[Trigger File Dialog]
    B -->|Drag & Drop| D[Validate File Type]

    C --> E[Show Native Dialog]
    D --> F{Valid Markdown?}

    F -->|Yes| G[Extract File Path]
    F -->|No| H[Show Error Message]

    E --> I[User Selects File]
    I --> G

    G --> J[Read File Content]
    J --> K{File Read Success?}

    K -->|Yes| L[Get File Metadata]
    K -->|No| M[Handle File Error]

    L --> N[Parse Markdown]
    N --> O[Apply Syntax Highlighting]
    O --> P[Render to DOM]
    P --> Q[Update UI State]
    Q --> R[Show Success State]

    M --> S[Show Error State]
    H --> S

    S --> T[Provide Recovery Options]
    T --> A
```

**Processing Stages:**

1. **Input Validation**: Check file type and permissions
2. **File Reading**: Asynchronous file system operations
3. **Content Processing**: Markdown parsing and syntax highlighting
4. **UI Update**: DOM manipulation and state management
5. **Error Handling**: Graceful degradation and user feedback

---

## 🎮 User Interface State Machine

### Application State Transitions

```mermaid
stateDiagram-v2
    [*] --> Initial

    Initial --> DropZone : App Start
    Initial --> Loading : File Selected

    DropZone --> Loading : File Action
    DropZone --> Error : Invalid File

    Loading --> MarkdownView : Success
    Loading --> Error : File Error

    MarkdownView --> Settings : Settings Click
    MarkdownView --> Help : Help Click
    MarkdownView --> DropZone : Reset/New File
    MarkdownView --> Loading : Reload File

    Settings --> MarkdownView : Save/Close
    Settings --> DropZone : Reset App

    Help --> MarkdownView : Close

    Error --> DropZone : Try Again
    Error --> MarkdownView : Open Different File

    MarkdownView --> [*] : App Close
    DropZone --> [*] : App Close
```

**State Descriptions:**

- **Initial**: Application startup and initialization
- **DropZone**: File selection interface
- **Loading**: File processing and rendering
- **MarkdownView**: Document display and interaction
- **Settings**: Configuration and preferences
- **Help**: Documentation and shortcuts
- **Error**: Error display and recovery

---

## 🔀 Data Flow Architecture

### Data Movement Through System

```mermaid
graph LR
    subgraph "Input Sources"
        FILE[File System]
        USER[User Input]
        SYSTEM[System Events]
    end

    subgraph "Data Processing"
        PARSER[Markdown Parser]
        HIGHLIGHT[Syntax Highlighter]
        VALIDATOR[Input Validator]
    end

    subgraph "State Management"
        APP_STATE[Application State]
        UI_STATE[UI State]
        FILE_STATE[File State]
    end

    subgraph "Output Destinations"
        DOM[DOM Elements]
        STORAGE[Local Storage]
        EXPORT[Export Formats]
    end

    FILE --> VALIDATOR
    USER --> VALIDATOR
    SYSTEM --> VALIDATOR

    VALIDATOR --> PARSER
    PARSER --> HIGHLIGHT

    HIGHLIGHT --> APP_STATE
    APP_STATE --> UI_STATE
    APP_STATE --> FILE_STATE

    UI_STATE --> DOM
    APP_STATE --> STORAGE
    FILE_STATE --> EXPORT

    DOM --> USER
    STORAGE --> SYSTEM
```

**Data Flow Characteristics:**

- **Unidirectional**: Data flows from input to output
- **State-Driven**: UI updates based on state changes
- **Persistent**: User preferences saved across sessions
- **Reactive**: Automatic updates on data changes

---

## 🔧 Component Interaction Map

### Detailed Component Relationships

```mermaid
graph TB
    subgraph "Main Process Components"
        MAIN[main.js<br/>Main Process]
        WINDOW[Window Manager]
        MENU_SYS[Menu System]
        IPC_MAIN[IPC Main Handlers]
    end

    subgraph "Preload Bridge"
        PRELOAD[preload.js<br/>API Bridge]
        CONTEXT[Context Bridge]
        IPC_RENDERER[IPC Renderer]
    end

    subgraph "Renderer Components"
        RENDERER[renderer.js<br/>Main Logic]
        UI_CONTROLLER[UI Controller]
        MD_RENDERER[Markdown Renderer]
        SETTINGS_MGR[Settings Manager]
        EVENT_HANDLER[Event Handler]
    end

    subgraph "UI Layer"
        HTML[HTML Structure]
        CSS[CSS Styling]
        DOM[DOM Manipulation]
    end

    subgraph "External Libraries"
        MARKED[marked.js]
        HIGHLIGHT_JS[highlight.js]
        ELECTRON_FW[Electron Framework]
    end

    MAIN --> WINDOW
    MAIN --> MENU_SYS
    MAIN --> IPC_MAIN

    IPC_MAIN <--> IPC_RENDERER
    IPC_RENDERER --> PRELOAD
    PRELOAD --> CONTEXT
    CONTEXT --> RENDERER

    RENDERER --> UI_CONTROLLER
    RENDERER --> MD_RENDERER
    RENDERER --> SETTINGS_MGR
    RENDERER --> EVENT_HANDLER

    UI_CONTROLLER --> DOM
    MD_RENDERER --> MARKED
    MD_RENDERER --> HIGHLIGHT_JS

    DOM --> HTML
    DOM --> CSS

    EVENT_HANDLER --> UI_CONTROLLER
    SETTINGS_MGR --> DOM
```

**Component Responsibilities:**

- **Main Process**: System operations and IPC routing
- **Preload Bridge**: Secure API exposure
- **Renderer**: UI logic and user interactions
- **UI Layer**: Visual presentation and styling
- **External Libraries**: Specialized functionality

---

## 🚨 Error Handling Flow

### Error Management Architecture

```mermaid
flowchart TD
    A[Error Occurs] --> B{Error Type}

    B -->|File System| C[File Error Handler]
    B -->|Network| D[Network Error Handler]
    B -->|Parsing| E[Parsing Error Handler]
    B -->|System| F[System Error Handler]

    C --> G{Error Code}
    G -->|ENOENT| H[File Not Found]
    G -->|EACCES| I[Permission Denied]
    G -->|ENOMEM| J[Memory Error]
    G -->|Other| K[Generic File Error]

    D --> L{Network Issue}
    L -->|CDN Down| M[Fallback Resource]
    L -->|Timeout| N[Retry Operation]

    E --> O{Markdown Issue}
    O -->|Syntax| P[Show Syntax Error]
    O -->|Encoding| Q[Try Alternative Encoding]

    F --> R{System Issue}
    R -->|Memory| S[Request Memory Cleanup]
    R -->|Process| T[Restart Component]

    H --> U[Show User-Friendly Message]
    I --> U
    J --> U
    K --> U
    M --> U
    N --> U
    P --> U
    Q --> U
    S --> U
    T --> U

    U --> V[Provide Recovery Options]
    V --> W{User Action}

    W -->|Retry| X[Retry Operation]
    W -->|Skip| Y[Continue with Fallback]
    W -->|Cancel| Z[Return to Previous State]

    X --> A
    Y --> AA[Use Default Values]
    Z --> BB[Reset Application State]
```

**Error Handling Strategy:**

- **Categorization**: Different handlers for different error types
- **User Experience**: Friendly error messages with recovery options
- **Graceful Degradation**: Fallback mechanisms for non-critical errors
- **Logging**: Comprehensive error logging for debugging

---

## ⚙️ Settings Management Flow

### Configuration System Architecture

```mermaid
graph TD
    subgraph "Settings Sources"
        DEFAULT[Default Values]
        USER[User Preferences]
        SYSTEM[System Preferences]
    end

    subgraph "Settings Manager"
        LOAD[Load Settings]
        VALIDATE[Validate Settings]
        APPLY[Apply Settings]
        SAVE[Save Settings]
    end

    subgraph "Settings Categories"
        THEME[Theme Settings]
        TYPOGRAPHY[Typography Settings]
        UI[UI Preferences]
        ADVANCED[Advanced Options]
    end

    subgraph "Storage Layer"
        LOCAL[Local Storage]
        SESSION[Session Storage]
        FILE[File System]
    end

    DEFAULT --> LOAD
    USER --> LOAD
    SYSTEM --> LOAD

    LOAD --> VALIDATE
    VALIDATE --> APPLY

    APPLY --> THEME
    APPLY --> TYPOGRAPHY
    APPLY --> UI
    APPLY --> ADVANCED

    THEME --> SAVE
    TYPOGRAPHY --> SAVE
    UI --> SAVE
    ADVANCED --> SAVE

    SAVE --> LOCAL
    SAVE --> SESSION
    SAVE --> FILE

    LOCAL --> LOAD
    SESSION --> LOAD
    FILE --> LOAD
```

**Settings Features:**

- **Persistence**: Settings saved across application sessions
- **Validation**: Input validation and sanitization
- **Real-time Updates**: Immediate application of setting changes
- **Fallbacks**: Default values for missing or invalid settings

---

## 🎨 Theme System Architecture

### Dynamic Theme Management

```mermaid
graph TB
    subgraph "Theme Sources"
        LIGHT[Light Theme]
        DARK[Dark Theme]
        AUTO[Auto Theme]
        CUSTOM[Custom Theme]
    end

    subgraph "Theme Engine"
        DETECT[System Preference Detection]
        SWITCH[Theme Switching Logic]
        APPLY[Theme Application]
        PERSIST[Theme Persistence]
    end

    subgraph "CSS Variables"
        COLORS[Color Variables]
        TYPOGRAPHY[Typography Variables]
        SPACING[Spacing Variables]
        SHADOWS[Shadow Variables]
    end

    subgraph "Media Queries"
        PREFERS_DARK[prefers-color-scheme: dark]
        PREFERS_LIGHT[prefers-color-scheme: light]
        REDUCED_MOTION[prefers-reduced-motion]
    end

    LIGHT --> SWITCH
    DARK --> SWITCH
    AUTO --> DETECT
    CUSTOM --> SWITCH

    DETECT --> PREFERS_DARK
    DETECT --> PREFERS_LIGHT
    DETECT --> REDUCED_MOTION

    PREFERS_DARK --> SWITCH
    PREFERS_LIGHT --> SWITCH
    REDUCED_MOTION --> SWITCH

    SWITCH --> APPLY
    APPLY --> COLORS
    APPLY --> TYPOGRAPHY
    APPLY --> SPACING
    APPLY --> SHADOWS

    APPLY --> PERSIST
    PERSIST --> SWITCH
```

**Theme System Features:**

- **Dynamic Switching**: Real-time theme changes
- **System Integration**: Automatic detection of OS preferences
- **CSS Variables**: Centralized theme management
- **Accessibility**: Support for reduced motion preferences

---

## 🚀 Build & Deployment Pipeline

### Production Build Process

```mermaid
flowchart LR
    subgraph "Source Code"
        JS[JavaScript Files]
        HTML[HTML Files]
        CSS[CSS Files]
        ASSETS[Asset Files]
    end

    subgraph "Build Process"
        INSTALL[Dependencies Install]
        BUNDLE[Code Bundling]
        MINIFY[Code Minification]
        OPTIMIZE[Asset Optimization]
    end

    subgraph "Platform Builds"
        WIN[Windows Build]
        MAC[macOS Build]
        LINUX[Linux Build]
    end

    subgraph "Package Formats"
        NSIS[NSIS Installer]
        DMG[DMG Package]
        APPIMAGE[AppImage]
        DEB[DEB Package]
    end

    subgraph "Distribution"
        GITHUB[GitHub Releases]
        WEBSITE[Website Downloads]
        STORES[App Stores]
    end

    JS --> INSTALL
    HTML --> INSTALL
    CSS --> INSTALL
    ASSETS --> INSTALL

    INSTALL --> BUNDLE
    BUNDLE --> MINIFY
    MINIFY --> OPTIMIZE

    OPTIMIZE --> WIN
    OPTIMIZE --> MAC
    OPTIMIZE --> LINUX

    WIN --> NSIS
    MAC --> DMG
    LINUX --> APPIMAGE
    LINUX --> DEB

    NSIS --> GITHUB
    DMG --> GITHUB
    APPIMAGE --> GITHUB
    DEB --> GITHUB

    GITHUB --> WEBSITE
    GITHUB --> STORES
```

**Build Features:**

- **Multi-platform**: Simultaneous builds for all platforms
- **Optimization**: Code minification and asset optimization
- **Packaging**: Platform-specific package formats
- **Distribution**: Automated release management

---

## 📊 Performance Metrics & Benchmarks

### System Performance Characteristics

```mermaid
graph LR
    subgraph "Performance Metrics"
        STARTUP[Startup Time<br/>&lt;2s]
        RENDERING[Markdown Rendering<br/>&lt;100ms for 1MB]
        MEMORY[Memory Usage<br/>&lt;100MB typical]
        RESPONSE[UI Response<br/>&lt;16ms]
    end

    subgraph "Optimization Techniques"
        LAZY[Lazy Loading]
        CACHING[Result Caching]
        BATCHING[Batch Updates]
        DEBOUNCE[Debounced Events]
    end

    subgraph "Resource Management"
        CLEANUP[Memory Cleanup]
        POOLING[Resource Pooling]
        COMPRESSION[Asset Compression]
        CDN[CDN Resources]
    end

    STARTUP --> LAZY
    RENDERING --> CACHING
    MEMORY --> CLEANUP
    RESPONSE --> BATCHING

    LAZY --> CLEANUP
    CACHING --> POOLING
    BATCHING --> COMPRESSION
    DEBOUNCE --> CDN
```

**Performance Targets:**

- **Startup**: Under 2 seconds on modern hardware
- **Rendering**: 1MB markdown files in under 100ms
- **Memory**: Less than 100MB for typical documents
- **Responsiveness**: UI updates in under 16ms (60fps)

---

## 🔍 Debugging & Development Tools

### Development Environment Setup

```mermaid
graph TD
    subgraph "Development Tools"
        DEVTOOLS[Electron DevTools]
        CONSOLE[Console Logging]
        PROFILER[Performance Profiler]
        DEBUGGER[Debugger Integration]
    end

    subgraph "Build Modes"
        DEV[Development Mode]
        DEBUG[Debug Mode]
        PROD[Production Mode]
        TEST[Testing Mode]
    end

    subgraph "Debugging Features"
        HOT_RELOAD[Hot Reload]
        SOURCE_MAPS[Source Maps]
        ERROR_TRACKING[Error Tracking]
        PERFORMANCE_MONITORING[Performance Monitoring]
    end

    DEV --> DEVTOOLS
    DEBUG --> DEBUGGER
    PROD --> PROFILER
    TEST --> CONSOLE

    DEVTOOLS --> HOT_RELOAD
    DEBUGGER --> SOURCE_MAPS
    PROFILER --> PERFORMANCE_MONITORING
    CONSOLE --> ERROR_TRACKING
```

**Development Features:**

- **Hot Reload**: Instant code changes without restart
- **Source Maps**: Debug original source code
- **Performance Profiling**: Identify bottlenecks
- **Error Tracking**: Comprehensive error logging

---

## 🌐 Cross-Platform Compatibility Matrix

### Platform Support & Features

```mermaid
graph TB
    subgraph "Supported Platforms"
        WINDOWS[Windows 10+]
        MACOS[macOS 10.14+]
        LINUX[Ubuntu 18.04+]
    end

    subgraph "Platform Features"
        WIN_FEATURES[Windows Features<br/>• NSIS Installer<br/>• Portable Executable<br/>• Start Menu Integration]
        MAC_FEATURES[macOS Features<br/>• DMG Package<br/>• App Store Ready<br/>• Native Menu Bar]
        LINUX_FEATURES[Linux Features<br/>• AppImage Package<br/>• DEB Package<br/>• Desktop Integration]
    end

    subgraph "Common Features"
        COMMON[Cross-Platform Features<br/>• Electron Framework<br/>• Node.js Integration<br/>• Web Technologies]
    end

    WINDOWS --> WIN_FEATURES
    MACOS --> MAC_FEATURES
    LINUX --> LINUX_FEATURES

    WIN_FEATURES --> COMMON
    MAC_FEATURES --> COMMON
    LINUX_FEATURES --> COMMON
```

**Platform Support:**

- **Windows**: Full installer and portable versions
- **macOS**: DMG packages with App Store compatibility
- **Linux**: Multiple package formats for different distributions

---

_This system map provides a comprehensive visual understanding of the Markdown Reader Pro architecture. Each diagram illustrates specific aspects of the system, from high-level architecture to detailed component interactions._
