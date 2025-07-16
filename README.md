# SOL-saving-dApp
Application décentralisée pour épargne automatique de 10% de tout dépôt de SOL! 

# sol-auto-saving Project

## Overview
The `sol-auto-saving` project is a Solana program designed to facilitate automatic saving functionalities on the Solana blockchain. This project utilizes the Anchor framework for development and deployment.

## Project Structure
```
sol-auto-saving
├── migrations
│   └── deploy.js          # Deployment script for the Solana program
├── programs
│   └── sol_auto_saving
│       ├── Cargo.toml     # Rust program configuration file
│       └── src
│           └── lib.rs     # Main library file containing program logic
├── tests
│   └── sol_auto_saving.js  # Test cases for the Solana program
├── Anchor.toml            # Anchor configuration file
├── package.json           # npm configuration file
└── README.md              # Project documentation
```

## Setup Instructions
1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sol-auto-saving
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Build the program:**
   ```bash
   anchor build
   ```

4. **Deploy the program:**
   ```bash
   anchor deploy
   ```

## Usage
After deploying the program, you can interact with it using the provided test cases or by integrating it into your Solana applications.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License.