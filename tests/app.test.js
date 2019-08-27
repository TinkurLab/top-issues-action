const app = require('../app')
const helpers = require('../helpers')

jest.mock('../helpers')

describe('labelTopIssues', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('should label top 3 issues', async () => {
    helpers.createLabelInRepo = jest.fn()
    helpers.getIssues = jest.fn(() => issues)
    helpers.getTopIssues = jest.fn(() => topIssues)
    helpers.addLabelToIssue = jest.fn()
    helpers.pruneOldLabels = jest.fn()

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

    const topIssues = [
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
      }
    ]

    await app.labelTopIssues()

    expect(helpers.createLabelInRepo).toHaveBeenCalledTimes(1)
    expect(helpers.getIssues).toHaveBeenCalledTimes(2)
    expect(helpers.addLabelToIssue).toHaveBeenCalledTimes(3)
    expect(helpers.pruneOldLabels).toHaveBeenCalledTimes(1)
  })
})
