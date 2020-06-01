# ONEMV Mobi Server

## System Requirements
 - NodeJS
 - MongoDB

## Quick Start
 1. Clone this project.
 2. Run `npm install`

## Folder Structure
    .
    ├── bin                  
    │   └── www
    ├── models          # DB Schema
    ├── routes          # Api endpoints
    ├── util            # Tools and utility functions
    ├── app.js                  
    └── README.md


## Branching
### Main Branches
 - `master` - contains production ready codes.
 - `dev` - contains the main dev and staging codes.
 
Always create your own branch when your component is still work in progress. When you are ready to merge the code, create a PR and have it reviewed. 

#### Branch Naming Example
- `feature/feature-name`
- `bugfix/bug-name`

#### Commit Message Template
Start the commit message with the Jira issue code then the main commit message.

    MTT-1 Commit message