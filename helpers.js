const fs = require('fs')

module.exports.readFilePromise = function (filename) {
  return new Promise((resolve, reject) => {
    fs.readFile(filename, 'utf8', (err, data) => {
      if (err) reject(err)
      else resolve(data)
    })
  }).catch((err) => {
    console.log(err)
  })
}

module.exports.getOwner = function (eventOwnerAndRepo) {
  const slicePos1 = eventOwnerAndRepo.indexOf('/')
  return eventOwnerAndRepo.slice(0, slicePos1)
}

module.exports.getRepo = function (eventOwnerAndRepo) {
  const slicePos1 = eventOwnerAndRepo.indexOf('/')
  return eventOwnerAndRepo.slice(slicePos1 + 1, eventOwnerAndRepo.length)
}

module.exports.getIssues = async function (octokit, eventOwner, eventRepo, label) {
  const filterLabel = label ? label : null

  let options = octokit.issues.listForRepo.endpoint.merge({
    owner: eventOwner,
    repo: eventRepo,
    labels: [filterLabel],
  })

  let allIssuesForRepo = await octokit
    .paginate(options)
    .then((data) => {
      return data
    })
    .catch((err) => {
      console.log(err)
    })

  allIssuesForRepo = allIssuesForRepo.filter((issue) => {
    if (!issue.pull_request) {
      return true
    }
  })

  return allIssuesForRepo
}

module.exports.createLabelInRepo = async function (
  octokit,
  eventOwner,
  eventRepo,
  labelToAddName,
  labelToAddColor
) {
  const options = octokit.issues.listLabelsForRepo.endpoint.merge({
    owner: eventOwner,
    repo: eventRepo,
  })

  let allLabelsForRepo = await octokit
    .paginate(options)
    .then((data) => {
      return data
    })
    .catch((err) => {
      console.log(err)
    })

  let labelExists = false

  allLabelsForRepo.forEach((label) => {
    const labelName = label.name

    if (labelName === labelToAddName) {
      labelExists = true
    }
  })

  if (!labelExists) {
    octokit.issues.createLabel({
      owner: eventOwner,
      repo: eventRepo,
      name: labelToAddName,
      color: labelToAddColor,
    })
  }
}

module.exports.addLabelToIssue = function (octokit, eventOwner, eventRepo, issue, labelToAdd) {
  let existingLabels = issue.labels

  let labelAlreadyOnIssue = false

  existingLabels.forEach((label) => {
    if (label.name === labelToAdd) {
      labelAlreadyOnIssue = true
    }
  })

  if (!labelAlreadyOnIssue) {
    octokit.issues.addLabels({
      owner: eventOwner,
      repo: eventRepo,
      issue_number: issue.number,
      labels: [labelToAdd],
    })
  }
}

module.exports.getTopIssues = async function (issues, reaction, count) {
  let topIssues = issues

  topIssues = topIssues.filter((issue) => {
    if (!issue.pull_request) {
      return true
    }
  })

  topIssues = topIssues.filter((i) => i.reactions[reaction] > 0)

  topIssues.sort((a, b) => parseInt(b.reactions[reaction]) - parseInt(a.reactions[reaction]))

  if (topIssues.length >= count) {
    topIssues = topIssues.slice(0, count)
  }

  return topIssues
}

module.exports.pruneOldLabels = async function (
  octokit,
  eventOwner,
  eventRepo,
  issuesToLabel,
  issuesWithLabel,
  label
) {
  let keepLabel

  issuesWithLabel.forEach((labeledIssue) => {
    keepLabel = false

    issuesToLabel.forEach((issueToLabel) => {
      if (issueToLabel.number === labeledIssue.number) {
        keepLabel = true
      }
    })

    if (!keepLabel) {
      octokit.issues.removeLabel({
        owner: eventOwner,
        repo: eventRepo,
        issue_number: labeledIssue.number,
        name: label,
      })
    }
  })
}
