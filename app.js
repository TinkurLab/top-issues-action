console.log('started nodejs...')

const helpers = require('./helpers')

//require octokit rest.js
//more info at https://github.com/octokit/rest.js
const Octokit = require('@octokit/rest')
const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`
})

//set variables from args
let allArgs = process.argv[2]
  ? process.argv[2].split('|')
  : '10|👍 Top 10 Issue!|f442c2'.split('|')
const numIssuesToLabel = allArgs[0]
const eventLabelName = allArgs[1]
const eventLabelColor = allArgs[2]

console.log('mapped args: ', numIssuesToLabel, eventLabelName, eventLabelColor)

//set eventOwner and eventRepo based on action's env variables
const eventOwnerAndRepo = process.env.GITHUB_REPOSITORY
const eventOwner = helpers.getOwner(eventOwnerAndRepo)
const eventRepo = helpers.getRepo(eventOwnerAndRepo)

async function labelTopIssues() {
  await helpers.createLabelInRepo(
    octokit,
    eventOwner,
    eventRepo,
    eventLabelName,
    eventLabelColor
  )

  const issues = await helpers.getIssues(eventOwner, eventRepo)

  let issuesToLabel = await helpers.getTopIssues(issues, '+1', numIssuesToLabel)

  issuesToLabel.forEach(issue => {
    helpers.addLabelToIssue(
      octokit,
      eventOwner,
      eventRepo,
      issue,
      eventLabelName
    )
  })

  const issuesWithLabel = await helpers.getIssues(
    eventOwner,
    eventRepo,
    eventLabelName
  )

  helpers.pruneOldLabels(
    octokit,
    eventOwner,
    eventRepo,
    issuesToLabel,
    issuesWithLabel,
    eventLabelName
  )
}

//run the function
labelTopIssues()

module.exports.labelTopIssues = labelTopIssues
