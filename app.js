require('dotenv').config()

const packageInfo = require('./package.json')
console.log(`Starting ${packageInfo.name}`)

const helpers = require('./helpers')

const { Octokit } = require('@octokit/rest')
const octokit = new Octokit({
  auth: `token ${process.env.GITHUB_TOKEN}`,
})

async function labelTopIssues() {
  try {
    //set variables
    const numIssuesToLabel = process.env.TOP_NUMBER_OF_ISSUES || '10'
    const eventLabelName = process.env.TOP_LABEL_NAME || '👍 Top 10 Issue'
    const eventLabelColor = process.env.TOP_LABEL_COLOR || 'f442c2'

    //set eventOwner and eventRepo based on action's env variables
    const eventOwnerAndRepo = process.env.GITHUB_REPOSITORY
    const eventOwner = helpers.getOwner(eventOwnerAndRepo)
    const eventRepo = helpers.getRepo(eventOwnerAndRepo)

    await helpers.createLabelInRepo(octokit, eventOwner, eventRepo, eventLabelName, eventLabelColor)

    const issues = await helpers.getIssues(octokit, eventOwner, eventRepo)

    let issuesToLabel = await helpers.getTopIssues(issues, '+1', numIssuesToLabel)

    if (issuesToLabel) {
      issuesToLabel.forEach((issue) => {
        console.log('labeling issue #: ', issue.number)
        helpers.addLabelToIssue(octokit, eventOwner, eventRepo, issue, eventLabelName)
      })
    }

    const issuesWithLabel = await helpers.getIssues(octokit, eventOwner, eventRepo, eventLabelName)

    helpers.pruneOldLabels(
      octokit,
      eventOwner,
      eventRepo,
      issuesToLabel,
      issuesWithLabel,
      eventLabelName
    )
  } catch (error) {
    console.log(error)
  }
}

//run the function
labelTopIssues()

module.exports.labelTopIssues = labelTopIssues
