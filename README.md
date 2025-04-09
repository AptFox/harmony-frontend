# Development process
 - Pull the most recent version of dev
 - Create (checkout) a named feature branch from dev
   - `git checkout -b desc-of-feature`
 - Make changes
   - Write tests for changes
     - Most tests should be written for the service layer. 
     - Push as much logic as possible into the service layer when adding features.
   - Run all tests
     - [add command for running tests here]
   - Write meaningful commit messages
 - Run the linter from the terminal: [add command for running linter here]
   - Note: You can setup a pre-commit hook for this (Check the QOL section)
 - Commit linted changes
 - Open PR against dev branch
 - Request a PR review
 - Request to have dev merged to main for deployment of new feature
   - PR's merged to `main` trigger CI/CD (deployment to heroku)

# Install instructions:

## Prerequisites
- Homebrew
- Docker

## Install process
 - add npm via homebrew


### Set environment variables
 - open the repository and create a `.env.local` file containing the following:
```
BACKEND_BASE_URL=http://localhost:8080

# other env keys here
```

### run the application
```bash
// build and run the docker image locally
// [command to create and run docker container locally here]

// OPTIONAL - use npme to run the app directly if you'd like to run the app w/o docker
npm run dev
```


#### Open the app in a web browser to verify it's running
 - Go to `http://localhost:3000/` in a web browser

# QOL
- Linting
  - [Instructions for running the linter here]
  - [Instructions for creating a pre-commit hook for linter here]


### FAQ
- What is [tool name here]?
    - [tool desc here]
- Linter?
    - [linter name here] - [link to linter docs]

# Troubleshooting
 - 

# Version info
- Framework: NextJS [add version here]
- Language: TypeScript [add version here]
- Runtime: NodeJS [add version here]
- [other tools] [add version here]
