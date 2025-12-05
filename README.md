🎰 PokerBuddy - Poker Training Web App

PokerBuddy is a modern, React-based training tool designed to help players quickly improve their understanding of poker hand strength, positions, ranges, M-score, effective M, and more.

This project is a full rebuild of the original “Poker Buddy” JavaScript app, redesigned with cleaner UI/UX, improved logic, and an expandable component structure.

🚀 Features (Current)

Difficulty selection (Easy / Medium / Hard)

Cards Training

Hand Recognition - Identify the correct hand ranking from random 5-card boards

Hole Card Quiz - Multiple-choice training for equity concepts and opponent combination counts

Position Training

Seat Names Trainer - Learn the names of table positions

RFI Trainer - Guess the correct Raise-First-In range from visual hand grids

Chips Training

M-Score Trainer - Calculate how many orbits your stack can survive

Effective M Trainer - Short-handed adjustme

🛠️ Tech Stack

React (Vite)

JavaScript / JSX

CSS

React Router

Fully client-side - no backend required(Yet)

📦 Installation & Running Locally
# Clone the repo
git clone https://github.com/BernardKeenan123/PokerBuddy
cd poker-buddy-react

# Install dependencies
npm install

# Start development server
npm run dev

🔮 Planned / Upcoming Features
Improved UI

Potentially more training modes - Q score, Implied odds, Pot odds

Adaptive Neural Network Opponent (Planned) -
A non-traditional “bot” opponent powered by a lightweight neural network.
Instead of using fixed strategies, the model will learn from each user’s performance across the training modules, adapting to their strengths, weaknesses, range understanding, and decision patterns.
Over time, the bot becomes more challenging and personalised, creating a dynamic opponent that improves as the player does. 
