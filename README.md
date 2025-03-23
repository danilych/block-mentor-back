<p align="center">
  <a href="https://block-mentor.io" target="blank"><img src="./assets/logo.png" width="240" alt="Block Mentor Logo" /></a>
</p>

<p align="center">BlockMentor - Your Web3 AI Assistant</p>
<p align="center">A specialized Web3 AI assistant designed to help users without technical blockchain knowledge create and manage their own digital assets and solutions</p>

## Description

BlockMentor is a powerful Web3 AI assistant designed to simplify blockchain interactions for users with limited technical knowledge. The application enables users to create and manage various blockchain assets through a conversational AI interface, automating complex blockchain operations.

## Key Features

### Token Creation

- Create custom ERC-20 tokens on Arbitrum and Base testnets
- Simple conversational interface requiring only basic information:
  - Chain selection (Arbitrum or Base)
  - Token name
  - Token symbol
  - Initial token supply

### Omnichain Token Creation

- Deploy tokens that work across multiple blockchains
- Simplified creation process similar to regular tokens

### Vesting Solutions

- Create token vesting schedules for projects and teams
- Customize parameters including:
  - Start timestamp
  - Period durations
  - Number of vesting periods
  - Total token amount
  - Chain selection

### User-Friendly Interface

- Natural language interaction with the BlockMentor AI
- No need for technical blockchain knowledge
- Guided prompts to collect all required information
- Automatic generation of user interfaces for all services

## Architecture

The application is built with NestJS and follows a modular architecture:

### Apps

- **API**: Handles HTTP requests, authentication, and chat interactions
- **Workers**: Processes blockchain operations (token creation, vesting, etc.)
- **Cron**: Manages scheduled tasks

### Modules

- **Auth**: Authentication using Privy for Web3 wallet integration
- **Chat**: User conversation management and storage
- **OpenAI**: Integration with OpenAI for AI assistant functionality
- **Messages**: Message storage and processing
- **User**: User management and data
- **Drizzle**: Database integration using Drizzle ORM
- **Create-Token**: Token creation processing
- **Create-Vesting**: Vesting schedule creation
- **Create-Omnichain-Token**: Omnichain token creation

### Blockchain Integration

- Supports Arbitrum and Base testnets
- Smart contract integration for token creation and management
- Vesting schedule deployment
- Omnichain token capabilities

## Technical Stack

- **Backend**: NestJS (Node.js)
- **Database**: PostgreSQL with Drizzle ORM
- **Queue Management**: Bull with Redis
- **AI Integration**: OpenAI
- **Blockchain**: Ethers.js and Viem for Web3 interactions
- **Authentication**: Privy for Web3 wallet authentication
- **Configuration**: Dotenv for environment management

## Project Setup

```bash
# Install dependencies
$ npm install

# Environment Configuration
# Create a .env file with the necessary environment variables:
# - Database credentials
# - OpenAI API key
# - Blockchain provider URLs
# - Redis configuration
# - Privy authentication keys
```

## Running the Application

```bash
# Start API server in development mode
$ npm run start:api:dev

# Start workers for processing blockchain operations
$ npm run start:workers:dev

# Start cron jobs for scheduled tasks
$ npm run start:cron:dev

# Production mode
$ npm run build
$ npm run start:api
$ npm run start:workers
$ npm run start:cron
```

## Database Management

```bash
# Generate database migrations
$ npm run db:generate

# Apply migrations
$ npm run db:migrate

# Start Drizzle Studio for database management
$ npm run db:studio
```

## How It Works

1. Users interact with the BlockMentor AI through a chat interface
2. The AI collects necessary information for the requested operation (token creation, vesting, etc.)
3. When all required information is provided, the AI formats a JSON response
4. The JSON is processed by the workers to perform the blockchain operations
5. Results are displayed to the user and stored in their dashboard
6. Users can view and manage their deployed contracts in dedicated sections of the UI

## Supported Networks

Currently, BlockMentor supports:

- Arbitrum Testnet
- Base Testnet

Users must have ETH in their wallet to pay for gas fees on these networks.

## Project Contact

For questions or support, please contact the BlockMentor team at [support@block-mentor.io](mailto:support@block-mentor.io)

## License

BlockMentor is [MIT licensed](LICENSE).
