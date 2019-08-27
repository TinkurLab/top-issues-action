const helpers = require('../helpers')
let octokit = require('@octokit/rest')()

octokit = jest.fn()
octokit.authenticate = jest.fn()

describe('getOwner', () => {
  it('should return owner when passed GITHUB_REPOSITORY env variable', () => {
    const result = helpers.getOwner('adamzolyak/actions-playground')
    expect(result).toBe('adamzolyak')
  })
})

describe('getRepo', () => {
  it('should return repo when passed GITHUB_REPOSITORY env variable', () => {
    const result = helpers.getRepo('adamzolyak/actions-playground')
    expect(result).toBe('actions-playground')
  })
})

describe('createLabelInRepo', () => {
  it('creates label in repo if label does not already exist', async () => {
    const repoLabels = [
      {
        name: 'label 1'
      },
      { name: 'label 2' }
    ]

    let octokit = {
      issues: {
        listLabelsForRepo: {
          endpoint: {
            merge: jest.fn().mockResolvedValue(repoLabels)
          }
        },
        createLabel: jest.fn()
      },
      paginate: jest.fn().mockResolvedValue(repoLabels)
    }

    const result = await helpers.createLabelInRepo(
      octokit,
      'adamzolyak',
      'actions-playground',
      'new label',
      '#ffffff'
    )

    expect(
      octokit.issues.listLabelsForRepo.endpoint.merge
    ).toHaveBeenCalledTimes(1)
    expect(octokit.paginate).toHaveBeenCalledTimes(1)
    expect(octokit.issues.createLabel).toHaveBeenCalledTimes(1)
  }),
    it('does not create label in repo if label already exists', async () => {
      const repoLabels = [
        {
          name: 'label 1'
        },
        { name: 'label 2' }
      ]

      let octokit = {
        issues: {
          listLabelsForRepo: {
            endpoint: {
              merge: jest.fn().mockResolvedValue(repoLabels)
            }
          },
          createLabel: jest.fn()
        },
        paginate: jest.fn().mockResolvedValue(repoLabels)
      }

      const result = await helpers.createLabelInRepo(
        octokit,
        'adamzolyak',
        'actions-playground',
        'label 2',
        '#ffffff'
      )

      expect(
        octokit.issues.listLabelsForRepo.endpoint.merge
      ).toHaveBeenCalledTimes(1)
      expect(octokit.paginate).toHaveBeenCalledTimes(1)
      expect(octokit.issues.createLabel).toHaveBeenCalledTimes(0)
    })
})

describe('addLabelToIssue', () => {
  it('adds label to issue if issue does not already have label', async () => {
    const issue = {
      labels: [
        {
          name: 'label 1'
        },
        { name: 'label 2' }
      ]
    }

    let octokit = {
      issues: {
        addLabels: jest.fn()
      }
    }

    const result = await helpers.addLabelToIssue(
      octokit,
      'adamzolyak',
      'actions-playground',
      issue,
      'label 3'
    )

    expect(octokit.issues.addLabels).toHaveBeenCalledTimes(1)
  }),
    it('does not add label to issue if issue already has label', async () => {
      const issue = {
        labels: [
          {
            name: 'label 1'
          },
          { name: 'label 2' }
        ]
      }

      let octokit = {
        issues: {
          addLabels: jest.fn()
        }
      }

      const result = await helpers.addLabelToIssue(
        octokit,
        'adamzolyak',
        'actions-playground',
        issue,
        'label 1'
      )

      expect(octokit.issues.addLabels).toHaveBeenCalledTimes(0)
    })
})

describe('getTopIssues', () => {
  it('gets 3 top issues order from most to least reactions', async () => {
    const issues = [
      {
        number: 10,
        title: 'orange',
        reactions: {
          '+1': 3
        }
      },
      {
        number: 11,
        title: 'blue',
        reactions: {
          '+1': 4
        }
      },
      {
        number: 12,
        title: 'red',
        reactions: {
          '+1': 5
        }
      },
      {
        number: 13,
        title: 'green',
        reactions: {
          '+1': 2
        }
      },
      {
        number: 14,
        title: 'purple',
        reactions: {
          '+1': 0
        }
      },
      {
        number: 15,
        title: 'black',
        reactions: {
          '+1': 1
        }
      }
    ]

    const result = await helpers.getTopIssues(issues, '+1', '3')

    expect(result[0].title).toBe('red')
    expect(result[1].title).toBe('blue')
    expect(result[2].title).toBe('orange')
    expect(result).toHaveLength(3)
  }),
    it('gets 2 top issues order from most to least reactions', async () => {
      const issues = [
        {
          number: 10,
          title: 'orange',
          reactions: {
            '+1': 3
          }
        },
        {
          number: 11,
          title: 'blue',
          reactions: {
            '+1': 4
          }
        },
        {
          number: 12,
          title: 'red',
          reactions: {
            '+1': 5
          }
        },
        {
          number: 13,
          title: 'green',
          reactions: {
            '+1': 2
          }
        },
        {
          number: 14,
          title: 'purple',
          reactions: {
            '+1': 0
          }
        },
        {
          number: 15,
          title: 'black',
          reactions: {
            '+1': 1
          }
        }
      ]

      const result = await helpers.getTopIssues(issues, '+1', '2')

      expect(result[0].title).toBe('red')
      expect(result[1].title).toBe('blue')
      expect(result).toHaveLength(2)
    })
})

describe('pruneOldLabels', () => {
  it('removes labels from issues that are no longer top issues that have the top issue label', async () => {
    const issuesToLabel = [
      {
        number: 10,
        title: 'orange',
        labels: [
          {
            name: 'label 1'
          }
        ],
        reactions: {
          '+1': 3
        }
      },
      {
        number: 11,
        title: 'blue',
        labels: [
          {
            name: 'label 1'
          }
        ],
        reactions: {
          '+1': 2
        }
      }
    ]

    const issuesWithLabel = [
      {
        number: 11,
        title: 'blue',
        labels: [
          {
            name: 'label 1'
          }
        ],
        reactions: {
          '+1': 2
        }
      },
      {
        number: 12,
        title: 'aqua',
        labels: [
          {
            name: 'label 1'
          }
        ],
        reactions: {
          '+1': 1
        }
      },
      {
        number: 13,
        title: 'brown',
        labels: [
          {
            name: 'label 1'
          }
        ],
        reactions: {
          '+1': 1
        }
      }
    ]

    let octokit = {
      issues: {
        removeLabel: jest.fn()
      }
    }

    const result = await helpers.pruneOldLabels(
      octokit,
      'adamzolyak',
      'actions-playground',
      issuesToLabel,
      issuesWithLabel,
      'label 1'
    )

    expect(octokit.issues.removeLabel).toHaveBeenCalledTimes(2)
    expect(octokit.issues.removeLabel.mock.calls[0][0].issue_number).toBe(12)
    expect(octokit.issues.removeLabel.mock.calls[1][0].issue_number).toBe(13)
  })
})
