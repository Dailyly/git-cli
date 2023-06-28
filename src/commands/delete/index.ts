import simpleGit from 'simple-git'
import Spinner from '../../utils/spinner'
import chalk from 'chalk'
import inquirer from 'inquirer'

const git = simpleGit()

const del = (): void => {
  git.branchLocal().then((res) => {
    const { all, current } = res
    inquirer
      .prompt([
        {
          type: 'checkbox',
          name: 'devBranchs',
          message: 'Which branchs do you want to select?',
          choices: all.map((branch) => ({
            name:
              branch === current
                ? chalk.red(`${branch}（当前分支）`)
                : `${branch}`,
            disabled: branch === current,
          })),
        },
      ])
      .then((answers) => {
        const { devBranchs } = answers
        inquirer
          .prompt([
            {
              type: 'confirm',
              name: 'askAgain',
              message:
                'Confirm to delete selected branchs (just hit enter for YES)?',
              default: true,
            },
          ])
          .then((answers) => {
            const { askAgain } = answers
            if (askAgain) {
              Spinner.start('正在删除')
              git.deleteLocalBranches(devBranchs).then(() => {
                Spinner.stop(true)
                console.log(chalk.green('删除成功！'))
              })
            }
          })
      })
  })
}

export default del
