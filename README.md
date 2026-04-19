# Christian Leadership Blog (Nathan's Blog)

A modern, full-stack blogging platform and interactive learning hub dedicated to Christian leadership principles. This project combines rich article management with interactive educational games and real-time messaging to foster a community of servant leaders.

## 🚀 Key Features

### 📖 Content Management
- **Rich Article Views**: Immersive reading experience with support for embedded media and formatting.
- **Article Discovery**: Categorized browsing and search to find relevant leadership insights.
- **Commenting System**: Engaged community discussion on every article.

### 🎮 Interactive Learning (Games)
- **Leadership Quiz**: Test your knowledge on servant leadership theories and practices.
- **Word Scramble**: Fun vocabulary exercises focused on biblical leadership terms.
- **Verse Match**: Scripture association games to reinforce foundational verses.

### 💬 Community & Communication
- **Integrated Messenger**: Direct, real-time messaging between users to facilitate mentorship and connection.
- **Contact System**: Built-in contact forms for inquiries and feedback.

### 🔐 Security & User Profiles
- **Comprehensive Auth**: Secure login, registration with email verification, and password recovery.
- **User Profiles**: Personalized dashboards and settings, including theme preferences (Dark, Light, Midnight, Emerald, Sunset).
- **Admin Control Panel**: Full-featured dashboard for super-admins to manage articles, users, and global site settings.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Rich Text**: [React Quill](https://github.com/zenoamaro/react-quill)
- **SEO**: [React Helmet Async](https://github.com/staylor/react-helmet-async)
- **Styling**: Modern CSS3 with custom design system

### Backend
- **Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: [Express.js](https://expressjs.com/)
- **Database**: [MongoDB](https://www.mongodb.com/) via [Mongoose](https://mongoosejs.com/)
- **Authentication**: JWT & Bcrypt
- **Mailing**: [Nodemailer](https://nodemailer.com/)
- **File Handling**: [Multer](https://github.com/expressjs/multer)

---

## 🏁 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+ recommended)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd christian-leadership-blog
   ```

2. **Install Frontend Dependencies**:
   ```bash
   npm install
   ```

3. **Install Backend Dependencies**:
   ```bash
   cd server
   npm install
   cd ..
   ```

### Configuration

Create a `.env` file in the **root** directory:
```env
VITE_API_URL=http://localhost:5000
VITE_WEB3FORMS_KEY=your_web3forms_key_here
```

Create a `.env` file in the **server** directory:
```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password
```

### Running the Project

1. **Start the Backend Server**:
   ```bash
   cd server
   npm run dev
   ```

2. **Start the Frontend Development Server**:
   ```bash
   # In a new terminal (root directory)
   npm run dev
   ```

---

## 📂 Project Structure

```text
├── server/            # Node.js + Express backend
│   ├── config/        # Database and system configs
│   ├── models/        # Mongoose schemas
│   ├── routes/        # API endpoints
│   ├── middleware/    # Auth and error handlers
│   └── uploads/       # Static file storage
├── src/               # React frontend
│   ├── components/    # Reusable UI components
│   ├── context/       # Auth and State contexts
│   ├── pages/         # Page components
│   └── main.jsx       # Entry point
└── public/            # Static assets
```

## 📄 License

This project is for educational and ministry purposes. [Specify License Type if applicable].
