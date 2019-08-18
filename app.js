console.log('started nodejs...')

const helpers = require('./helpers')

//require octokit rest.js
//more info at https://github.com/octokit/rest.js
const Octokit = require('@octokit/rest')
const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`
})

//set variables from args
const numIssuesToLabel = process.argv[2] ? process.argv[2] : 5
const eventLabelName = process.argv[2]
  ? process.argv[3]
  : ':thumbsup: Top Issue!'
const eventLabelColor = process.argv[4] ? process.argv[4] : 'f442c2'

console.log('eventLabelName', eventLabelName)

//set eventOwner and eventRepo based on action's env variables
const eventOwnerAndRepo = process.env.GITHUB_REPOSITORY
const eventOwner = helpers.getOwner(eventOwnerAndRepo)
const eventRepo = helpers.getRepo(eventOwnerAndRepo)

async function labelTopIssues() {
  console.log('break 1')

  await helpers.createLabelInRepo(
    octokit,
    eventOwner,
    eventRepo,
    eventLabelName,
    eventLabelColor
  )

  let issuesToLabel = await helpers.getTopIssues(
    octokit,
    eventOwner,
    eventRepo,
    '+1',
    numIssuesToLabel
  )

  issuesToLabel.forEach(issue => {
    helpers.addLabelToIssue(
      octokit,
      eventOwner,
      eventRepo,
      issue,
      eventLabelName
    )
  })

  helpers.pruneOldLabels(
    octokit,
    eventOwner,
    eventRepo,
    issuesToLabel,
    eventLabelName
  )
}

//run the function
labelTopIssues()

module.exports.labelTopIssues = labelTopIssues
