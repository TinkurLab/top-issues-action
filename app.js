console.log('started nodejs...')

const helpers = require('./helpers')

//require octokit rest.js
//more info at https://github.com/octokit/rest.js
const Octokit = require('@octokit/rest')
const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`
})

//set variables
const numIssuesToLabel = process.env.TOP_NUMBER_OF_ISSUES
  ? process.env.TOP_NUMBER_OF_ISSUES
  : '10'
const eventLabelName = process.env.TOP_LABEL_NAME
  ? process.env.TOP_LABEL_NAME
  : '👍 Top 10 Issue'
const eventLabelColor = process.env.TOP_LABEL_COLOR
  ? process.env.TOP_LABEL_COLOR
  : 'f442c2'

console.log('Args: ', numIssuesToLabel, eventLabelName, eventLabelColor)
console.log('process.env: ', process.env)

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
