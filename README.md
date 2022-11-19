# 👍 Top Issues Labeler - GitHub Action

A [GitHub Action](https://github.com/features/actions) that labels issues with the most 👍s (+1s) reactions in your repo.

## How It Works

This GitHub Action runs on a configurable schedule (cron) in your GitHub repo. The Action labels top issues and unlabels issues that are no longer top issues. Top issues are issues with the most "+1" emoji reactions on the issue description. "+1" emoji reactions on issues comments are not considered.

## Examples

Example of label applied in issue list:
![GitHub Logo](./docs/issue_list.png)

Example of label applied in issue detail:
![GitHub Logo](./docs/issue_detail.png)

## Installation

To use this GitHub Action, you must have access to [GitHub Actions](https://github.com/features/actions) Actions Beta.

To setup this action:

1. Create a `.github/worksflows/main.yml` in your GitHub repo ([more info](https://help.github.com/en/articles/configuring-a-workflow)).
2. Add the following code to the `main.yml` file and commit it to the repo's `master` branch.

```
name: Label Top Issues

on:
  schedule:
  - cron:  '15 0-23 * * *'

jobs:
  labelTopIssues:
    name: Label Top Issues
    runs-on: ubuntu-latest
    steps:
    - name: Label Issues
      uses: tinkurlab/top-issues-action@master
      env:
        GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
        TOP_NUMBER_OF_ISSUES: 10
        TOP_LABEL_NAME: "👍 Top 10 Issue!"
        TOP_LABEL_COLOR: f442c2
```

Update `TOP_NUMBER_OF_ISSUES`, `TOP_LABEL_NAME`, and `TOP_LABEL_COLOR` variables with desired values.

Update the `cron` schedule as desired. The above example runs on the 15th minute of every hour. See [Scheduling a Workflow](https://developer.github.com/actions/managing-workflows/creating-and-cancelling-a-workflow/#scheduling-a-workflow) for more info.

## Contributing

If you have suggestions for how this GitHub Action could be improved, or want to report a bug, open an issue! Or pull request! We'd love all and any contributions. For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

[ISC](LICENSE) © 2022 Adam Zolyak <adam@tinkurlab.com> (www.tinkurlab.com)

![analytics](https://grabify.link/NWXXY4)
